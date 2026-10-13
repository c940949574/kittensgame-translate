#!/usr/bin/env node
/**
 * new-locale.mjs — 生成一种新语言的空白语言包骨架。
 *
 * 用法：
 *   node tools/new-locale.mjs ja-JP
 *   node tools/new-locale.mjs ja-JP "日本語" "Japanese"
 *
 * 之后：
 *   1. 填 locales/<code>.json 的 i18n / data / dom
 *   2. node tools/verify.mjs <code>     # 看还差哪些
 *   3. node tools/build.mjs <code>      # 生成可安装的 .user.js
 *   4. 提交 PR
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES_DIR = path.join(ROOT, "locales");

const [code, nativeName, englishName] = process.argv.slice(2);
if (!code) {
	console.error("用法：node tools/new-locale.mjs <code> [本语言名] [English name]");
	console.error("例：node tools/new-locale.mjs ja-JP 日本語 Japanese");
	process.exit(1);
}
if (!/^[a-z]{2,3}(-[A-Za-z0-9]{2,4})?$/.test(code)) {
	console.error(`语言代码格式不对：${code}（应形如 ja-JP / pt-BR / zh-CN）`);
	process.exit(1);
}

const target = path.join(LOCALES_DIR, `${code}.json`);
if (fs.existsSync(target)) {
	console.error(`已存在，不覆盖：${target}`);
	process.exit(1);
}

const primary = code.split("-")[0];

const locale = {
	meta: {
		code,
		name: englishName ?? code,
		nativeName: nativeName ?? code,
		description: `Kittens Game 本体翻译补丁（${nativeName ?? code}）`,
		// match = 只在游戏语言是该语言时启用；想"无视游戏语言强制翻译"改成 force
		mode: "match",
		languages: [primary, code],
		author: "",
		license: "CC BY-SA 4.0",
		version: "0.1.0",
		source: "community",
	},
	i18n: {
		// 跑 `node tools/verify.mjs <code>` 拿到待补 key 清单，逐条填
	},
	data: {
		badges: {
			// "lotus": { "title": "…", "description": "…" }
		},
		map: { maps: {}, biomes: {}, fauna: {} },
	},
	dom: {
		exact: [],
		fragment: [],
		regex: [],
	},
};

fs.writeFileSync(target, `${JSON.stringify(locale, null, 2)}\n`);
console.log(`已创建 ${path.relative(ROOT, target)}`);
console.log(`下一步：node tools/verify.mjs ${code}   # 看待补清单`);
console.log(`        node tools/build.mjs  ${code}   # 生成 dist/kg-translate.${code}.user.js`);
