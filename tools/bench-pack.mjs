/**
 * bench-pack.mjs — 词条规模对性能的影响实测。
 *
 * 两条路径要分开看，因为它们的成本模型完全不同：
 *
 *  A) $I() 热路径：游戏每次 UI 渲染都会调用几千次。patchedI18n 里只有一次
 *     Object.hasOwn 查表 —— O(1)，与词条总数**无关**。
 *  B) patchMessages()：每 500ms 一次，遍历整包比对后才写入。O(词条数)，
 *     但稳态下全是"相等"，不会真写入；只有语言层被覆盖的窗口期才写。
 *
 * 用法：node tools/bench-pack.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = path.join(ROOT, ".cache");
const en = JSON.parse(fs.readFileSync(path.join(cacheDir, "en.beta.en.json"), "utf8"));
const zh = JSON.parse(fs.readFileSync(path.join(cacheDir, "en.beta.zh.json"), "utf8"));

const allGameKeys = Object.keys(en);
const currentPack = JSON.parse(
	fs.readFileSync(path.join(ROOT, "locales/zh-CN.json"), "utf8"),
).i18n;

/** 模拟「全部词条都翻译了」的极端包：每条都有中文值。 */
const fullPack = Object.fromEntries(
	allGameKeys.map((key) => [key, zh[key] ?? `[译] ${en[key]}`]),
);

/** 模拟稳态的游戏字典（已被我们写成译文）。 */
const steadyMessages = { ...fullPack };
/** 模拟语言层抖动：每次又被覆盖回英文。 */
const churnMessages = { ...en };

function bench(label, iterations, fn) {
	fn(); // warm-up
	const start = process.hrtime.bigint();
	for (let i = 0; i < iterations; i++) fn();
	const ns = Number(process.hrtime.bigint() - start);
	return { label, perOp: ns / iterations / 1000, iterations };
}

const patchedI18nFor = (pack) => (key, args) => {
	const native = key;
	if (!Object.hasOwn(pack, key)) return native;
	let message = pack[key];
	if (args) {
		for (let i = 0; i < args.length; i++) {
			message = message.split(`{${i}}`).join(args[i]);
		}
	}
	return message;
};

const patchMessagesFor = (pack) => (messages) => {
	let written = 0;
	for (const key of Object.keys(pack)) {
		if (messages[key] !== pack[key]) {
			messages[key] = pack[key];
			written++;
		}
	}
	return written;
};

const rows = [];

// ── A) $I 热路径：模拟一次 UI 渲染的 3000 次调用
const RENDER_CALLS = 3000;
for (const [name, pack] of [
	["77 条（现状）", currentPack],
	["全量 " + Object.keys(fullPack).length + " 条", fullPack],
]) {
	const $I = patchedI18nFor(pack);
	rows.push(
		bench(`A. $I 调用 ×${RENDER_CALLS}（${name}）`, 200, () => {
			for (let i = 0; i < RENDER_CALLS; i++) $I(allGameKeys[i % allGameKeys.length]);
		}),
	);
}

// ── B1) patchMessages 稳态（值已一致，不写入）
for (const [name, pack] of [
	["77 条", currentPack],
	["全量", fullPack],
]) {
	const patch = patchMessagesFor(pack);
	rows.push(
		bench(`B1. 复查一轮·稳态不写（${name}）`, 2000, () => {
			patch(steadyMessages);
		}),
	);
}

// ── B2) patchMessages 抖动期（整包被覆盖，每轮全量重写）
for (const [name, pack] of [
	["77 条", currentPack],
	["全量", fullPack],
]) {
	const patch = patchMessagesFor(pack);
	rows.push(
		bench(`B2. 复查一轮·整包重写（${name}）`, 500, () => {
			// 每次模拟"语言层又覆盖了一次"
			Object.assign(churnMessages, en);
			patch(churnMessages);
		}),
	);
}

console.log("词条规模对性能的影响（Node 22，单线程）\n");
console.log("场景".padEnd(42) + "单次耗时".padStart(12));
console.log("-".repeat(54));
for (const row of rows) {
	const value = row.perOp < 1 ? `${row.perOp.toFixed(3)} µs` : `${row.perOp.toFixed(1)} µs`;
	console.log(row.label.padEnd(42) + value.padStart(12));
}

const fullSize = Buffer.byteLength(JSON.stringify(fullPack));
const curSize = Buffer.byteLength(JSON.stringify(currentPack));
console.log(
	`\n包体积：77 条 ${(curSize / 1024).toFixed(1)} KB → 全量 ${(fullSize / 1024).toFixed(1)} KB`,
);
console.log(
	"频率换算：patchMessages 每 500ms 一次，即每秒 2 次；上面 B1/B2 的单次耗时即为每轮成本。",
);
