#!/usr/bin/env node
/**
 * build.mjs — 把引擎模板 + 语言包合成单文件 userscript。
 *
 * 单文件是硬性要求：油猴/Tampermonkey 安装的是 .user.js，而 userscript 无法
 * import 外部 JSON（除非用 @require 指向远端，那会让离线/审核变复杂）。
 * 所以每个语言构建出**自包含**的一份，语言之间互不依赖。
 *
 * 用法：
 *   node tools/build.mjs                 # 构建 locales/ 下所有语言
 *   node tools/build.mjs zh-CN           # 只构建指定语言
 *   node tools/build.mjs zh-CN --check   # 只做校验，不写文件（CI 用）
 *
 * 产物：dist/Kg-translate-<code>.user.js
 * 版本号取 language.json 的 meta.version，缺省用包内容的 SHA1 前 8 位。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES_DIR = path.join(ROOT, "locales");
const DIST_DIR = path.join(ROOT, "dist");
const ENGINE = path.join(ROOT, "src/kg-translate.core.js");
/** 产物文件名前缀，最终形如 Kg-translate-zh-CN.user.js */
const PRODUCT_PREFIX = "Kg-translate-";

/** 仓库信息：建好远端后改这里（也可以用环境变量覆盖）。 */
const REPO_OWNER = process.env.KG_REPO_OWNER ?? "c940949574";
const REPO_NAME = process.env.KG_REPO_NAME ?? "Kittensgame-translate";
const AUTHOR = process.env.KG_AUTHOR ?? "c940949574";

const argv = process.argv.slice(2);
const checkOnly = argv.includes("--check");
const requested = argv.filter((arg) => !arg.startsWith("--"));

const engine = fs.readFileSync(ENGINE, "utf8");

/** 语言包结构校验：字段缺失就早失败，别等构建完才发现少一半。 */
function validate(locale, file) {
	const problems = [];
	const { meta, i18n, data, dom } = locale;
	if (!meta?.code) problems.push("meta.code 缺失");
	if (!meta?.nativeName) problems.push("meta.nativeName 缺失（会显示在脚本名里）");
	if (meta && !["force", "match"].includes(meta.mode)) {
		problems.push(`meta.mode 必须是 force 或 match，当前 ${JSON.stringify(meta.mode)}`);
	}
	if (meta?.preferOfficial === true) {
		if (!meta.nativeScript) {
			problems.push("meta.preferOfficial 需要 meta.nativeScript（你的语言用什么字符？）");
		} else {
			try {
				// eslint-disable-next-line no-new
				new RegExp(meta.nativeScript, "u");
			} catch (error) {
				problems.push(`meta.nativeScript 不是合法正则：${error.message}`);
			}
		}
	}
	if (meta?.mode === "match" && !meta.languages?.length) {
		problems.push("mode=match 时必须给出 meta.languages");
	}
	if (!i18n || typeof i18n !== "object") problems.push("i18n 必须是对象");
	for (const [key, value] of Object.entries(i18n ?? {})) {
		if (typeof value !== "string") problems.push(`i18n["${key}"] 不是字符串`);
		if (/^[\s\S]*$/.test(value) && value.trim() === "") {
			problems.push(`i18n["${key}"] 是空串，等于没翻`);
		}
	}
	for (const bucket of ["badges", "map"]) {
		if (data && data[bucket] === undefined) {
			problems.push(`data.${bucket} 缺失（没有对应内容就写成 {}）`);
		}
	}
	for (const bucket of ["exact", "fragment", "regex"]) {
		if (dom && dom[bucket] !== undefined && !Array.isArray(dom[bucket])) {
			problems.push(`dom.${bucket} 必须是数组`);
		}
	}
	for (const [pattern, replacement, flags] of dom?.regex ?? []) {
		if (typeof replacement !== "string") problems.push(`dom.regex 中 ${pattern} 缺替换串`);
		if (flags !== undefined && typeof flags !== "string") {
			problems.push(`dom.regex 中 ${pattern} 的 flags 必须是字符串`);
		}
	}
	if (0 < problems.length) {
		console.error(`✗ ${file}`);
		for (const problem of problems) console.error(`    - ${problem}`);
		return false;
	}
	return true;
}

/** 今天（本地时区）的 YYYYMMDD。版本号就用「ver + 日期」，一眼看出什么时候构建的。 */
const todayStamp = () => {
	const now = new Date();
	const pad = (value) => String(value).padStart(2, "0");
	return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
};

function build(locale, file) {
	// 语言包里显式写了 meta.version 就用它，否则用 meta.base + 当天日期。
	// 例如 base 0.1.0 → @version 0.1.0-20261013（油猴按点分数字比较，能正确识别更新）。
	const base = String(locale.meta.base ?? locale.meta.version ?? "0.1.0")
		.split("-")[0];
	const version = locale.meta.version ?? `${base}-${todayStamp()}`;

	const header = [
		"// ==UserScript==",
		`// @name         KG Translate — ${locale.meta.nativeName} (${locale.meta.code})`,
		`// @namespace    https://github.com/${REPO_OWNER}/${REPO_NAME}`,
		`// @version      ${version}`,
		`// @description  ${locale.meta.description ?? `Kittens Game 本体翻译补丁（${locale.meta.nativeName}）`}`,
		`// @author       ${locale.meta.author ?? AUTHOR}`,
		`// @match        https://kittensgame.com/*`,
		`// @match        https://*.kittensgame.com/*`,
		// 从 Release 直装：latest 永远指向最新一次发布，油猴据此检查更新。
		`// @updateURL    https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest/download/Kg-translate-${locale.meta.code}.user.js`,
		`// @downloadURL  https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest/download/Kg-translate-${locale.meta.code}.user.js`,
		`// @run-at       document-start`,
		`// @grant        none`,
		`// @license      ${locale.meta.license ?? "MIT"}`,
		"// ==/UserScript==",
		"",
	].join("\n");

	const body = engine
		.split("\n")
		.filter((line) => !line.startsWith("// @") && !line.startsWith("// ==UserScript"))
		.join("\n")
		.replace(
			"// ==UserScript==\n",
			"/* 语言包在下方注入；本段为共用引擎 */\n",
		);

	// 用 JSON.stringify 内联，天然安全转义（不会因为译文里有 </script> 之类出事）
	const output = [
		header,
		`window.__KG_TRANSLATE_LOCALE__ = ${JSON.stringify(locale)};`,
		"",
		body,
	].join("\n");

	const target = path.join(DIST_DIR, `${PRODUCT_PREFIX}${locale.meta.code}.user.js`);
	if (checkOnly) {
		console.log(`✓ ${locale.meta.code} 结构校验通过（未写出，--check）`);
		return true;
	}
	fs.mkdirSync(DIST_DIR, { recursive: true });
	fs.writeFileSync(target, output);
	console.log(
		`✓ ${path.relative(ROOT, target)}  ${Buffer.byteLength(output)} 字节  v${version}`,
	);
	return true;
}

const files = fs
	.readdirSync(LOCALES_DIR)
	// 下划线开头的是脚手架/说明文件（_template.json），不是语言包
	.filter((name) => name.endsWith(".json") && !name.startsWith("_"))
	.map((name) => path.join(LOCALES_DIR, name));

let failed = false;
let built = 0;
for (const file of files) {
	const locale = JSON.parse(fs.readFileSync(file, "utf8"));
	if (requested.length && !requested.includes(locale.meta?.code)) continue;
	if (!validate(locale, path.relative(ROOT, file))) {
		failed = true;
		continue;
	}
	build(locale, file);
	built++;
}

if (0 === built) {
	console.error(
		`没有匹配到语言${requested.length ? `：${requested.join(", ")}` : ""}；locales/ 下现有：${files
			.map((f) => path.basename(f))
			.join(", ")}`,
	);
	process.exit(1);
}
process.exit(failed ? 1 : 0);
