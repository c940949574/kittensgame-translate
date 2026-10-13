## What does this PR change?

<!-- language pack / engine bug fix / tooling / docs -->

## Language pack checklist

- [ ] I did **not** touch `src/kg-translate.core.js` (unless this fixes an engine bug, explained below)
- [ ] I ran `node tools/build.mjs <code>` and committed the rebuilt `dist/kg-translate.<code>.user.js`
- [ ] I ran `node tools/verify.mjs <code>` and there are no `extra` / `suspicious` entries for my pack
- [ ] I ran `node --check dist/kg-translate.<code>.user.js`
- [ ] No empty strings, no TODO placeholders, no unreviewed machine translation
- [ ] `{0}`-style placeholders are preserved in order

## What did you translate, and how?

<!--
Approximate key count, and where the terminology comes from
(a game wiki, an existing community translation, a native translation team…).
This matters: reviewers need to judge consistency, not individual words.
-->

## Engine changes (only if any)

<!-- What was broken, why the engine had to change, and why it can't be solved in a pack -->

## Testing

- [ ] Installed the built `dist/` file fresh in Tampermonkey
- [ ] Checked on `/web` and/or `/beta` (which one?):
- [ ] Switched the game's UI language and confirmed the pack behaves as its `meta.mode` promises
