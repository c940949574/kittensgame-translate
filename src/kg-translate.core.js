// ==UserScript==
// @name         KG Translate — __LOCALE_NAME__ (__LOCALE_CODE__)
// @name:en      KG Translate — __LOCALE_NAME__ (__LOCALE_CODE__)
// @namespace    https://github.com/__REPO_OWNER__/kg-translate
// @version      __VERSION__
// @description  __LOCALE_DESC__
// @author       __AUTHOR__
// @match        https://kittensgame.com/*
// @match        https://*.kittensgame.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

/**
 * KG Translate — 通用 Kittens Game 本体汉化框架（引擎部分）
 *
 * ⚠️ 这份文件是**构建产物**的模板，不要直接改它。
 * 源文件：src/kg-translate.core.js（引擎） + locales/<code>.json（词条）
 * 重新生成：node tools/build.mjs <locale>
 *
 * ── 引擎的职责边界 ──────────────────────────────────────────────
 * 引擎本身**不含任何语言知识**：它不知道什么是「勋章」「群系」，也不知道
 * 任何一条具体译文。所有内容都来自构建时注入的 LOCALE 对象。
 * 这样加一种新语言 = 加一个 locales/xx.json，不需要碰引擎。
 *
 * ── 为什么不用「改翻译文件」的方式 ─────────────────────────────
 * 游戏的语言加载链是 en.json → zh.json → crowdin/zh.json，最后一层覆盖前面。
 * 社区翻译往往滞后于本体更新，且被采纳的条目有限。本脚本在游戏启动前
 * 接管全局翻译函数 $I，并持续复查 i18n 层（游戏会分多次合并语言层，
 * 只打一次补丁会被后来的层顶掉）。
 *
 * ── 三层机制 ───────────────────────────────────────────────────
 * 1) i18n 层：接管 $I + 持续写入 window.i18nLang.messages
 * 2) 数据层：改写游戏数据对象上**没有 i18n key** 的硬编码文本
 *    （如成就徽章、村庄地图的群系与动物名）
 * 3) UI 层：渲染后扫描文本节点，替换拼进 innerHTML 的死字符串
 * ────────────────────────────────────────────────────────────────
 */
(function () {
	"use strict";

	/** 构建时注入的语言包，见 tools/build.mjs。 */
	const LOCALE = window.__KG_TRANSLATE_LOCALE__;
	if (!LOCALE || !LOCALE.meta) {
		console.warn("[kg-translate] 语言包缺失，请从 Releases 下载对应语言版本。");
		return;
	}

	const TAG = `[kg-translate:${LOCALE.meta.code}]`;

	// ── 语言匹配 ──────────────────────────────────────────────────
	/**
	 * 是否应该启用本语言包。
	 *
	 * mode = "force"：无条件启用（适合 zh 这类"本体译文滞后、玩家就是想看
	 *   译文"的场景；游戏界面语言是英文时也照样翻）。
	 * mode = "match"：仅当游戏语言命中 meta.languages 时启用（适合只想补充
	 *   官方缺漏、不想覆盖已有官方译文的社区语言）。
	 */
	const languageTag = () => {
		const lang = window.i18nLang;
		if (!lang) return undefined;
		return lang.language || undefined;
	};

	const isTargetLocale = () => {
		if (LOCALE.meta.mode !== "match") return true;
		const current = languageTag();
		if (!current) return false;
		const wanted = LOCALE.meta.languages ?? [];
		return wanted.some(
			(tag) => current === tag || String(current).startsWith(`${tag}-`),
		);
	};

	// ── 第 1 层：i18n ─────────────────────────────────────────────

	const I18N = LOCALE.i18n ?? {};
	let originalI18n = null;

	// ── 可选：优先采用官方译文（preferOfficial）──────────────────
	//
	// force 模式会盖住一切，包括社区将来补上的好译文。想两者兼得：
	//
	//   "mode": "force",
	//   "preferOfficial": true,
	//   "nativeScript": "[\\u3040-\\u30ff\\u4e00-\\u9fff]"   // 我的语言用什么字符
	//
	// 判据是「官方值里有没有我的语言的字符」：没有就说明官方那边其实还是
	// 英文/原文（或者只是缩写），这时用我的译文。纯符号与数字两边都匹配不
	 // 到，落到默认分支，不影响结果。
	//
	// 局限：目标语言与英文共用字母表时（如印尼语借词）判据偏弱；这种语言
	// 建议保持默认关闭。
	const NATIVE_SCRIPT = LOCALE.meta.nativeScript
		? new RegExp(LOCALE.meta.nativeScript, "u")
		: null;
	const PREFER_OFFICIAL =
		true === LOCALE.meta.preferOfficial && null !== NATIVE_SCRIPT;

	/** 官方这条看起来是真译文（而不是英文原文/占位符）吗？ */
	const officialLooksTranslated = (native) => {
		if (!PREFER_OFFICIAL) return false;
		if (typeof native !== "string" || native === "") return false;
		return NATIVE_SCRIPT.test(native);
	};

	/**
	 * 与游戏原生 $I 行为一致：先取官方译文，再用语言包覆盖。
	 * 官方译文里可能含「Alicorn腐败」这类半成品，所以判断依据是
	 * 「语言包有没有这条 key」，而不是「译文里有没有中文」。
	 */
	function patchedI18n(key, args) {
		const native =
			typeof originalI18n === "function" ? originalI18n(key, args) : key;
		if (!isTargetLocale() || !Object.hasOwn(I18N, key)) {
			return native;
		}
		// 官方确实是译文 → 听官方的
		if (officialLooksTranslated(native)) {
			return native;
		}
		let message = I18N[key];
		if (args) {
			for (let index = 0; index < args.length; index++) {
				message = message.split(`{${index}}`).join(args[index]);
			}
		}
		return message;
	}

	// 游戏里是 `$I = function (key, args) {...}` 这种全局赋值，用 setter 拦下来。
	try {
		Object.defineProperty(window, "$I", {
			configurable: true,
			get() {
				return patchedI18n;
			},
			set(value) {
				originalI18n = value;
			},
		});
	} catch (error) {
		console.warn(`${TAG} 无法接管 $I：`, error);
	}

	let i18nPatchedTotal = 0;
	let dataPatchedTotal = 0;
	let domPatchedTotal = 0;

	const setValue = (object, key, value) => {
		if (!object || value === undefined || object[key] === value) return 0;
		object[key] = value;
		return 1;
	};

	/**
	 * 持续复查 i18n 层。
	 *
	 * 不能「成功一次就停」：游戏会分多次加载/合并语言层，后加载的一层会把
	 * 我们写进去的值覆盖回原文。代价只是每 500ms 比对几十个 key，可忽略。
	 */
	const patchMessages = () => {
		const lang = window.i18nLang;
		if (!lang || !lang.messages) return;
		if (Object.keys(lang.messages).length < 200) return; // 还没加载完
		if (!isTargetLocale()) return;

		let patched = 0;
		for (const key of Object.keys(I18N)) {
			const current = lang.messages[key];
			// 官方确实是译文时保持原样（preferOfficial）
			if (current === I18N[key] || officialLooksTranslated(current)) {
				continue;
			}
			lang.messages[key] = I18N[key];
			patched++;
		}
		if (0 < patched) {
			i18nPatchedTotal += patched;
			console.info(`${TAG} 本轮补齐 ${patched} 条（累计 ${i18nPatchedTotal}）`);
		}
	};

	// ── 第 2 层：数据层 ──────────────────────────────────────────
	//
	// 徽章、地图群系这一类**根本没有 i18n key**，只靠 $I 碰不到。
	// 好在它们的面板每次刷新都直接从数据对象重绘 DOM（update() 逐字段比对），
	// 所以改数据层一次即长期生效，无需扫描 DOM。仍然持续复查，防任何机制
	// 把对象换掉（读档 / resetState）。

	const translateList = (list, table) => {
		if (!Array.isArray(list)) return 0;
		let changed = 0;
		for (let index = 0; index < list.length; index++) {
			const translated = table[list[index]];
			if (translated && translated !== list[index]) {
				list[index] = translated;
				changed++;
			}
		}
		return changed;
	};

	const patchData = () => {
		if (!isTargetLocale()) return;
		const achievements = window.game?.achievements;
		const village = window.game?.village;
		if (!achievements && !village) return;

		let patched = 0;

		// 成就徽章：title 打在图标上，description 是 tooltip。
		const badges = LOCALE.data?.badges;
		if (badges && Array.isArray(achievements?.badges)) {
			for (const badge of achievements.badges) {
				const translation = badge && badges[badge.name];
				if (!translation) continue;
				patched += setValue(badge, "title", translation.title);
				patched += setValue(badge, "description", translation.description);
			}
		}

		// 村庄地图：地图 / 群系 / 野生动物。
		const mapData = LOCALE.data?.map;
		const map = village?.map;
		if (mapData && map) {
			for (const entry of map.maps ?? []) {
				const translation = mapData.maps?.[entry.name];
				if (!translation) continue;
				patched += setValue(entry, "title", translation.title);
				patched += setValue(entry, "description", translation.description);
			}
			for (const biome of map.biomes ?? []) {
				const translation = mapData.biomes?.[biome.name];
				if (!translation) continue;
				patched += setValue(biome, "title", translation.title);
				patched += setValue(biome, "desc", translation.desc);
				patched += setValue(biome, "description", translation.description);
				for (const level of Object.keys(translation.lore ?? {})) {
					const lore = biome.lore ?? (biome.lore = {});
					patched += setValue(lore, level, translation.lore[level]);
					// 有些群系把 lore 写在对象根上（少一层 lore），一并覆盖。
					if (typeof biome[level] === "string") {
						patched += setValue(biome, level, translation.lore[level]);
					}
				}
				patched += translateList(biome.faunaNames, mapData.fauna ?? {});
				// 已经刷出来的动物，名字当时就取好了，得单独改。
				for (const fauna of biome.fauna ?? []) {
					const name = mapData.fauna?.[fauna?.title];
					if (name) patched += setValue(fauna, "title", name);
				}
			}
			patched += translateList(map.defaultFaunaNames, mapData.fauna ?? {});
		}

		if (0 < patched) {
			dataPatchedTotal += patched;
			console.info(`${TAG} 本轮汉化数据层 ${patched} 处（累计 ${dataPatchedTotal}）`);
		}
	};

	// ── 第 3 层：UI 文本节点 ────────────────────────────────────
	//
	// 面板上剩下的 "Maps"、"HP:"、"ATK:"、"You have killed ..." 一类是拼进
	// innerHTML 的死字符串，既无 key 也不调 $I，只能渲染后扫文本节点。

	const DOM = LOCALE.dom ?? {};
	const DOM_EXACT = DOM.exact ?? [];
	const DOM_FRAGMENT = DOM.fragment ?? [];
	const DOM_REGEX = (DOM.regex ?? []).map(
		([pattern, replacement, flags]) => [new RegExp(pattern, flags), replacement],
	);
	const LATIN = /[A-Za-z]/;

	const isSkippable = (node) => {
		const parent = node.parentElement;
		if (!parent) return true;
		const tag = parent.tagName;
		return (
			tag === "SCRIPT" ||
			tag === "STYLE" ||
			tag === "TEXTAREA" ||
			parent.isContentEditable
		);
	};

	const translateTextNode = (node) => {
		if (!isTargetLocale()) return false;
		const value = node.nodeValue;
		if (!value || !LATIN.test(value) || isSkippable(node)) return false;

		let next = value;
		if (value === value.trim()) {
			for (const [from, to] of DOM_EXACT) {
				if (value === from) {
					next = to;
					break;
				}
			}
		}
		for (const [pattern, replacement] of DOM_REGEX) {
			next = next.replace(pattern, replacement);
		}
		for (const [from, to] of DOM_FRAGMENT) {
			if (next.includes(from)) next = next.split(from).join(to);
		}
		if (next === value) return false;
		node.nodeValue = next;
		return true;
	};

	const translateTree = (root) => {
		if (!root || root.nodeType !== 1) return;
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
		let node = walker.nextNode();
		while (node) {
			translateTextNode(node);
			node = walker.nextNode();
		}
	};

	const translateNode = (node) => {
		if (!node) return;
		if (node.nodeType === 3) {
			translateTextNode(node);
			return;
		}
		translateTree(node);
	};

	// 只处理变动节点：游戏每 tick 都会重写数值，全量遍历太浪费。
	const observer = new MutationObserver((records) => {
		for (const record of records) {
			if (record.type === "characterData") {
				if (translateTextNode(record.target)) domPatchedTotal++;
				continue;
			}
			for (const added of record.addedNodes) translateNode(added);
		}
	});

	let observing = false;
	const startObserver = () => {
		if (!document.documentElement) return false;
		observer.observe(document.documentElement, {
			childList: true,
			subtree: true,
			characterData: true,
		});
		translateTree(document.documentElement);
		return true;
	};

	// ── 主循环 ───────────────────────────────────────────────────
	let round = 0;
	const timer = setInterval(() => {
		patchMessages();
		patchData();
		if (!observing && startObserver()) {
			observing = true;
		}
		// 每 5 秒兜底全扫一遍，防止 observer 漏掉的节点一直没被翻译。
		if (observing && round % 10 === 0) {
			translateTree(document.documentElement);
		}
		round++;
	}, 500);

	// 10 分钟后撤掉定时器：语言层与数据层都已稳定，留着 observer 即可。
	setTimeout(() => clearInterval(timer), 600_000);
})();
