# Language packs

One JSON file per language. A pack is **pure data** — the engine never needs to change to add a language.

## Anatomy

```jsonc
{
  "meta": {
    "code": "zh-CN",              // BCP-47, must match the filename
    "name": "Simplified Chinese",  // English name (for the pack list)
    "nativeName": "简体中文",       // shown in the userscript name
    "description": "…",            // shown in the userscript description
    "mode": "force",               // "force" | "match"
    "languages": ["zh", "zh-CN"],  // used only when mode = "match"
    "author": "",                  // your handle
    "license": "CC BY-SA 4.0",     // license of the *translations*
    "version": "0.1.0",            // bump on every change → drives @version
    "source": "community"
  },
  "i18n":   { "i18n.key": "译文" },
  "data":   { "badges": {…}, "map": { "maps": {…}, "biomes": {…}, "fauna": {…} } },
  "dom":    { "exact": [[…]], "fragment": [[…]], "regex": [[pattern, replacement, flags?]] }
}
```

- `meta.mode: "force"` — translate regardless of the game's UI language (use when your language's in-game translation lags behind).
- `meta.mode: "match"` — only translate when the game's language matches `meta.languages` (use to fill gaps only).
- Omit `meta.version` and the build derives one from a content hash — but an explicit version is friendlier in userscript managers.

## Start a new language

```bash
node tools/new-locale.mjs ja-JP 日本語 Japanese
node tools/verify.mjs ja-JP     # prints the keys the game still shows in English
```

`_template.json` in this folder is the annotated starting point.
