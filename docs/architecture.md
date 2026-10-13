# Architecture

How `KG Translate` works, and why it is split the way it is. Read this before changing the engine.

## The problem

Kittens Game builds its UI from three very different sources, and each one needs a different approach:

| Source of text | Example | Reachable via `$I`? |
|---|---|---|
| Translation dictionaries | `buildings.accordion.observatory` | ✅ yes |
| Hard-coded strings in managers | badge `"Lotus Eater"`, biome `"forest"` | ❌ no key, no `$I` |
| Strings concatenated into `innerHTML` | `"Hit chance: "`, `"[Cancel]"` | ❌ no key, no `$I` |

Plus a subtlety: the game loads languages in **several passes** (`en.json` → `zh.json` → `crowdin/zh.json`). Anything you write into the dictionary during boot gets overwritten by a later pass. A patch that runs once will silently lose.

## The three layers

```
┌─ i18n layer ────────────────────────────────────────────────┐
│ 1. Object.defineProperty(window, "$I", …)  → intercept reads  │
│ 2. patchMessages() every 500ms → re-write i18nLang.messages   │
│    (loop never stops early: later passes would undo it)      │
└──────────────────────────────────────────────────────────────┘
┌─ data layer ────────────────────────────────────────────────┐
│ game.achievements.badges[] → title / description             │
│ game.village.map.maps / .biomes / .defaultFaunaNames         │
│ Panels re-read these objects every tick (update() compares    │
│ field by field), so one write persists. Still re-checked in   │
│ case a save/load replaces the objects.                       │
└──────────────────────────────────────────────────────────────┘
┌─ DOM layer ─────────────────────────────────────────────────┐
│ MutationObserver on documentElement (childList + characterData)│
│ Only new/changed nodes are visited — the game rewrites numeric │
│ text every tick, a full sweep would be wasteful.               │
│ Every 5s a full sweep catches anything the observer missed.   │
└──────────────────────────────────────────────────────────────┘
```

## Why the loop stops after 10 minutes

`setInterval` runs `patchMessages` + `patchData` for 10 minutes, then `clearInterval`. By then the language layers are merged and the data objects are populated, so the `MutationObserver` alone is enough for new content. The callback is intentionally written as `return false`-style "never stop" logic in the data patchers — there is no "if everything matches, exit" branch, because a save/load can restore English strings long after boot.

## Why the engine holds no language

`src/kg-translate.core.js` must never contain a word, a species, or a place name. If it does, adding a language means editing code — which is exactly what this project exists to avoid.

The only language-adjacent thing the engine knows is **how to match a language**: `meta.mode` (`force` / `match`) and `meta.languages`. That is a matching rule, not vocabulary.

## Why each language builds to its own file

Userscript managers install a single `.user.js`. A runtime `@require` of a remote JSON would work, but then the script breaks offline, breaks on GitHub outages, and makes review harder ("trust this blob?"). One self-contained file per language also means a user never has the wrong language injected, and a bad translation can be rolled back per language.

The cost is duplicated engine bytes (~9 KB) per file. That is the right trade.

## Build pipeline

```
locales/<code>.json ──┐
                      ├──> tools/build.mjs ──> dist/Kg-translate-<code>.user.js
src/kg-translate.core.js ─┘         │
                                    └── structural validation (fails the build)
```

`tools/build.mjs` validates before writing: `meta` completeness, `mode` enum, non-empty strings, array shapes, regex flag types. A malformed pack fails CI instead of failing silently in someone's browser.

`tools/verify.mjs` answers a different question: "what is the game still missing?" It loads the live `en.json` **and** both Chinese layers, and treats a key as *untranslated* when its value is identical to the English original in every layer — because unapproved Crowdin translations are never exported. Only those keys are listed as missing; official text is not this project's business.

## Performance notes

- The i18n layer is O(pack size) every 500 ms — tens of comparisons, negligible.
- The data layer is O(badges + biomes), and `setValue` skips writes when the value already matches, so it stops mutating once applied (it still iterates; that is the price of being immune to save/load).
- The DOM layer only touches changed nodes. `LATIN` pre-filter means CJK-heavy text nodes are skipped without further work.
