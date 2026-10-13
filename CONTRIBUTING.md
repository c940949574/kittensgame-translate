# Contributing

Thanks for helping translate Kittens Game! This project is language-pack-first: **you should never need to touch the engine.**

## The one rule that matters most

**Do not edit `src/kg-translate.core.js` unless you are fixing an engine bug.**

The engine contains zero language knowledge. If you find yourself adding a word, a place name, or a species name to that file, it belongs in `locales/<code>.json` instead.

## Workflow

```bash
# 1. fork + clone
git clone https://github.com/<you>/kg-translate.git
cd kg-translate

# 2. create or update your language pack
node tools/new-locale.mjs pt-BR "Português (Brasil)" "Brazilian Portuguese"

# 3. ask the verifier what is missing
node tools/verify.mjs pt-BR

# 4. fill in locales/pt-BR.json

# 5. build + sanity check
node tools/build.mjs pt-BR
node --check dist/Kg-translate-pt-BR.user.js

# 6. commit BOTH locales/pt-BR.json and dist/Kg-translate-pt-BR.user.js
git commit -am "Add Brazilian Portuguese: 120 keys, 21 badges"
```

`dist/` is committed on purpose so people can install straight from a raw URL. **A PR that changes `locales/` without rebuilding `dist/` will fail CI.**

## Adding a translation

### Missing i18n keys

```jsonc
"i18n": {
  "workshop.topCatDiplomacy.label": "Diplomacia de Alto Nível",
  "workshop.topCatDiplomacy.desc": "Quando promovidos, embaixadores ficam mais habilidosos, mas exigem mais luxo."
}
```

- Keep `{0}`, `{1}` placeholders exactly as they appear upstream, and in the same order.
- Prefer the wording the game community already uses. If the official translation contradicts your language pack for the same term, stay consistent **inside your pack** and mention it in the PR — consistency matters more than matching upstream.

### Badges (no i18n key — hard-coded in JS)

```jsonc
"data": {
  "badges": {
    "lotus": { "title": "Comedor de Lótus", "description": "Mais de 50 resets no total" }
  }
}
```

The `name` is the game's internal id. `tools/verify.mjs` prints every badge the game defines; run it and work through the list.

### Village map (also no i18n key)

```jsonc
"data": {
  "map": {
    "maps":  { "cath": { "title": "…", "description": "…" } },
    "biomes": { "forest": { "title": "…", "desc": "…", "lore": { "5": "…" } } },
    "fauna":  { "giant moth": "Mariposa gigante" }
  }
}
```

- `fauna` keys are the game's English species names — copy them exactly, whitespace included.
- `lore` keys are exploration levels (numbers as strings).

### DOM rules (dead strings baked into `innerHTML`)

```jsonc
"dom": {
  "exact":    [["Map", "Mapa"]],
  "fragment": [["Explorers:", "Exploradores:"]],
  "regex":    [["lvl\\.(\\d+)", "nível $1", "g"]]
}
```

- `exact`: the whole trimmed text node must equal the source.
- `fragment`: replace anywhere in the node; longer strings first (the engine applies them in array order).
- `regex`: `[pattern, replacement, flags?]`. Escape JSON backslashes (`\\d`).

## Choosing `mode`

- `"force"` — translate even when the game's UI language is something else. Use it when your language's in-game translation is incomplete (Chinese, and most community languages today).
- `"match"` — only activate when `meta.languages` matches the game's language. Use it for well-supported languages where you only want to fill gaps without overriding existing official text.

## If your language has little or no official translation

This is the normal case for most languages, and the project is built for it.

`tools/verify.mjs` judges gaps **against your language's own translation files**, not
against English and not against Chinese. Run it and it tells you exactly what is
untranslated for you:

```bash
node tools/verify.mjs uk        # gaps in the Ukrainian community layer
node tools/verify.mjs pt-BR     # pt-BR has no file at all -> full table
```

Current coverage in the game (out of 2622 English keys):

| Language | Community layer | What that means for you |
|---|---|---|
| ru, ja, zh | ~2550 | only dozens of gaps — patch the gaps |
| de, fr, es, pl, ko | ~2400–2470 | a few hundred gaps |
| it | 1728 | ~800 to translate |
| tr | 1418 | ~1200 to translate |
| uk | 847 | ~1600 to translate |
| pt-BR, vi | **no file** | the full table, 2622 keys |

For a language with no official coverage:

- Use `"mode": "force"` — there is nothing to "match" against.
- Translate the whole table, not just the prefixes `verify` lists. The prefixes
  exist because most packs only need to fill gaps; a from-scratch pack should
  cover `achievements.`, `challendge.`, `msg.` and the rest as well.
- **Runtime cost is not a concern.** Measured with `node tools/bench-pack.mjs`:
  a full 2622-key pack adds nothing to `$I()` (it is a single O(1) lookup per
  call), the 500 ms dictionary re-check costs ~171 µs steady / ~1.1 ms while the
  game is still merging language layers, and the pack is 164 KB. You will not
  feel it.
- The real cost is review: 2622 lines need a second pair of eyes, and terminology
  must stay consistent from the first entry to the last.

### The known trade-off of `force`

A full `force` pack overrides **everything**, which means it will also override
better translations the community publishes later. For a language that currently
has no translations at all that is a fair trade; for a well-covered language it
is not, which is why `match` exists. If you want both — "use the official
translation whenever there is one, fall back to mine" — say so in an issue; it is
a small engine flag, not a redesign.

## Quality bar

- No empty strings, no placeholder text like `"TODO"`, no left-over English in a pack that claims to be complete.
- No machine-translation dumps. If you used a translator, review every line.
- Run `node tools/build.mjs --check` and `node --check dist/<your>.user.js` before pushing.
- In the PR description, say roughly how many keys you added and what you based the terminology on.

## Reporting engine bugs

If the engine fails to translate something that *does* have a key, open an issue with:
- the i18n key,
- the text you expected vs. what appeared,
- your language code and pack mode,
- whether it happens on `/web` and/or `/beta`.

Do not fix it inside your language pack — that would hide it for every other language.

## Code of conduct

Be decent. Critique the translation, never the translator.
