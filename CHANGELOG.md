# Changelog

All notable changes to this project are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/);
versions are per-language and follow the build's `meta.version`.

## [Unreleased]

### Added
- 语言无关的引擎（`src/kg-translate.core.js`）：i18n 接管 + 持续复查、数据层直改、DOM 文本节点替换。
- 语言包体系（`locales/*.json`）：i18n 词条、徽章/地图数据补丁、DOM 规则三段式，无语言耦合。
- 工具链：`build`（合成单文件 user.js）、`verify`（对照线上词表查缺失/多余/形近）、`new-locale`（脚手架）、`extract-zh-patch`（一次性迁移）。
- `zh-CN` 语言包：75 条 i18n 词条、21/21 徽章、13 个地图群系、29 种动物、31 条 DOM 规则。
- CI：结构校验 + 构建 + 语法检查；PR 必须同步 `dist/`。

### Changed — 契约（Pact）词条重做
- **标签统一为「XX之契约」格式**：`销毁公约` → `销毁之契约`；`Chronicler` 原译 `记录者之契约` → `时空之契约`（Chron 与游戏本体「超时空传送仪 / 时空物理学」同源，按官方中文走时空系，去掉冗余的「记录者」）。
- **描述改为「骈句 + 效果说明」两段式**。原文案四个骈句写完根本不告诉玩家加什么，现已把效果写在加粗行，并在有坑的地方补注意事项（如净化之契约对无上限资源无效）。
- **重写 12 个效果标题**，保留「每座黑金字塔」前缀以说明该值是按契约计的基准值、实际效果随黑金字塔（超越层级）放大。原文案是 `game.js` 效果名 `per pyramid` 的直译（「每个金字塔产出」「每金字塔的通用知识」），玩家看不懂。
- `死灵兽消耗` → `死灵兽祭品`。
- `msg.pacts.info` 消除歧义：「未签订的契约」实为「还没用掉的契约数额度」，并补明「签约会占用契约位、业力随之减少」。
- `zh-CN` i18n 词条 81 → 102。

### Changed — 效果范围写全（第二轮修正）
- **`时间加成` 不再窄化为「天文事件几率」**。`timeRatio` 经 `1 + timeRatio × 0.25` 影响四处：天文事件几率（`calendar.js` L261）、独角兽出现几率（L498）、快进事件数（L734）、时间阻抗（`time.js` L481 → `calendar.js` L413 延后黑暗未来）。
- **`全知` 补明起效位置与方式**。`UniversalKnowHow` 只出现在 `workshop.js` L2782（`getConsumptionEngineers`）与 L2809（`getEffectEngineer`），作用是 `tierCraftRatio = t{等级}CraftRatio + UniversalKnowHow`，即**只对工程师小猫的自动合成生效，直接叠加在该等级合成配方的基础倍率之上**，并非提升工程师岗位产出。原文案「提高工程师速度」是错的。

### Changed — 标题压干（第三轮修正）
原则：**不扩写**。效果标题十几个字，且标题本身自带「在哪生效、怎么生效」，不靠长句解释。

| 键 | 定稿 |
|---|---|
| `pactsAvailable` | 契约位 |
| `necrocornPerDay.pact` | 死灵兽祭品 |
| `pactGlobalResourceRatio` | 每座黑金字塔的资源上限 |
| `pactGlobalProductionRatio` | 每座黑金字塔的全局产出 |
| `pactFaithRatio` | 每座黑金字塔的信仰产出 |
| `pactDeficitRecoveryRatio` | 每座黑金字塔的负债恢复 |
| `pactSpaceCompendiumRatio` | 每座黑金字塔的太空纲要 |
| `pactcraftRatio` | 每座黑金字塔的工匠加成 |
| `pactPerYearRatio` | 每座黑金字塔的年度产出 |
| `pactUniversalKnowHow` | 每座黑金字塔的工程师合成倍率 |
| `pacttimeRatio` | 每座黑金字塔的时间加成 |
| `pactBlackLibraryBoost` | 每座黑金字塔的黑图书馆效果 |

- 「每座黑金字塔的」前缀保留——`js/religion.js` L1000-1013 里契约 raw 值要乘 `max(TT − 24, 1)` 才落到金字塔上，tooltip 显示的是按契约计的基准值。
- 契约描述同步收回长篇：骈句一行 + 效果一行。

### Changed — 骈句统一四句六字（第四轮）
- **六个契约描述的骈句统一为「四句 × 六字」**。销毁 / 净化 / 灭绝 / 奥术四段由长短不一的骈句改为六字四句；纯洁 / 时空两段本已是六字四句，保留。
- 每句严格 6 字，末句后接 `。<br>效果：…`。

### Changed — 平仄合规（第五轮，已回退）
- **第五轮曾把六段骈句全部按「仄起平收 + 联脚仄平仄平」重校**（用 pypinyin 取四声，多音字手动钉正：为=平、重=平、尽=仄）。但为凑格律牺牲了意象——`拓宽储纳之疆`→`之仓`、`填补现实罅隙`→`虚空之书`、`穿行时空裂隙`→`时空星河` 等，气势明显弱了。
- **经用户确认，回退到第四轮原文（六字四句、不强制平仄）**：销毁（撕裂现实帷幕…铸成毁灭赞歌）、净化（涤荡尘世浊流…拓宽储纳之疆）、灭绝（荡涤尘世邪祟…引燃信仰圣焰）、奥术（引星辰作熔炉…点化匠造之机）、纯洁（净化山川天地…填补现实罅隙）、时空（拨转光阴长河…预演万世兴替）。
- 结论：此类游戏文案**意象/气势优先于严格平仄**，之后不再为格律改词。

### Fixed — preferOfficial 压制自有词条（致命）
- **`meta.preferOfficial: true` 导致语言包词条在游戏里从未生效**。引擎判据是「官方译文含中文即听官方」，而 pact 标签、`msg.pacts.info`、效果标题等官方 crowdin 全是中文，我们的覆盖全被挡掉。
- 改为 `preferOfficial: false`：语言包收录的键就是要精选覆盖官方的；未收录的键官方译文照常生效，行为不变。
- 补齐 4 条缺失的契约标签（净化/灭绝/纯洁/奥术之契约），6 个标签统一「XX之契约」。i18n 词条 102 → 106。

### Added — 暗影蒸能器（HR Harvester 全簇）
- 新增 4 条 Umbra 黑洞机器词条（此前全在官方 crowdin，语言包未收录）：`space.planet.umbra.hrHarvester.label`→暗影蒸能器、`…hrHarvester.desc`→「暗影蒸能器，汲取黑洞蒸发的能量。每台产出 1W 能源，输出随时间缓慢提升。」、`effectsMgr.statics.hrHarvester-energyProduction.title`→暗影蒸能器 - 能源产出、`effectsMgr.statics.umbraBoostRatio.title`→暗影蒸能器加成。
- 命名对齐星球/黑洞本名「暗影」(Umbra)，`蒸能` 取霍金辐射=黑洞蒸发的本意，4 处统一。i18n 词条 106 → 110。

### Notes
- 语言包是数据，引擎不含任何语言知识——加语言不需要改代码。
- `dist/` 有意入库，便于 raw URL 直接安装。
- 契约效果标题在 `kittensgame-beta` 的 `game.js` L2059-2140 定义，本次全部对着源码核过实际作用，非猜译。
- `奥术契约` 原文案「提高工程师速度」是错的——`UniversalKnowHow` 在 `workshop.js` L2782/2809 是直接加进 `tierCraftRatio` 的，与工程师无关。

