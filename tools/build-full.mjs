#!/usr/bin/env node
/**
 * build-full.mjs — 生成「全量包」实验产物，用来回答一个具体问题：
 * 把游戏整张词表都塞进语言包，运行时代价到底有多大？
 *
 * 它不改动 locales/ 里的任何东西，而是：
 *   1. 取游戏 en.json 全部 key
 *   2. 值优先用目标语言的官方/社区层（crowdin/<lang>.json，zh 再加 res/i18n/zh.json）
 *   3. 官方缺的用语言包里已有的译文补上（我们的 77 条），再缺的标注为待翻占位
 *   4. 交给 build.mjs 同样的校验，然后输出到 dist/ 带 .full 标记
 *
 * 产物**不进 git**（见 .gitignore），它只是给你本地装来试手感的。
 * 跑完记得删：node tools/build-full.mjs --clean
 *
 * 用法：
 *   node tools/build-full.mjs zh-CN     # 生成 dist/kg-translate.zh-CN.full.user.js
 *   node tools/build-full.mjs pt-BR     # 零覆盖语言：整表都是待翻占位
 *   node tools/build-full.mjs --clean   # 清理实验产物
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES_DIR = path.join(ROOT, "locales");
const CACHE_DIR = path.join(ROOT, ".cache");
const DIST_DIR = path.join(ROOT, "dist");

const arg = process.argv[2];
if (arg === "--clean") {
	let removed = 0;
	for (const name of fs.readdirSync(DIST_DIR)) {
		if (/-full\.user\.js$/.test(name)) {
			fs.unlinkSync(path.join(DIST_DIR, name));
			removed++;
		}
	}
	console.log(removed ? `已清理 ${removed} 个实验产物` : "没有实验产物需要清理");
	process.exit(0);
}
if (!arg) {
	console.error("用法：node tools/build-full.mjs <lang> | --clean");
	process.exit(1);
}
const lang = arg;

/** 与 verify.mjs 相同的取层逻辑（保持两边判定一致）。 */
const layersFor = (code) => {
	if (code === "zh" || code === "zh-CN") {
		return ["res/i18n/zh.json", "res/i18n/crowdin/zh.json"];
	}
	const primary = String(code).split("-")[0].toLowerCase();
	return [`res/i18n/crowdin/${primary}.json`];
};

const getJSON = async (url, cacheName) => {
	const cacheFile = path.join(CACHE_DIR, `${cacheName}.json`);
	try {
		const response = await fetch(url, { cache: "no-store" });
		if (response.status === 404) return {};
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		const text = await response.text();
		fs.writeFileSync(cacheFile, text);
		return JSON.parse(text);
	} catch (error) {
		if (fs.existsSync(cacheFile)) return JSON.parse(fs.readFileSync(cacheFile, "utf8"));
		console.warn(`⚠ ${url} 拉取失败（${error.message}）`);
		return {};
	}
};

const BASE = "https://kittensgame.com/web/";
const game = {
	...(await getJSON(`${BASE}res/i18n/en.json`, "en.web.en")),
	...(await getJSON(`${BASE}beta/res/i18n/en.json`, "en.beta.en")),
};
const official = {};
for (const layer of layersFor(lang)) {
	Object.assign(
		official,
		await getJSON(`${BASE}beta/${layer}`, `en.beta.${lang}.${layer.replace(/\//g, "_")}`),
	);
}

// 语言包代号映射：zh-CN -> zh-CN.json；不存在就用 code 同名文件
const packFile = ["zh", "zh-CN"].includes(lang) ? "zh-CN.json" : `${lang}.json`;
const packPath = path.join(LOCALES_DIR, packFile);
if (!fs.existsSync(packPath)) {
	console.error(`找不到语言包 ${packFile}，请先 node tools/new-locale.mjs ${lang}`);
	process.exit(1);
}
const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));

const allKeys = Object.keys(game);
const fromOfficial = [];
const fromPack = [];
const todo = [];
for (const key of allKeys) {
	const mine = pack.i18n?.[key];
	if (typeof mine === "string" && mine !== game[key]) {
		// 我们自己的译文优先（它是精选的，官方可能是机翻或旧版）
		fromPack.push([key, mine]);
		continue;
	}
	const off = official[key];
	if (typeof off === "string" && off !== game[key] && off.trim() !== "" && off !== "TBD") {
		fromOfficial.push([key, off]);
		continue;
	}
	todo.push(key);
}

const i18n = Object.fromEntries(
	[...fromPack, ...fromOfficial].sort((a, b) => a[0].localeCompare(b[0])),
);

const full = {
	...pack,
	meta: {
		...pack.meta,
		code: `${pack.meta.code}-full`,
		name: `${pack.meta.name} (full-table experiment)`,
		description:
			"全量词表实验包：把游戏整张表都接管，用于实测运行开销。不是正式发布产物。",
		version: undefined,
	},
	i18n,
};

fs.mkdirSync(CACHE_DIR, { recursive: true });
const tmpFile = path.join(LOCALES_DIR, `${pack.meta.code}-full.json`);
fs.writeFileSync(tmpFile, `${JSON.stringify(full, null, 2)}\n`);

console.log(`全量包草稿：${path.relative(ROOT, tmpFile)}`);
console.log(
	`  游戏词表 ${allKeys.length} 条 = 语言包精选 ${fromPack.length} 条 + 官方/社区 ${fromOfficial.length} 条 + 仍待翻译 ${todo.length} 条`,
);
if (0 < todo.length) {
	console.log(`  待翻前 10：`);
	for (const key of todo.slice(0, 10)) console.log(`    - ${key}`);
}

// 交给 build.mjs 构建（它会做结构校验）
const { execFileSync } = await import("node:child_process");
const out = execFileSync(
	process.execPath,
	[path.join(ROOT, "tools/build.mjs"), full.meta.code],
	{ cwd: ROOT, encoding: "utf8" },
);
console.log(out.trim());
fs.unlinkSync(tmpFile);
console.log("\n装它：把 dist 里带 .full. 的 user.js 拖进 Tampermonkey");
console.log(`清理：node tools/build-full.mjs --clean`);
