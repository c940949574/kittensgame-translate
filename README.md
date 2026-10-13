# KG Translate

A community **translation framework** for [Kittens Game](https://kittensgame.com) — language packs are plain JSON, completely separated from the engine, so anyone can add or improve a language **without touching a line of code**.

> Not affiliated with the Kittens Game developers. This is a fan-made localization project.

## Why this exists

The game loads translations in three layers: `en.json` → `zh.json` → `crowdin/zh.json`, where the last one wins. Crowdin looks well translated, but only a small share of those translations is *approved*, and unapproved ones are never exported — so a lot of text still shows up in English. Some content (achievement **badges**, the village **map** panel) has no translation key at all: the strings are hard-coded in JavaScript and never pass through the game's translation function.

`KG Translate` fixes this in three layers:

| Layer | What it does |
|---|---|
| **i18n** | Takes over the global `$I()` function and keeps re-writing `i18nLang.messages` (the game merges language layers in several passes, so a single patch gets overwritten). |
| **Data** | Rewrites game data objects that have **no i18n key** — badge titles/tooltips, map names, biome names, fauna names. The panels redraw from these objects every tick, so one write is enough. |
| **DOM** | Scans text nodes for strings hard-coded into `innerHTML` (`"Maps"`, `"HP:"`, `"You have killed …"`). |

## Install

Grab the `.user.js` for your language from the [Releases page](../../releases), or install it from a raw URL:

```
https://raw.githubusercontent.com/c940949574/kg-translate/main/dist/Kg-translate-zh-CN.user.js
```

Works on both `kittensgame.com` and `kittensgame.com/beta`. Install with Tampermonkey / Violentmonkey / Greasemonkey. No game data is touched, nothing is sent anywhere.

### Language modes

Each language pack declares how it behaves:

- `mode: "force"` — always translate, regardless of the game's UI language. Best for languages where the official/community translation lags behind the game.
- `mode: "match"` — only translate when the game's language matches `meta.languages`. Best for languages that only want to *fill gaps* in the official translation.

## Add a language

```bash
git clone https://github.com/c940949574/Kittensgame-translate.git
cd kg-translate

node tools/new-locale.mjs ja-JP 日本語 Japanese   # 1) scaffold
node tools/verify.mjs ja-JP                      # 2) see what is missing
#    …edit locales/ja-JP.json…
node tools/build.mjs ja-JP                       # 3) build dist/Kg-translate-ja-JP.user.js
```

No dependencies, no build step beyond Node 20+. Open a PR — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Languages with little or no official translation

This is the normal case, not an edge case. The game ships an English dictionary
plus a community layer per language, and those layers are very uneven:

| Language | Community layer (of 2622 EN keys) | What a translator inherits |
|---|---|---|
| ru, ja, zh | ~2550 | dozens of gaps |
| de, fr, es, pl, ko | ~2400–2470 | a few hundred gaps |
| it | 1728 | ~800 keys to translate |
| tr | 1418 | ~1200 keys |
| uk | 847 | ~1600 keys |
| **pt-BR, vi** | **no file at all** | the full table, 2622 keys |

`tools/verify.mjs` always judges gaps **against the pack's own language**, so what
you get is your own to-do list, not somebody else's:

```bash
node tools/verify.mjs uk       # gaps in the Ukrainian layer
node tools/verify.mjs pt-BR    # warns "no translation file", full table
node tools/verify.mjs zh-CN --lang pt-BR   # audit a pack against a hypothetical
```

### Runtime cost of a full-table pack

Measured, not guessed — `node tools/bench-pack.mjs` on Node 22:

| Path | 77 keys | Full 2622 keys |
|---|---|---|
| `$I()` — 3000 calls (one UI render) | 73 µs | 68 µs (**no difference**) |
| Dictionary re-check, steady state (every 500 ms) | 3 µs | 171 µs |
| Dictionary re-check while the game merges layers | 729 µs | 1089 µs |
| Pack size | 5 KB | 164 KB |

`$I()` is the hot path — the game calls it thousands of times per render — and it
does a single O(1) hash lookup, so it is **independent of pack size**. The only
thing that grows is the 500 ms dictionary sweep, which is 0.02% of a 2-second game
tick in steady state, and only runs at that cost for the 1–3 seconds while the
game is still merging language layers. A full-table pack is fine.

### `preferOfficial`: don't block the community forever

A `force` pack overrides everything, including translations the community
publishes *later*. If you want both — "use the official translation whenever it
is a real one, fall back to mine" — declare your language's script:

```jsonc
"meta": {
  "mode": "force",
  "preferOfficial": true,
  "nativeScript": "[\u3000-\u303f\uff00-\uffef\u4e00-\u9fff\uf900-\ufaff]"
}
```

The engine then keeps whatever the official layer says as long as it contains
characters from your language; where the official text is still English (or a
placeholder like `TBD`), yours wins. Default is `false`, which is pure override.

Caveat: scripts that share an alphabet with English weaken the heuristic. For
those, leave it off.

## Project layout

```
locales/<code>.json      language pack: meta + i18n keys + data patches + DOM rules
src/kg-translate.core.js the engine (contains zero language knowledge)
tools/build.mjs          engine + pack  ->  dist/Kg-translate-<code>.user.js
tools/verify.mjs         compare your pack against the live game dictionaries
tools/new-locale.mjs     scaffold a new language
tools/build-full.mjs     build a throwaway full-table pack (not committed)
tools/bench-pack.mjs     measure how pack size affects the hot paths
tools/extract-zh-patch.mjs  one-off: migrate the original single-file zh patch into a pack
dist/                    built, installable userscripts (committed on purpose)
```

## Currently available

| Code | Language | i18n keys | Badges | Map | Notes |
|---|---|---|---|---|---|
| [`zh-CN`](locales/zh-CN.json) | 简体中文 | 75 | 21/21 | ✅ | Migrated from the original single-file patch |

More languages are welcome — see the [Issues](../../issues) tab for "language wanted" requests.

## License

- Engine (`src/`), tools, docs: **MIT**
- Language packs (`locales/`): the pack's own `meta.license` applies (zh-CN is MIT; community packs are encouraged to use [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/))

Kittens Game itself is © its respective authors and is not distributed here.
