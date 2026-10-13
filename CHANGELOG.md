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

### Notes
- 语言包是数据，引擎不含任何语言知识——加语言不需要改代码。
- `dist/` 有意入库，便于 raw URL 直接安装。
