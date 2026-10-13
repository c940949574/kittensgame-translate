#!/usr/bin/env node
/**
 * verify.mjs — 对照游戏本体词表校验语言包。
 *
 * 三件事：
 *   1) 缺失：游戏 en.json 里有、但语言包没翻的 key（按 locale 覆盖的域筛选）
 *   2) 多余：语言包里有、但游戏已经不存在的 key（改名/删除的遗留）
 *   3) 形近：语言包 key 与官方中文/英文只差大小写或前缀（手滑的高发区）
 *
 * 游戏词表来源（按优先级）：
 *   --source local <file>   用本地 en.json（离线/CI 用）
 *   --source auto           默认，拉取线上 en.json（正式版 + beta）
 *
 * 用法：
 *   node tools/verify.mjs                       # 校验所有语言
 *   node tools/verify.mjs zh-CN --source auto   # 只校验中文并拉线上词表
 *   node tools/verify.mjs zh-CN --json          # 机器可读输出（给 CI 用）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES_DIR = path.join(ROOT, "locales");
const CACHE_DIR = path.join(ROOT, ".cache");

const argv = process.argv.slice(2);
const jsonOutput = argv.includes("--json");
const sourceIndex = argv.indexOf("--source");
const sourceMode = sourceIndex >= 0 ? argv[sourceIndex + 1] : "auto";
const localFile = argv[sourceIndex >= 0 ? sourceIndex + 2 : -1];
const langIndex = argv.indexOf("--lang");
const langOverride = langIndex >= 0 ? argv[langIndex + 1] : undefined;
const targets = argv.filter(
	(arg, index) =>
		!arg.startsWith("--") && index !== sourceIndex + 1 && index !== langIndex + 1,
);

/** 词表地址：正式版与 beta 各一份。 */
const SOURCES = [
	{ name: "web", url: "https://kittensgame.com/web/res/i18n/en.json" },
	{ name: "beta", url: "https://kittensgame.com/web/beta/res/i18n/en.json" },
];

/**
 * 某语言的翻译层地址。
 *
 * 中文是特例：官方自带 `res/i18n/zh.json`，Crowdin 层只是覆盖它。
 * 其余语言只有 Crowdin 一层，且**并非每种语言都存在文件**——pt-BR、vi 目前
 * 完全没有，it 1728 条、uk 847 条。这类语言没有官方译文可抄，`verify` 必须
 * 把"全表"报成待补，否则译者会拿到一份无关语言的缺漏清单。
 */
const translationURLs = (lang) => {
	if (lang === "zh" || lang === "zh-CN") {
		return [
			{ tag: "zh", url: "res/i18n/zh.json" },
			{ tag: "crowdin", url: "res/i18n/crowdin/zh.json" },
		];
	}
	const primary = String(lang).split("-")[0].toLowerCase();
	return [
		{ tag: "crowdin", url: `res/i18n/crowdin/${primary}.json` },
		// 地区变体（pt-BR / zh-Hant 之类）如果存在也要算进来
		...(primary !== String(lang).toLowerCase()
			? [{ tag: "crowdin-region", url: `res/i18n/crowdin/${String(lang).toLowerCase()}.json` }]
			: []),
	];
};

/** 语言包通常只覆盖这几类 key；其余（成就、周期、粒子…）官方早已译好。 */
const COVERED_PREFIXES = [
	"workshop.",
	"effectsMgr.",
	"res.stack.",
	"village.",
	"buildings.",
	"religion.",
	"science.",
	"trade.",
	"space.",
	"console.",
	"badges.",
	"achievements.",
	"challendge.",
	"msg.",
	"ui.",
	"preview.",
	"save.",
	"btn.",
	"prestige.",
	"policy.",
];

/**
 * 逐个词表源加载 JSON；拉不到就退回上次缓存（离线也能跑）。
 *
 * 404 与网络失败要分开：404 意味着「这种语言压根没有这个文件」（例如
 * pt-BR / vi 就没有 Crowdin 层），这是**有效信息**——它等于告诉译者
 * "你要自译全表"，不能当成错误丢掉。
 */
const fetchJSON = async (name, url) => {
	const cacheFile = path.join(CACHE_DIR, `${name}.json`);
	try {
		const response = await fetch(url, { cache: "no-store" });
		if (404 === response.status || 410 === response.status) {
			return {}; // 该语言不存在这层，静默
		}
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		const text = await response.text();
		fs.writeFileSync(cacheFile, text);
		return JSON.parse(text);
	} catch (error) {
		if (!fs.existsSync(cacheFile)) {
			console.warn(`⚠ ${url} 拉取失败（${error.message}），跳过该源`);
			return {};
		}
		console.warn(`⚠ ${url} 拉取失败，改用本地缓存`);
		return JSON.parse(fs.readFileSync(cacheFile, "utf8"));
	}
};

/**
 * 加载「游戏词表 + 真正的待补清单」。
 *
 * 只有当 en.json 的值在**该语言自己的**翻译层合并后仍是原文，才算游戏缺译文
 * （社区没采纳的翻译不会导出到 Crowdin 层，所以每一层都要看）。
 * 这才是本项目该补的范围——官方已译的 key 不需要我们插手。
 *
 * @param lang 语言代码（zh / zh-CN / uk / pt-BR …）。传 null 表示不查翻译层，
 *             整张表都算待补（用于"从零自译"场景的 dry run）。
 */
const loadSource = async (lang) => {
	if (sourceMode === "local") {
		if (!localFile) throw new Error("--source local 需要给出文件路径");
		const en = JSON.parse(fs.readFileSync(path.resolve(localFile), "utf8"));
		return { game: en, untranslated: Object.keys(en), layers: [] };
	}

	fs.mkdirSync(CACHE_DIR, { recursive: true });
	const game = {};
	const translations = {};
	const layers = [];

	for (const source of SOURCES) {
		Object.assign(game, await fetchJSON(`${source.name}.en`, source.url));
		for (const layer of translationURLs(lang)) {
			const url = source.url.replace("/res/i18n/en.json", `/${layer.url}`);
			const data = await fetchJSON(`${source.name}.${lang}.${layer.tag}`, url);
			layers.push({ source: source.name, ...layer, keys: Object.keys(data).length });
			Object.assign(translations, data);
		}
	}

	if (0 === Object.keys(game).length) {
		throw new Error("没有可用的游戏词表（联网失败且无缓存）");
	}

	const untranslated = Object.keys(game).filter((key) => {
		const translated = translations[key];
		if (typeof translated !== "string") return true;
		// 值和原文完全一致 = 没被翻译；或译文是空串
		return translated === game[key] || translated.trim() === "";
	});

	return { game, untranslated, layers };
};

const near = (key, keys) => {
	const lower = key.toLowerCase();
	return keys.filter(
		(other) =>
			other !== key &&
			other.toLowerCase() === lower &&
			(key.includes(".") === other.includes(".")),
	);
};

const main = async () => {
	const report = {};

	const files = fs
		.readdirSync(LOCALES_DIR)
		.filter((name) => name.endsWith(".json") && !name.startsWith("_"))
		.map((name) => path.join(LOCALES_DIR, name));

	for (const file of files) {
		const locale = JSON.parse(fs.readFileSync(file, "utf8"));
		const code = locale.meta?.code;
		if (targets.length && !targets.includes(code)) continue;

		// 关键：缺漏清单必须按**这个包自己的语言**判定。中文包对中文的缺漏，
		// 乌克兰包对乌克兰的缺漏——拿别人的清单去补等于白干。
		// --lang 可以覆盖（比如给 zh-CN 包做一次"假如官方全无译文"的体检）。
		const lang = langOverride ?? code;
		const { game: gameKeysMap, untranslated, layers } = await loadSource(lang);
		const gameKeys = Object.keys(gameKeysMap);

		const own = Object.keys(locale.i18n ?? {});
		// 只看游戏真正缺译文的 key —— 那才是我们该补的活。
		const todo = untranslated.filter((key) =>
			COVERED_PREFIXES.some((prefix) => key.startsWith(prefix)),
		);
		const missing = todo.filter((key) => !own.includes(key));
		const extra = own.filter((key) => !gameKeys.includes(key));
		const suspicious = own.flatMap((key) => near(key, gameKeys));
		const done = todo.length - missing.length;
		const scope = todo.length + done;
		const officialKeys = layers.reduce((sum, layer) => sum + layer.keys, 0);

		report[code] = {
			file: path.relative(ROOT, file),
			lang,
			officialKeys,
			hasOfficialLayer: officialKeys > 0,
			total: own.length,
			todoCount: todo.length,
			doneCount: done,
			missingCount: missing.length,
			extraCount: extra.length,
			suspiciousCount: suspicious.length,
			missing: missing.slice(0, 200),
			extra: extra,
			suspicious,
			coverage: scope === 0 ? 100 : Number(((done / scope) * 100).toFixed(1)),
		};
	}

	if (jsonOutput) {
		console.log(JSON.stringify(report, null, 2));
		// 有「多余 key」视为失败（说明词条过时），「缺失」只提示不失败
		const stale = Object.values(report).some((r) => r.extraCount > 0);
		process.exit(stale ? 1 : 0);
	}

	if (0 === Object.keys(report).length) {
		console.error("没有匹配到语言包");
		process.exit(1);
	}

	for (const [code, result] of Object.entries(report)) {
		console.log(`\n── ${code}  (${result.file})`);
		console.log(
			result.hasOfficialLayer
				? `   官方/社区翻译层共 ${result.officialKeys} 条（判定语言：${result.lang}）`
				: `   ⚠ 「${result.lang}」在游戏里没有任何翻译文件 —— 这是全表自译场景，待补即全表`,
		);
		console.log(
			`   语言包共 ${result.total} 条；游戏待补域 ${result.todoCount} 条，已补 ${result.doneCount} 条 → 覆盖率 ${result.coverage}%`,
		);
		if (0 < result.missingCount) {
			console.log(`   待补 ${result.missingCount} 条（前 10）:`);
			for (const key of result.missing.slice(0, 10)) console.log(`     - ${key}`);
		} else {
			console.log("   ✓ 待补清单已清空");
		}
		if (0 < result.extraCount) {
			console.log(`   ✗ 多余 ${result.extraCount} 条（游戏里已不存在，应删除）:`);
			for (const key of result.extra) console.log(`     - ${key}`);
		}
		if (0 < result.suspiciousCount) {
			console.log(`   ✗ 形近 ${result.suspiciousCount} 条（检查大小写/前缀）:`);
			for (const [key, match] of result.suspicious) {
				console.log(`     - ${key}  vs  ${match}`);
			}
		}
	}
};

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
