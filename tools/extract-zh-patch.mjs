#!/usr/bin/env node
/**
 * extract-zh-patch.mjs — 从旧版单体汉化补丁（`kitten-game-zh-patch.user.js`）
 * 抽出语言包 JSON，迁入本项目的 locales/ 体系。
 *
 * 为什么需要它：早期的补丁把中文直接硬编码在一个 IIFE 里，词条与引擎耦合。
 * 本项目把它拆成「语言（locales/*.json）+ 引擎（src/*.js）」，所以需要一次性
 * 把词条搬过来。搬完之后，旧补丁不再是本项目的依赖，保留本脚本只为了让
 * 「词条从哪来」可追溯、可复现。
 *
 * 用法：
 *   node tools/extract-zh-patch.mjs [旧补丁路径] [输出路径]
 *   默认：E:/FFMPEG/kitten-game-zh-patch.user.js -> locales/zh-CN.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
	process.argv[2] ?? "E:/FFMPEG/kitten-game-zh-patch.user.js";
const OUT = process.argv[3] ?? path.join(ROOT, "locales/zh-CN.json");

/**
 * 取出 `const NAME = {...};` 的值。
 *
 * 用大括号配平截取，再交给 `new Function` 求值——比正则解析可靠，
 * 注释、模板字符串、正则字面量都能原样保留。
 */
function grabConstant(source, name) {
	const marker = `const ${name} = `;
	const start = source.indexOf(marker);
	if (start < 0) {
		throw new Error(`补丁里找不到常量 ${name}`);
	}
	let index = source.indexOf("{", start);
	let depth = 0;
	for (; index < source.length; index++) {
		const char = source[index];
		if (char === "{") depth++;
		else if (char === "}") {
			depth--;
			if (depth === 0) {
				index++;
				break;
			}
		}
	}
	const literal = source.slice(start + "const ".length, index);
	// eslint-disable-next-line no-new-func
	return new Function(`return ${literal};`)();
}

const source = fs.readFileSync(SRC, "utf8");
const version = source.match(/@version\s+(\S+)/)?.[1] ?? "unknown";

const i18n = grabConstant(source, "PATCH");
const badges = grabConstant(source, "BADGES");
const mapMaps = grabConstant(source, "MAP_MAPS");
const mapBiomes = grabConstant(source, "MAP_BIOMES");
const mapFauna = grabConstant(source, "MAP_FAUNA");
const domExact = grabConstant(source, "DOM_EXACT");
const domFragment = grabConstant(source, "DOM_FRAGMENT");
const domRegex = grabConstant(source, "DOM_REGEX");

const locale = {
	meta: {
		code: "zh-CN",
		name: "Simplified Chinese",
		nativeName: "简体中文",
		/**
		 * force: 无论游戏界面语言是什么，都用本语言包覆盖 $I。
		 * match: 只在游戏语言命中 languages 时才启用。
		 * 对中文这类「社区翻译滞后于本体更新」的语言，force 最实用。
		 */
		mode: "force",
		languages: ["zh", "zh-CN"],
		source: `kitten-game-zh-patch.user.js v${version}`,
		license: "MIT",
	},
	i18n,
	data: {
		badges: Object.fromEntries(
			Object.entries(badges).map(([name, value]) => [
				name,
				{ title: value.title, description: value.description },
			]),
		),
		map: { maps: mapMaps, biomes: mapBiomes, fauna: mapFauna },
	},
	dom: {
		exact: domExact,
		fragment: domFragment,
		regex: domRegex.map(([pattern, replacement]) => [
			pattern.source,
			replacement,
			pattern.flags,
		]),
	},
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(locale, null, 2)}\n`);

console.log(`已写出 ${OUT}`);
console.log(
	`  i18n ${Object.keys(i18n).length} 条 / 徽章 ${Object.keys(locale.data.badges).length} 枚` +
		` / 群系 ${Object.keys(mapBiomes).length} 个 / 动物 ${Object.keys(mapFauna).length} 种` +
		` / DOM 规则 ${domExact.length + domFragment.length + domRegex.length} 条`,
);
