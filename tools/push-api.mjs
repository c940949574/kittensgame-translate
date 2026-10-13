#!/usr/bin/env node
/**
 * push-api.mjs — 通过 GitHub REST API 推送整个仓库。
 *
 * 为什么需要它：部分网络环境下 `git push` 会握手失败
 * （schannel: server closed abruptly），而 API 走的是另一条链路，可用。
 * 本脚本按 Git Data API 的标准四步走：
 *   blob（每个文件）→ tree → commit → ref
 *
 * 只推送 git 已跟踪的文件（git ls-files），因此 .gitignore 里的缓存与
 * 实验产物天然被排除；内容与远端相同的 blob 会跳过，省一次请求。
 *
 * 用法：
 *   node tools/push-api.mjs --dry-run
 *   node tools/push-api.mjs
 *
 * 环境变量：
 *   GITHUB_TOKEN / KG_GITHUB_TOKEN   令牌（否则回退到本地 token 文件）
 *   KG_REPO_OWNER / KG_REPO_NAME     目标仓库（默认 c940949574/Kittensgame-translate）
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");

const OWNER = process.env.KG_REPO_OWNER ?? "c940949574";
const REPO = process.env.KG_REPO_NAME ?? "Kittensgame-translate";
const TOKEN_FILE = "E:/FFMPEG/ks-pr/token/KS_TOKEN.txt";

function resolveToken() {
	const fromEnv = process.env.GITHUB_TOKEN ?? process.env.KG_GITHUB_TOKEN;
	if (fromEnv) return fromEnv.trim();
	if (!fs.existsSync(TOKEN_FILE)) {
		throw new Error(`没有令牌：设置 GITHUB_TOKEN，或准备 ${TOKEN_FILE}`);
	}
	const lines = fs
		.readFileSync(TOKEN_FILE, "utf8")
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line && !line.startsWith("#"));
	const last = lines[lines.length - 1];
	if (last.startsWith("github_pat_") || last.startsWith("ghp_")) return last;
	return Buffer.from(last, "base64").toString("utf8").trim();
}

const headers = () => ({
	Authorization: `Bearer ${resolveToken()}`,
	Accept: "application/vnd.github+json",
	"User-Agent": "kg-translate-push",
	"X-GitHub-Api-Version": "2022-11-28",
	"Content-Type": "application/json",
});

async function api(method, endpoint, body) {
	const response = await fetch(`https://api.github.com${endpoint}`, {
		method,
		headers: headers(),
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	const text = await response.text();
	if (!response.ok) {
		throw new Error(`${method} ${endpoint} → HTTP ${response.status}\n${text.slice(0, 400)}`);
	}
	return text ? JSON.parse(text) : {};
}

const message =
	process.env.KG_COMMIT_MESSAGE?.trim() ||
	`docs: sync ${new Date().toISOString().slice(0, 10)}

Pushed with tools/push-api.mjs (Git Data API), because git push is
unreachable from this machine.`;

async function main() {
	const files = execFileSync("git", ["ls-files", "-z"], {
		cwd: ROOT,
		encoding: "utf8",
	})
		.split("\0")
		.filter(Boolean);

	console.log(`目标仓库：${OWNER}/${REPO}`);
	console.log(`待推送文件：${files.length} 个`);
	if (dryRun) {
		for (const file of files) console.log(`  ${file}`);
		console.log("\n[dry-run] 未做任何写操作。");
		return;
	}

	const repoInfo = await api("GET", `/repos/${OWNER}/${REPO}`);
	const branch = repoInfo.default_branch ?? "main";

	// 远端现状：父提交（parents 用）与基线树（base_tree 用）是两个不同的 sha，
	// 别混用——GitHub 会以 422 拒绝 "Parent SHA does not exist"。
	let parentCommit;
	let baseTree;
	try {
		const ref = await api(
			"GET",
			`/repos/${OWNER}/${REPO}/git/ref/heads/${branch}`,
		);
		parentCommit = ref.object.sha;
		const commit = await api(
			"GET",
			`/repos/${OWNER}/${REPO}/git/commits/${parentCommit}`,
		);
		baseTree = commit.tree?.sha;
		console.log(
			`远端已有分支 ${branch}：commit ${parentCommit.slice(0, 8)} / tree ${String(baseTree).slice(0, 8)}`,
		);
	} catch {
		console.log(`远端没有分支 ${branch}，将创建`);
	}

	// 1) blobs（内容相同的跳过）
	// 本地算 blob sha（Git 的 blob 哈希：sha1("blob <长度>\0" + 内容)），与远端比对，
	// 内容没变的文件直接跳过，省一次 API 请求。
	const entries = [];
	for (const file of files) {
		const content = fs.readFileSync(path.join(ROOT, file));
		const sha = createHash("sha1")
			.update(`blob ${content.length}\0`)
			.update(content)
			.digest("hex");
		entries.push({ path: file, mode: "100644", type: "blob", sha });
	}

	// 只提交内容真正变化的文件（拿远端 tree 的 sha 比对）
	const changed = [];
	if (baseTree) {
		const remoteTree = await api(
			"GET",
			`/repos/${OWNER}/${REPO}/git/trees/${baseTree}?recursive=1`,
		);
		const remoteByPath = new Map(remoteTree.tree.map((n) => [n.path, n.sha]));
		for (const entry of entries) {
			if (remoteByPath.get(entry.path) === entry.sha) continue;
			changed.push(entry);
		}
	} else {
		changed.push(...entries);
	}
	console.log(
		`内容比对：${entries.length} 个文件检查完毕，${changed.length} 个有变化` +
			(0 === changed.length ? "（无需推送）" : ""),
	);
	if (0 === changed.length) return;

	const blobs = [];
	for (const entry of changed) {
		const content = fs.readFileSync(path.join(ROOT, entry.path));
		const blob = await api("POST", `/repos/${OWNER}/${REPO}/git/blobs`, {
			content: content.toString("base64"),
			encoding: "base64",
		});
		blobs.push({ path: entry.path, mode: "100644", type: "blob", sha: blob.sha });
		process.stdout.write(`  blob ${entry.path}\r\n`);
	}

	// 2) tree
	const tree = await api("POST", `/repos/${OWNER}/${REPO}/git/trees`, {
		base_tree: baseTree,
		tree: blobs,
	});

	// 3) commit
	const commit = await api("POST", `/repos/${OWNER}/${REPO}/git/commits`, {
		message,
		tree: tree.sha,
		parents: parentCommit ? [parentCommit] : [],
	});

	// 4) ref
	try {
		await api("PATCH", `/repos/${OWNER}/${REPO}/git/refs/heads/${branch}`, {
			sha: commit.sha,
			force: false,
		});
	} catch (error) {
		if (!String(error).includes("404")) throw error;
		await api("POST", `/repos/${OWNER}/${REPO}/git/refs`, {
			ref: `refs/heads/${branch}`,
			sha: commit.sha,
		});
	}

	console.log(`\n已推送 ${blobs.length} 个文件`);
	console.log(`commit ${commit.sha}`);
	console.log(`主页：https://github.com/${OWNER}/${REPO}`);
	console.log(
		`安装：https://raw.githubusercontent.com/${OWNER}/${REPO}/${branch}/dist/Kg-translate-zh-CN.user.js`,
	);
}

main().catch((error) => {
	console.error(error.message ?? error);
	process.exit(1);
});