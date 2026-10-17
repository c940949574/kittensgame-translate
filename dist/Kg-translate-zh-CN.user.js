// ==UserScript==
// @name         KG Translate — 简体中文 (zh-CN)
// @namespace    https://github.com/c940949574/Kittensgame-translate
// @version      0.1.0-20261017
// @description  Kittens Game 本体翻译补丁（简体中文）
// @author       c940949574
// @match        https://kittensgame.com/*
// @match        https://*.kittensgame.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

window.__KG_TRANSLATE_LOCALE__ = {"meta":{"code":"zh-CN","name":"Simplified Chinese","nativeName":"简体中文","mode":"force","languages":["zh","zh-CN"],"source":"kitten-game-zh-patch.user.js v1.7.0","license":"MIT","preferOfficial":false,"nativeScript":"[\\u3000-\\u303f\\uff00-\\uffef\\u4e00-\\u9fff\\uf900-\\ufaff]"},"i18n":{"badges.header":"徽章：{0} / {1}","badges.panel.label":"徽章","badges.whatYearIsIt.get":"时间悖论被强行解决了，+{0} 虚空！","btn.all.unassign":"[-全部]","btn.almostlimited.tooltip":"* - 升级会减少你的专制加成","btn.sell.res.not.refundable":"（{0} 无法退还）","btn.sell.tooltip":"出售可回收其成本的 {0}。","buildings.accelerator.desc2":"即使关闭，储存加成仍然有效。","buildings.deltagrade.refund.msg":"所有已建成的都会被出售，返还 {0}。","buildings.upgrade.desc.available":"可升级为 {0}","buildings.upgrade.tooltip.title":"升级为 {0}","console.filter.alicornCorruption":"天角兽腐化","console.filter.explore":"探索","effectsMgr.statics.biolabBiofuelScienceMaxRatio.title":"生物实验室生物燃料科学上限","effectsMgr.statics.embassyEffectCap.title":"大使馆效果上限","effectsMgr.statics.jobBoostPerRank.title":"{0}每升 1 级，产出与消耗按比例放大","effectsMgr.statics.masterSkillMultiplier.title":"小猫大师的技能效果","effectsMgr.statics.missingZebraPreparations.title":"缺少的斑马准备工作","effectsMgr.statics.preparationRatio.title":"准备比例","effectsMgr.statics.raceSpecificStanding.title":"种族专属地位比率","effectsMgr.statics.spaceRatio.title":"太空生产加成","effectsMgr.statics.spiceRefineryRatio.title":"香料提取加成","effectsMgr.statics.starchartGlobalRatio.title":"星图加成","effectsMgr.statics.tradeNormalResChance.title":"几率修正","effectsMgr.statics.tradeVolume.title":"贸易量","effectsMgr.statics.unicornsGlobalRatio.title":"独角兽加成","policy.sharkRelationsScribes.desc":"鲨鱼书记官热衷于记录 Cath 的历史，你们可以通过贸易协议互相帮助。如果你在贸易中给他们更多资源，他们愿意分享更多记录。<br>效果随年份推移而增强。","prestige.toggleResearched.label":"隐藏已研究的玄学","preview.banner.badge":"存档预览","preview.banner.exit":"返回游戏 →","preview.loading":"正在加载预览…","religion.ru.scholasticism.flavor":"一部关于猫德的论著","religion.sacrificeBtn.label":"献祭独角兽","res.stack.exploration":"探索","res.stack.holyGenocide":"神圣灭绝","res.stack.spaceProdBonus":"太空生产加成","res.stack.spaceProductionBonus":"太空生产加成","resources.concrate.title":"混凝土","save.export.fail":"云存档失败：{0}。你的进度未能上传！","save.fail":"无法保存游戏 —— 本地存储已满或不可用！请手动导出存档，以免丢失进度。","save.import.fail":"无法加载云存档：{0}。","save.update.fail":"无法更新云存档：{0}。","science.paradoxalKnowledge.desc":"开发一套用于理解并控制时空连续体的框架。","science.paradoxalKnowledge.flavor":"为了好玩和收益，把那只碗从你猫爷爷的桌上打下去。","science.particlePhysics.flavor":"喵中微子对强作用力和电磁力都不屑一顾。","space.furthestRingMission.label":"边界环","space.kairoMission.label":"开罗任务","trade.bcoin.crash.confirmation.msg":"你目前持有 {0} 黑币；若砸盘，其价值将受到重大影响。","trade.bcoin.crash.confirmation.msg.alt":"这将严重影响黑币的价值。","trade.bcoin.crash.confirmation.tcCost":"此操作将消耗你相当一部分时间水晶。确定吗？","trade.zebras.titanium.desc":"钛的数量可以通过制造更多贸易船来提升。","ui.kgnet.error.auth":"你的会话已过期，请重新登录","ui.kgnet.error.network":"无法连接服务器","ui.kgnet.error.nodata":"服务器未返回存档数据","ui.kgnet.error.status":"服务器错误 {0}","village.btn.upgradeHQ":"升级总部","village.btn.upgradeHQ.desc":"以额外消耗喵力为代价，提升探索速度","village.happiness.minimum":"最低幸福度","village.happiness.policies":"政策","village.job.ambassador.desc":"改善与其它种族贸易的各个方面，但会消耗一些资源。","village.job.geologist.desc.gold":"每秒 +{0} 黄金","village.job.geologist.desc.upgraded":"每秒 +{0} 煤","workshop.alloyArmor.desc":"增加猎人的捕猎效率","workshop.eludiumCentrifuge.desc":"升级香料提取厂，让它不再怕沙子磨；能处理更多沙子，产出更多香料。","workshop.eludiumCentrifuge.label":"E合金离心机","workshop.freightfulExchange.desc":"太空港自动化允许调用它们来提升贸易量。每座使贸易量提升 +50%","workshop.freightfulExchange.label":"货运交换","workshop.huntingArmor.desc":"猎人的捕猎效率增加至 3 倍","workshop.selfDrivingHarvester.desc":"派出自动驾驶喵车，在沙丘星勘探香料矿藏。","workshop.selfDrivingHarvester.label":"自走式收割喵","workshop.solventBath.desc":"用有机溶剂萃取香料晶体，去除其中的杂质。","workshop.solventBath.label":"溶剂淬浴","workshop.steelArmor.desc":"增加猎人的捕猎效率","workshop.topCatDiplomacy.desc":"提拔后，大使更能干了——代价是胃口更大，索要更多奢侈品。","workshop.topCatDiplomacy.label":"大喵外交","workshop.zebraUpgrade.rangefinders.desc":"为寻找血石而锻造的测距仪。锻造厂能提高捕猎中发现血石的几率。","workshop.zebraUpgrade.rangefinders.label":"测距仪","workshop.zebraUpgrade.reforgedOutposts.desc":"斑马锻造用于改造前哨。每 10 座锻造提供额外的准备工作。","workshop.zebraUpgrade.reforgedOutposts.label":"重铸前哨","workshop.zebraUpgrade.zebraTrappers.desc":"斑马设置陷阱，为捕猎做更充分的准备","workshop.zebraUpgrade.zebraTrappers.label":"斑马捕猎手","msg.pacts.info":"每跨过 1000 年，按剩余契约数额外发放业力（签约会占用契约位，业力随之减少）。契约在重置时间线时全部清空。<br>可用契约：{0}　维护费：每契约每天 {1} 死灵兽","religion.pact.pactOfDestruction.label":"销毁之契约","religion.pact.pactOfChronicler.label":"时空之契约","religion.pact.pactOfCleansing.desc":"涤荡尘世浊流，澄净山河万象<br>洗涤乾坤尘埃，拓宽储纳之疆<br>效果：全局资源上限。","religion.pact.pactOfDestruction.desc":"撕裂现实帷幕，碾碎虚空边界<br>焚尽万象为薪，铸成毁灭赞歌<br>效果：全局产出。","religion.pact.pactOfExtermination.desc":"荡涤尘世邪祟，斩绝不洁根源<br>焚尽污秽残念，引燃信仰圣焰<br>效果：信仰产出。","religion.pact.pactOfPurity.desc":"净化山川天地，洞察宇宙玄秘<br>驱散暗涌阴翳，填补现实罅隙<br>效果：黑图书馆效果、太空纲要。","religion.pact.pactOfArcane.desc":"引星辰作熔炉，以太虚化烈焰<br>重塑物质本源，点化匠造之机<br>效果：工匠加成、工程师合成倍率。","religion.pact.pactOfChronicler.desc":"拨转光阴长河，穿行时空裂隙<br>洞彻时序流转，预演万世兴替<br>效果：年度产出、时间加成。","effectsMgr.statics.pactsAvailable.title":"契约位","effectsMgr.statics.necrocornPerDay.pact.title":"死灵兽祭品","effectsMgr.statics.pactGlobalResourceRatio.title":"每座黑金字塔的资源上限","effectsMgr.statics.pactGlobalProductionRatio.title":"每座黑金字塔的全局产出","effectsMgr.statics.pactFaithRatio.title":"每座黑金字塔的信仰产出","effectsMgr.statics.pactBlackLibraryBoost.title":"每座黑金字塔的黑图书馆效果","effectsMgr.statics.pactDeficitRecoveryRatio.title":"每座黑金字塔的负债恢复","effectsMgr.statics.pactSpaceCompendiumRatio.title":"每座黑金字塔的太空纲要","effectsMgr.statics.pactcraftRatio.title":"每座黑金字塔的工匠加成","effectsMgr.statics.pactPerYearRatio.title":"每座黑金字塔的年度产出","effectsMgr.statics.pactUniversalKnowHow.title":"每座黑金字塔的工程师合成倍率","effectsMgr.statics.pacttimeRatio.title":"每座黑金字塔的时间加成","religion.pact.pactOfCleansing.label":"净化之契约","religion.pact.pactOfExtermination.label":"灭绝之契约","religion.pact.pactOfPurity.label":"纯洁之契约","religion.pact.pactOfArcane.label":"奥术之契约","space.planet.umbra.hrHarvester.label":"暗影蒸能器","space.planet.umbra.hrHarvester.desc":"暗影蒸能器，汲取黑洞蒸发的能量。每台产出 1W 能源，输出随时间缓慢提升。","effectsMgr.statics.hrHarvester-energyProduction.title":"暗影蒸能器 - 能源产出","effectsMgr.statics.umbraBoostRatio.title":"暗影蒸能器加成"},"data":{"badges":{"lotus":{"title":"食莲人","description":"累计重开超过 50 次"},"ivoryTower":{"title":"象牙塔","description":"在钢铁意志与无神论下重开"},"useless":{"title":"有效管理","description":"拥有一位毫无用处的领袖"},"beta":{"title":"β 衰变","description":"参与过一次 Beta 测试"},"silentHill":{"title":"寂静岭","description":"服务器的今日公告没有任何内容"},"evergreen":{"title":"木质徽章","description":"造个木材？大概吧"},"deadSpace":{"title":"死亡空间","description":"让小猫在虚空里游荡（1000 只小猫且住房容量为 0）"},"reginaNoctis":{"title":"Regina Noctis（夜之女王）","description":"拥有 500 只小猫，且没有任何天角兽"},"ghostInTheMachine":{"title":"机器幽灵","description":"♋︎⬧︎⧫︎♏︎❒︎🕯︎⬧︎ ●︎♋︎■︎♑︎◆︎♋︎♑︎♏︎ 🖳︎✆"},"abOwo":{"title":"Ab Owo（自始之初）","description":"在第 0 天以无神论重开"},"cleanPaws":{"title":"洁爪","description":"和平贸易，全程不动用猎人"},"sequenceBreak":{"title":"跳序","description":"在太空页跳过月球"},"fantasticFurColor":{"title":"奇妙毛色","description":"小猫名字带颜色只表示它有罕见毛色，没有任何特殊的玩法效果。"},"whatYearIsIt":{"title":"这是哪一年来着？","description":"强行解决一次时间悖论。可能有未知的副作用。"},"tardis":{"title":"塔迪斯","description":"优先时间旅行，而非太空旅行。"},"wheredThisComeFrom":{"title":"这东西哪来的？","description":"用时间重置换取资源。"},"lostDates":{"title":"迷失的岁月","description":"累计 5 年的时间错位。"},"buffet":{"title":"鲸吞盛宴","description":"利维坦能量达到 1000。"},"newHome":{"title":"新家","description":"纱星上的住房多于喵星。"},"betterSafeThanSorry":{"title":"有备无患（旧）","description":"在零污染下获得碳封存。"},"soLongAndThanksForAllTheHay":{"title":"再见了，多谢你们的干草","description":"让天角兽数量恰好等于 42。"}},"map":{"maps":{"cath":{"title":"喵星","description":"喵星这片神秘之地处处是危险，也处处是奇观"},"space":{"title":"太空","description":"漆黑的群星与无尽之海"}},"biomes":{"village":{"title":"村庄","desc":"提升所有生物群系的探索速度"},"plains":{"title":"平原","desc":"每级提升 1% 猫薄荷产出","lore":{"5":"传说中，整个世界曾经都被树木覆盖"}},"hills":{"title":"丘陵","desc":"待定","lore":{"5":"你能看见小蜥蜴在晒太阳"}},"forest":{"title":"森林","desc":"每级提升 1% 木材产出","lore":{"5":"闻起来舒服极了","10":"据说这片森林没有尽头，覆盖了半个星球","15":"森林里有某种东西，没人知道那是什么。也没多少人能确定它真的存在。如果它真的存在，那它就在极深的地方，要走好几天，好几年，也许几个世纪。"}},"boneForest":{"title":"白骨森林","lore":{"5":"一个树木由骨骼构成的地方"}},"rainForest":{"title":"雨林","description":"待定","lore":{"5":"树高得看不见尽头。雨一旦下起来，就是几百年。","10":"雾中你能看见群山。那些山长着眼睛，有时还会互换位置。"}},"mountain":{"title":"山地","description":"每级提升 1% 矿物产出","lore":{"5":"记得带上按规定必备的五十米绳索。上山要花不少时间。","10":"大大小小的石灰岩建筑耸立在那里。狮鹫称此地为白色城堡。","15":"一切都苍白得看不出究竟是什么做的。到处都有红色的记号与涂鸦。","20":"这地方凭什么叫城堡？你能看出它自有章法。它本身就是一个结构——一座由庙塔堆成的庙塔。"}},"volcano":{"title":"火山","description":"待定","lore":{"5":"待定"}},"desert":{"title":"沙漠","description":"每级提升 1% 太阳能发电站效率","lore":{"5":"一望无际的白色沙漠，间或立着几处红色岩层"}},"bloodDesert":{"title":"猩红沙漠","description":"","lore":{"5":"传说这里有可怕的怪物、失落的城市，以及无尽的红沙","10":"你还能往更深处走。但你并不真想看见沙漠里有什么。","15":"这里曾经是一片血之海洋。没人知道缘由，也许是很久以前红月的一块冰封碎片坠落在这里。"}},"swamp":{"title":"沼泽","description":"能吃的东西有毒，树有毒，草有毒，连空气也微微带毒","lore":{"5":"这里的一切都想弄死你","10":"这里的植物有毒，树有毒，水有毒，空气也微微带毒","15":"满眼是无尽的沼泽，以及失落的塔庙与腐朽的瞭望塔"}},"cath":{"title":"喵星","description":"一颗苍白的小绿点"},"redmoon":{"title":"红月","description":"红月的说明","lore":{"5":"你知道这颗月亮为什么是红的","10":"在盆地、群山、环形山与无尽的红色尘海之下，你能感觉到某种巨大而似蛇的东西，盘绕成一个不可能解开的结"}}},"fauna":{"giant moth":"巨蛾","mantis":"螳螂","slime mold":"黏菌","grass snake":"草蛇","raptor":"猛禽","vole":"田鼠","rock lizard":"岩蜥","centipede":"蜈蚣","stone toad":"石蟾","cave bat":"穴蝠","bone spider":"骨蛛","poison frog":"毒蛙","razor leech":"利刃水蛭","jaguar":"美洲豹","giant centipede":"巨型蜈蚣","mountain goat":"岩羊","rock worm":"岩虫","yeti cub":"雪人幼崽","magma slug":"岩浆蛞蝓","lava beetle":"熔岩甲虫","sand viper":"沙蝰","scorpion":"蝎子","dune beetle":"沙丘甲虫","sand raptor":"沙地猛禽","blood scarab":"血圣甲虫","crimson basilisk":"猩红蛇怪","bog toad":"沼泽蟾蜍","swamp serpent":"沼泽巨蛇","poison spore":"毒孢"}}},"dom":{"exact":[["Map","地图"],["Maps","地图"],["Biomes","生物群系"],["Lvl","等级"]],"fragment":[["Explorers: Supplies []","探险者：补给 []"],["Currently exploring: [","正在探索：["],["Current map: ","当前地图："],["Expedition squad have been knocked out","探险队已被击溃"],["Your explorers have returned from expedition","探险者已从远征中返回"],["Your explorers have brought ","探险者带回了 "],["You are currently not in combat","当前不在战斗中"],["You have killed ","你击杀了 "],["Hit chance: ","命中率："],["Dodge chance: ","闪避率："],["Explorers:","探险者："],["Stamina:","耐久："],["[Cancel]","[取消]"],["ETA:","预计还需："],["Exp:","经验："],["HP:","生命："],["ATK:","攻击："],["DEF:","防御："],["AGI:","敏捷："],["STR:","力量："],["SPD:","速度："],["TBD","待定"]],"regex":[["\\[eff:","[效率:","g"],["lvl\\.(\\d+)","$1 级","g"],["lv\\.(\\d+)","$1 级","g"],[", (\\d+)%, ETA: ","，$1%，预计剩余 ","g"],[",\\s*\\+(\\d+)xp","，+$1 经验","g"]]}};

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
