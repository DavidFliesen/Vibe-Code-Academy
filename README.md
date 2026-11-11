# Vibe Code Academy — v1.0.0

**▶ Live app:** https://davidfliesen.github.io/Vibe-Code-Academy/

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
- **Prompt Lab**
  - *Builder* — 5-part prompt recipe with 8 starter templates
  - *Checkup* — instant on-device prompt scoring with tips
  - *App Brief* — generates a pro-quality vibe coding brief
- **Gamification** — XP, 7 levels, 15 badges, daily streaks
- **Shareable certificates** (PNG) for each completed track, plus social sharing (native share, X, LinkedIn, Facebook)
- **AI Glossary** — 31 terms in plain English, searchable
- **Kid-friendly callouts**, a larger-text toggle, and onboarding that recommends a starting track
- **Export / import progress** (JSON) to move between devices

## File structure

```
index.html              App shell
manifest.webmanifest    PWA manifest
sw.js                   Service worker (offline cache)
css/app.css             Styles (hardcoded hex colors)
js/app.js               App logic, router, views, XP/badges, certificates
js/promptlab.js         Prompt Builder, Checkup and App Brief
js/python.js            Python runner (main thread)
js/py-worker.js         Pyodide Web Worker
py/ai_sim.py            Simulated LLM used in lessons and the Playground
data/lessons.js         All tracks, lessons, quizzes, glossary and tips
assets/icons/           App icons (192, 512, maskable, apple-touch)
assets/logo-1024.png    Full-size logo
assets/og-image.png     Social share preview image
```

All JavaScript is ES5 (no `let`/`const`, arrow functions or template literals).

## Publish on GitHub Pages

1. Create a repository named **Vibe-Code-Academy** (if you use a different name, update `liveUrl` in `js/app.js` and the `og:url` / `og:image` tags in `index.html`).
2. Upload all files, keeping the folder structure.
3. Go to **Settings → Pages**, set **Source** to *Deploy from a branch*, choose **main** and **/ (root)**, then **Save**.
4. After a minute the app is live at the link at the top of this file.

## Customizing

- **Your bio and links:** edit the `CONFIG` block at the top of `js/app.js`.
- **Lessons:** edit `data/lessons.js`. Each lesson has `id`, `title`, `mins`, `summary`, `blocks`, `takeaways` and a 3-question `quiz` (`a` is the index of the correct option). Block types: `p`, `h`, `list`, `tip`, `warn`, `kid`, `prompt`, `compare`, `code` (runnable Python), `codeview` (copy-only code) and `activity`. Text supports `**bold**`, `*italic*` and `` `code` ``.
- **New release:** bump `VERSION` in `sw.js` and `version` in `js/app.js` so installed copies update.

## Version history

- **v1.0.0** — First release: 4 tracks / 24 lessons with quizzes, in-browser Python with `ai_sim`, Prompt Lab (Builder, Checkup, App Brief), XP / levels / badges / streaks, track certificates, sharing, glossary, export/import, offline PWA.

---

© ARTEZIQ · Created by David "SunTzu" Fliesen · [Portfolio](https://davidfliesen.github.io)
