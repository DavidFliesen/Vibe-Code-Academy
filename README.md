# Vibe Code Academy — v1.0.1

**▶ Live app (Cloudflare Pages):** https://vibe-code-academy.pages.dev/
**GitHub repo:** https://github.com/DavidFliesen/Vibe-Code-Academy

*Learn to build with AI — in plain English first, then in Python.*
An **ARTEZIQ** app, created by David "SunTzu" Fliesen.

![Vibe Code Academy](assets/og-image.png)

---

## What it is

Vibe Code Academy is a free, installable, offline-ready Progressive Web App (PWA) that teaches people of every age and skill level how to work with AI: prompting, vibe coding (building apps by describing them), Python for AI, and hands-on AI engineering (LLM APIs, structured output, tool use, agents, RAG, evals and safety).

No account, no tracking, no API keys. Progress is saved on the learner's own device.

## Features

- **4 learning tracks, 24 lessons**, each with a 3-question quiz
  | Track | Level | Lessons |
  |---|---|---|
  | 🧭 AI Explorer | Beginner, all ages | 5 |
  | 🎧 Vibe Coder | Beginner to Intermediate | 6 |
  | 🐍 Python Builder | Intermediate | 6 |
  | 🤖 AI Engineer | Advanced | 7 (incl. capstone) |
- **Real Python in the browser** (Pyodide 0.29.5) — editable, runnable code in lessons plus a full **Python Playground**. Runs in a Web Worker, so infinite loops can be stopped. Python downloads once (~10 MB) and is cached for offline use.
- **`ai_sim`** — a built-in *simulated* LLM (`py/ai_sim.py`) so learners practice real API patterns (messages, system prompts, temperature, max_tokens, JSON output, tool calls, agent loops) with no key and no cost. Advanced lessons also show the real-world Colab + Anthropic SDK version.
- **Prompt Lab** — *Builder* (5-part recipe, 8 templates), *Checkup* (on-device prompt scoring with tips), *App Brief* (pro-quality vibe coding brief)
- **Gamification** — XP, 7 levels, 15 badges, daily streaks
- **Shareable certificates** (PNG) for each completed track, plus social sharing (native share, X, LinkedIn, Facebook)
- **AI Glossary** — 31 terms in plain English, searchable
- **Kid-friendly callouts**, a larger-text toggle, and onboarding that recommends a starting track
- **Export / import progress** (JSON) to move between devices

## Hosting on Cloudflare Pages

The app is plain static files — no build step. Cloudflare Pages deploys it straight from this GitHub repo and redeploys automatically every time you commit.

1. In the Cloudflare dashboard, open **Workers & Pages → Create → Pages → Connect to Git**.
2. Authorize GitHub and pick the **Vibe-Code-Academy** repo, then **Begin setup**.
3. Project name: **vibe-code-academy** (this sets the `vibe-code-academy.pages.dev` address).
4. Build settings: Production branch **main**, Framework preset **None**, Build command **(leave blank)**, Build output directory **/**.
5. **Save and Deploy.** In about a minute the app is live at the link at the top of this file.

If Cloudflare gives you a different address (for example, the name is taken), update it in three places: `liveUrl` in `js/app.js`, and the `og:url` and `og:image` tags in `index.html`.

### The `_headers` file

Cloudflare Pages reads `_headers` automatically. It adds:
- **Security headers** — a Content Security Policy that only allows the app's own files plus the Pyodide Python engine from `cdn.jsdelivr.net`, and blocks framing, plugins and form posts.
- **Caching rules** — `sw.js` and `index.html` are always re-checked so updates reach people quickly; images are cached for a week.

## File structure

```
index.html              App shell
manifest.webmanifest    PWA manifest
sw.js                   Service worker (offline cache)
_headers                Cloudflare Pages security + caching headers
css/app.css             Styles (hardcoded hex colors)
js/app.js               App logic, router, views, XP/badges, certificates
js/promptlab.js         Prompt Builder, Checkup and App Brief
js/python.js            Python runner (main thread)
js/py-worker.js         Pyodide Web Worker
py/ai_sim.py            Simulated LLM used in lessons and the Playground
data/lessons.js         All tracks, lessons, quizzes, glossary and tips
assets/icons/           App icons (96, 192, 512, maskable, apple-touch)
assets/logo-1024.png    Full-size logo
assets/og-image.png     Social share preview image
```

All JavaScript is ES5 (no `let`/`const`, arrow functions or template literals).

## Customizing

- **Your bio and links:** edit the `CONFIG` block at the top of `js/app.js`.
- **Lessons:** edit `data/lessons.js`. Each lesson has `id`, `title`, `mins`, `summary`, `blocks`, `takeaways` and a 3-question `quiz` (`a` is the index of the correct option). Block types: `p`, `h`, `list`, `tip`, `warn`, `kid`, `prompt`, `compare`, `code` (runnable Python), `codeview` (copy-only code) and `activity`. Text supports `**bold**`, `*italic*` and `` `code` ``.
- **New release:** bump `VERSION` in `sw.js` and `version` in `js/app.js` so installed copies update.

## Tested

v1.0.1 passed a 164-check automated browser test run under the Cloudflare headers: all 24 lessons and quizzes, all 12 Python code blocks, the Playground (stop button, errors, fresh runs), Prompt Lab, certificates, sharing, export/import/reset, offline use after first visit, a friendly message when Python can't download, corrupted saved data, and no sideways scrolling on 6 screen sizes (320 px phones to desktop) at both text sizes. Lighthouse: Accessibility 100, Best Practices 100, SEO 100, Performance 97–99.

## Version history

- **v1.0.1** — Cloudflare Pages hosting (`_headers` with security + caching rules; links now point to `vibe-code-academy.pages.dev`). Quiz answer positions shuffled so the right answer isn't usually "B". App Brief now includes the main device even when "Who it's for" is blank. Service worker always fetches fresh files when a new version installs. Small-phone layout fixes (header, XP chip, tab labels). Accessibility fixes (text contrast, heading order, dialog labels) and a lighter 96 px header icon. Toast messages no longer pile up.
- **v1.0.0** — First release: 4 tracks / 24 lessons with quizzes, in-browser Python with `ai_sim`, Prompt Lab, XP / levels / badges / streaks, track certificates, sharing, glossary, export/import, offline PWA.

---

© ARTEZIQ · Created by David "SunTzu" Fliesen · [Portfolio](https://davidfliesen.github.io)
