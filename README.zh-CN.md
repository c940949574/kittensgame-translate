# KG Translate（ Kittens Game 本体翻译框架）

一个面向 [Kittens Game](https://kittensgame.com) 的**社区翻译框架**：语言包是纯 JSON，和引擎彻底分离，任何人都能在**不写一行代码**的前提下新增或完善一种语言。

> 与游戏开发者无关，本项目是爱好者自发的本地化项目。

## 为什么需要它

游戏的语言加载链是三层：`en.json` → `zh.json` → `crowdin/zh.json`，最后一层覆盖前面。Crowdin 上看着已翻译 96%，但真正「被采纳」的只有一小部分，未采纳的翻译不会导出——所以游戏里仍有大量英文。而有些内容（成就**徽章**、村庄**地图**面板）压根没有 i18n key，字符串写死在 JavaScript 里，永远不过翻译函数。

`KG Translate` 分三层解决：

| 层 | 作用 |
|---|---|
| **i18n** | 接管全局 `$I()`，并**持续复查**语言层（游戏会分多次合并语言层，只打一次补丁会被顶掉） |
| **数据** | 直改**没有 i18n key** 的游戏数据对象——徽章标题/说明、地图/群系/动物名。这些面板每 tick 从对象重绘，改一次长期生效 |
| **DOM** | 扫描文本节点，替换拼进 `innerHTML` 的死字符串（`"Maps"`、`"HP:"`、`"You have killed …"`） |

## 安装

从 [Releases](../../releases) 下载你对应语言的 `.user.js`，或直接用 raw 链接安装：

```
https://raw.githubusercontent.com/c940949574/kg-translate/main/dist/Kg-translate-zh-CN.user.js
```

Tampermonkey / Violentmonkey / Greasemonkey 均可。`kittensgame.com` 与 `/beta` 通用；不改动任何游戏数据，不联网、不上报。

### 两种语言模式

每个语言包在 `meta.mode` 里声明行为：

- `force`：无论游戏界面语言是什么都用本语言包覆盖（适合官方/社区译文滞后的语言，中文包就是这种）
- `match`：仅当游戏语言命中 `meta.languages` 时才翻译（适合只想补官方缺漏、不覆盖已有官方译文的语言）

## 新增一种语言

```bash
git clone https://github.com/c940949574/Kittensgame-translate.git
cd kg-translate

node tools/new-locale.mjs ja-JP 日本語 Japanese   # 1) 生成骨架
node tools/verify.mjs ja-JP                      # 2) 看还缺哪些 key
#    …编辑 locales/ja-JP.json…
node tools/build.mjs ja-JP                       # 3) 生成可安装的 user.js
```

零依赖，Node 20+ 即可。提 PR 即可，详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 官方译文很少 / 完全没有的语言

这是常态，不是边缘情况。游戏只带一份英文词表 + 每种语言一层社区译文，而这些层厚薄不均：

| 语言 | 社区层条数（英文共 2622 条） | 译者要接手什么 |
|---|---|---|
| ru / ja / zh | ~2550 | 只剩零星缺口 |
| de / fr / es / pl / ko | ~2400–2470 | 几百条 |
| it | 1728 | 约 800 条 |
| tr | 1418 | 约 1200 条 |
| uk | 847 | 约 1600 条 |
| **pt-BR / vi** | **完全没有文件** | 全表 2622 条 |

`tools/verify.mjs` **始终按该语言包自己的语言**判定缺漏，所以你拿到的是自己的待办清单，而不是别人的：

```bash
node tools/verify.mjs uk       # 乌克兰层的缺口
node tools/verify.mjs pt-BR    # 提示「无翻译文件」，即全表
node tools/verify.mjs zh-CN --lang pt-BR   # 用假设语言体检某个包
```

### 全量包的开销（实测，非估算）

`node tools/bench-pack.mjs`（Node 22）：

| 路径 | 77 条 | 全量 2622 条 |
|---|---|---|
| `$I()` —— 一次界面渲染 3000 次调用 | 73 µs | 68 µs（**无差异**） |
| 词表复查·稳态（每 500ms） | 3 µs | 171 µs |
| 词表复查·语言层合并期 | 729 µs | 1089 µs |
| 包体积 | 5 KB | 164 KB |

`$I()` 是热路径（游戏每次渲染调几千次），内部只有一次 O(1) 哈希查表，**与包大小无关**。唯一随规模增长的是 500ms 的词表扫描，稳态只占 2 秒游戏 tick 的 0.02%，且仅在游戏合并语言层的那 1–3 秒内以较高成本运行。全量包完全可行。

### `preferOfficial`：别把社区后来的好译文挡在门外

`force` 会覆盖一切，包括社区**后来**补上的译文。想两者兼得，就声明你语言用的字符：

```jsonc
"meta": {
  "mode": "force",
  "preferOfficial": true,
  "nativeScript": "[\u3000-\u303f\uff00-\uffef\u4e00-\u9fff\uf900-\ufaff]"
}
```

引擎会保留官方译文——只要它含有你语言的字符；官方那边还是英文（或 `TBD` 这类占位符）时用你的。默认 `false`，即纯粹接管。

局限：与英文共用字母表的语言（如印尼语借词较多）这个判据偏弱，这类语言建议保持关闭。

## 目录结构

```
locales/<code>.json       语言包：meta + i18n 词条 + 数据层补丁 + DOM 规则
src/kg-translate.core.js  引擎（不含任何语言知识）
tools/build.mjs           引擎 + 语言包 → dist/Kg-translate-<code>.user.js
tools/verify.mjs          对照线上游戏词表校验（缺失/多余/形近）
tools/new-locale.mjs      新语言脚手架
tools/build-full.mjs      生成一次性的全量包（不入库）
tools/bench-pack.mjs      实测词条规模对两条热路径的影响
tools/extract-zh-patch.mjs  一次性工具：把早期单体补丁迁成语言包
dist/                     构建产物，故意入库（方便直接 raw 安装）
```

## 已收录语言

| 代码 | 语言 | i18n 词条 | 徽章 | 地图 |
|---|---|---|---|---|
| [`zh-CN`](locales/zh-CN.json) | 简体中文 | 75 | 21/21 | ✅ |

欢迎新增语言——可在 [Issues](../../issues) 里认领「求某语言」。

## 许可

- 引擎（`src/`）、工具、文档：**MIT**
- 语言包（`locales/`）：以各包 `meta.license` 为准（zh-CN 为 MIT；社区包建议用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)）

Kittens Game 本体版权归其作者所有，本仓库不包含其代码。
