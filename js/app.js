/* Vibe Code Academy - main app. ES5 syntax only (no let/const, arrows or template literals).
   An ARTEZIQ app. */
(function () {
  "use strict";

  /* ======================= CONFIG (edit me) ======================= */
  var CONFIG = {
    appName: "Vibe Code Academy",
    version: "1.1.1",
    liveUrl: "https://vibe-code-academy.pages.dev/",
    producer: "ARTEZIQ",
    creator: "David \"SunTzu\" Fliesen",
    creatorTitle: "Hybrid Generative AI Multimedia Developer",
    portfolioUrl: "https://davidfliesen.github.io",
    githubUrl: "https://github.com/DavidFliesen",
    bio: [
      "I've spent 20+ years in multimedia production - from U.S. Navy Combat Camera photojournalism to professional voice over, character animation and AI-driven virtual agents.",
      "Today I build generative AI apps under ARTEZIQ and help people grow their capabilities by embracing artificial intelligence. I completed the Applied Generative AI Specialization (Purdue Online / Simplilearn), and I built this academy to share what I've learned - in plain English first, then in Python.",
      "Want help bringing AI into your work, team or classroom? Visit my portfolio and get in touch."
    ]
  };

  var DATA = window.VCA_DATA || { tracks: [], glossary: [], tips: [] };
  var UPD = window.VCA_UPDATES || { weeks: [], changelog: [] };
  if (!UPD.weeks) { UPD.weeks = []; }
  var STORE_KEY = "vca_state_v1";
  var PG_KEY = "vca_pg_code_v1";

  /* ======================= Data index ======================= */
  var LESSONS = [], LESSON_MAP = {}, TRACK_MAP = {}, ALL_CODE = [];
  (function indexData() {
    for (var t = 0; t < DATA.tracks.length; t++) {
      var tr = DATA.tracks[t];
      tr.order = t;
      TRACK_MAP[tr.id] = tr;
      for (var i = 0; i < tr.lessons.length; i++) {
        var l = tr.lessons[i];
        l.track = tr.id;
        l.num = i + 1;
        LESSONS.push(l);
        LESSON_MAP[l.id] = l;
        for (var b = 0; b < l.blocks.length; b++) {
          if (l.blocks[b].t === "code") {
            ALL_CODE.push({ label: tr.icon + " " + tr.title + " - " + l.title, code: l.blocks[b].x });
          }
        }
      }
    }
  })();

  var LEVELS = [
    [0, "Curious Mind"], [100, "AI Explorer"], [250, "Prompt Crafter"], [500, "Vibe Coder"],
    [800, "Python Builder"], [1150, "AI Engineer"], [1500, "AI Guide"]
  ];

  var BADGES = [
    { id: "first_lesson", icon: "🌱", name: "First Steps", desc: "Finish a lesson" },
    { id: "track_explorer", icon: "🧭", name: "Explorer", desc: "Finish AI Explorer" },
    { id: "track_vibe", icon: "🎧", name: "Vibe Coder", desc: "Finish Vibe Coder" },
    { id: "track_python", icon: "🐍", name: "Pythonista", desc: "Finish Python Builder" },
    { id: "track_engineer", icon: "🤖", name: "AI Engineer", desc: "Finish AI Engineer" },
    { id: "first_run", icon: "▶️", name: "Hello, Python", desc: "Run Python code" },
    { id: "tinkerer", icon: "🔧", name: "Tinkerer", desc: "25 Python runs" },
    { id: "prompt_pro", icon: "✨", name: "Prompt Pro", desc: "Score 80+ in Checkup" },
    { id: "architect", icon: "📐", name: "Architect", desc: "Copy an app brief" },
    { id: "perfect5", icon: "💯", name: "Perfectionist", desc: "5 perfect quizzes" },
    { id: "agent", icon: "🕹️", name: "Agent Builder", desc: "Finish the agent lesson" },
    { id: "streak3", icon: "🔥", name: "On a Roll", desc: "3-day streak" },
    { id: "streak7", icon: "⚡", name: "Unstoppable", desc: "7-day streak" },
    { id: "sharer", icon: "📣", name: "Spread the Word", desc: "Share your progress" },
    { id: "graduate", icon: "🎓", name: "AI Guide", desc: "Finish every lesson" }
  ];

  var PATHS = [
    { track: "explorer", icon: "🌱", title: "I'm brand new to AI", sub: "Start with what AI is and how to talk to it" },
    { track: "vibe", icon: "💬", title: "I use AI chat - now I want to build apps", sub: "Learn vibe coding in plain English" },
    { track: "python", icon: "🐍", title: "I want to learn Python for AI", sub: "Code runs right in your browser" },
    { track: "engineer", icon: "🤖", title: "I code - show me agents, RAG and APIs", sub: "Jump into advanced AI engineering" }
  ];

  /* ======================= State ======================= */
  function defaultState() {
    return { xp: 0, done: {}, badges: {}, streak: { last: "", count: 0 }, name: "", textLg: false,
      onboarded: false, pick: "", runs: 0, last: "", events: {}, shares: 0 };
  }
  function loadState() {
    var s = defaultState();
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        for (var k in o) { if (o.hasOwnProperty(k)) { s[k] = o[k]; } }
      }
    } catch (e) {}
    if (!s.done) { s.done = {}; }
    if (!s.badges) { s.badges = {}; }
    if (!s.events) { s.events = {}; }
    if (!s.streak) { s.streak = { last: "", count: 0 }; }
    return s;
  }
  var state = loadState();
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
    updateChrome();
  }

  /* ======================= Helpers ======================= */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function inline(s) {
    var parts = String(s).split("`");
    var out = "";
    for (var i = 0; i < parts.length; i++) {
      if (i % 2 === 1) { out += "<code>" + esc(parts[i]) + "</code>"; }
      else {
        out += esc(parts[i]).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*\s][^*]*)\*/g, "<em>$1</em>");
      }
    }
    return out;
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  var MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function niceDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
    return m ? MONTHS_SHORT[parseInt(m[2], 10) - 1] + " " + parseInt(m[3], 10) + ", " + m[1] : "";
  }
  function isRecent(iso, days) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
    if (!m) { return false; }
    var t = Date.UTC(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    return Date.now() - t < (days || 30) * 86400000;
  }
  function freshPill(l) {
    if (isRecent(l.added, 30)) { return '<span class="pill pill-new">NEW</span>'; }
    if (isRecent(l.updated, 30)) { return '<span class="pill pill-upd">UPDATED</span>'; }
    return "";
  }
  function levelTags(levels) {
    var h = "";
    for (var i = 0; i < (levels || []).length; i++) {
      var t = TRACK_MAP[levels[i]];
      if (t) { h += '<span class="tag" style="border-color:' + t.color + ";color:" + t.color + '">' + t.icon + " " + esc(t.title) + "</span>"; }
    }
    return h;
  }
  function safeUrl(u) { return /^https:\/\//.test(u || "") ? u : "#"; }

  function shareUrl() {
    var here = location.href.split("#")[0];
    return /^https?:/.test(here) ? here : CONFIG.liveUrl;
  }

  var toastTimer = null, toastQueue = [];
  function toast(msg) {
    toastQueue.push(msg);
    while (toastQueue.length > 3) { toastQueue.shift(); }
    if (!toastTimer) { nextToast(); }
  }
  function nextToast() {
    var el = $("toast");
    if (!toastQueue.length) { toastTimer = null; el.className = ""; return; }
    el.textContent = toastQueue.shift();
    el.className = "show";
    var ms = toastQueue.length > 1 ? 1100 : 1800;
    toastTimer = setTimeout(function () {
      el.className = "";
      toastTimer = setTimeout(nextToast, 220);
    }, ms);
  }

  function copy(text, msg) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      try { ta.setSelectionRange(0, text.length); } catch (e) {}
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e2) {}
      document.body.removeChild(ta);
      toast(ok ? (msg || "Copied!") : "Couldn't copy - select the text and copy it manually.");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(msg || "Copied!"); }, fallback);
    } else { fallback(); }
  }

  function shareText(title, text, url) {
    var data = { title: title, text: text };
    if (url) { data.url = url; }
    if (navigator.share) {
      navigator.share(data)["catch"](function () {});
      return true;
    }
    copy(text + (url ? "\n" + url : ""), "Copied! Paste it anywhere to share.");
    return false;
  }

  /* ======================= XP, levels, badges ======================= */
  function levelInfo(xp) {
    var cur = LEVELS[0], next = null;
    for (var i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i][0]) { cur = LEVELS[i]; next = LEVELS[i + 1] || null; }
    }
    var pct = next ? Math.round(100 * (xp - cur[0]) / (next[0] - cur[0])) : 100;
    return { title: cur[1], min: cur[0], next: next, pct: pct, index: LEVELS.indexOf(cur) + 1 };
  }

  function addXP(n, why) {
    if (!n) { return; }
    var before = levelInfo(state.xp).title;
    state.xp += n;
    toast("+" + n + " XP" + (why ? " - " + why : ""));
    var after = levelInfo(state.xp).title;
    if (after !== before) { toast("🎉 Level up! You're now: " + after); }
  }

  function touchStreak() {
    var today = dayKey();
    if (state.streak.last === today) { return; }
    var y = new Date();
    y.setDate(y.getDate() - 1);
    state.streak.count = state.streak.last === dayKey(y) ? state.streak.count + 1 : 1;
    state.streak.last = today;
  }

  function doneCount(trackId) {
    var n = 0;
    for (var i = 0; i < LESSONS.length; i++) {
      if ((!trackId || LESSONS[i].track === trackId) && state.done[LESSONS[i].id]) { n++; }
    }
    return n;
  }
  function trackComplete(id) { var t = TRACK_MAP[id]; return t && doneCount(id) === t.lessons.length; }
  function perfectCount() {
    var n = 0;
    for (var k in state.done) { if (state.done.hasOwnProperty(k) && state.done[k].score === 3) { n++; } }
    return n;
  }

  function checkBadges() {
    var earned = {
      first_lesson: doneCount() >= 1,
      track_explorer: trackComplete("explorer"),
      track_vibe: trackComplete("vibe"),
      track_python: trackComplete("python"),
      track_engineer: trackComplete("engineer"),
      first_run: state.runs >= 1,
      tinkerer: state.runs >= 25,
      prompt_pro: !!state.events.prompt_pro,
      architect: !!state.events.brief,
      perfect5: perfectCount() >= 5,
      agent: !!state.done.ai4,
      streak3: state.streak.count >= 3,
      streak7: state.streak.count >= 7,
      sharer: state.shares >= 1,
      graduate: doneCount() === LESSONS.length
    };
    for (var i = 0; i < BADGES.length; i++) {
      var b = BADGES[i];
      if (earned[b.id] && !state.badges[b.id]) {
        state.badges[b.id] = Date.now();
        toast(b.icon + " Badge unlocked: " + b.name);
      }
    }
  }

  function labEvent(type, value) {
    if (type === "check" && value >= 80 && !state.events.prompt_pro) {
      state.events.prompt_pro = true;
      addXP(25, "strong prompt!");
    } else if (type === "brief" && !state.events.brief) {
      state.events.brief = true;
      addXP(15, "first app brief");
    } else if (type === "builder" && !state.events.builder) {
      state.events.builder = true;
      addXP(10, "first prompt built");
    } else { return; }
    touchStreak();
    checkBadges();
    save();
  }

  function recordRun() {
    state.runs += 1;
    if (state.runs === 1) { addXP(10, "first Python run"); }
    touchStreak();
    checkBadges();
    save();
  }

  /* ======================= Chrome ======================= */
  function updateChrome() {
    var chip = $("xpChip");
    if (chip) { chip.textContent = state.xp + " XP"; }
    if (state.textLg) { document.body.className = "text-lg"; } else { document.body.className = ""; }
  }
  function setTab(name) {
    var map = { home: "home", learn: "learn", track: "learn", lesson: "learn", lab: "lab", playground: "playground", progress: "progress", glossary: "home", about: "home", news: "home" };
    var active = map[name] || "home";
    var links = document.querySelectorAll(".tabbar a");
    for (var i = 0; i < links.length; i++) {
      links[i].className = links[i].getAttribute("data-tab") === active ? "on" : "";
    }
  }

  /* ======================= Modal ======================= */
  function openModal(html) {
    var m = $("modal");
    m.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' + html + "</div>";
    m.className = "modal-wrap open";
    m.setAttribute("aria-hidden", "false");
    var title = m.querySelector("h2");
    if (title) { title.id = "modalTitle"; m.firstChild.setAttribute("aria-labelledby", "modalTitle"); }
  }
  function closeModal() {
    var m = $("modal");
    m.className = "modal-wrap";
    m.innerHTML = "";
    m.setAttribute("aria-hidden", "true");
  }

  function showOnboarding() {
    var h = "<h2>Welcome to Vibe Code Academy! 👋</h2>";
    h += '<p class="muted">Learn to build with AI - in plain English first, then in Python. Where would you like to start? (You can explore any track anytime.)</p>';
    for (var i = 0; i < PATHS.length; i++) {
      var p = PATHS[i];
      h += '<button type="button" class="path-btn" data-action="pick-path" data-track="' + p.track + '"><span class="pi">' + p.icon + "</span><span><b>" + esc(p.title) + '</b><br><span class="dim">' + esc(p.sub) + "</span></span></button>";
    }
    h += '<p class="dim center">Your progress is saved on this device only. No account needed.</p>';
    openModal(h);
  }

  /* ======================= Views ======================= */
  var view = null;
  var CLIP = [];      // copyable text for the current view
  var CODES = [];     // original code for editable blocks
  var QUIZ = null;

  function trackCard(t) {
    var n = doneCount(t.id), total = t.lessons.length;
    var pct = Math.round(100 * n / total);
    var rec = state.pick === t.id ? '<span class="rec-badge">FOR YOU</span>' : "";
    return '<a class="card track-card" href="#/track/' + t.id + '" style="border-left-color:' + t.color + '">' +
      '<span class="ticon">' + t.icon + "</span>" +
      '<div class="track-level" style="color:' + t.color + '">' + esc(t.level) + "</div>" +
      "<h3>" + esc(t.title) + rec + "</h3>" +
      '<div class="muted">' + esc(t.blurb) + "</div>" +
      '<div class="bar"><i style="width:' + pct + "%;background:" + t.color + ';background-image:none"></i></div>' +
      '<div class="dim" style="margin-top:4px">' + n + " of " + total + " lessons" + (n === total ? " - complete! 🎉" : "") + "</div></a>";
  }

  function firstUndone(trackId) {
    var t = TRACK_MAP[trackId];
    if (!t) { return null; }
    for (var i = 0; i < t.lessons.length; i++) { if (!state.done[t.lessons[i].id]) { return t.lessons[i]; } }
    return null;
  }

  function continueTarget() {
    var l = state.last ? LESSON_MAP[state.last] : null;
    if (l && !state.done[l.id]) { return l; }
    if (l) {
      var nx = firstUndone(l.track);
      if (nx) { return nx; }
    }
    if (state.pick) {
      var p = firstUndone(state.pick);
      if (p) { return p; }
    }
    for (var i = 0; i < LESSONS.length; i++) { if (!state.done[LESSONS[i].id]) { return LESSONS[i]; } }
    return null;
  }

  function levelBlock() {
    var lv = levelInfo(state.xp);
    return '<div class="level-line"><span>Level ' + lv.index + ": <b style=\"color:#fbbf24\">" + esc(lv.title) + "</b></span><span>" +
      (lv.next ? state.xp + " / " + lv.next[0] + " XP" : state.xp + " XP - max level!") + "</span></div>" +
      '<div class="bar"><i style="width:' + lv.pct + '%"></i></div>';
  }

  function renderHome() {
    var tgt = continueTarget();
    var started = doneCount() > 0;
    var tip = DATA.tips.length ? DATA.tips[Math.floor(Date.now() / 86400000) % DATA.tips.length] : "";
    var h = '<section class="hero"><div class="spark">✨</div>';
    h += "<h1>Learn to build with <span>AI</span>.</h1>";
    h += "<p>Start in plain English. Grow into Python, agents and RAG. Hands-on lessons for every age and skill level - free, private and offline-ready.</p>";
    h += '<div class="btn-row">';
    if (tgt) {
      h += '<a class="btn cyan" href="#/lesson/' + tgt.id + '">' + (started ? "Continue: " : "Start: ") + esc(tgt.title) + " →</a>";
    } else {
      h += '<a class="btn green" href="#/progress">🎓 You finished everything! See your progress</a>';
    }
    h += '<a class="btn secondary" href="#/lab/builder">Try the Prompt Lab</a></div>';
    h += '<div style="margin-top:16px">' + levelBlock() + "</div></section>";

    h += weeklyBlock();
    h += '<div class="section"><div class="section-title"><h2>Choose your path</h2><a href="#/learn" class="dim">All tracks</a></div><div class="grid two">';
    for (var i = 0; i < DATA.tracks.length; i++) { h += trackCard(DATA.tracks[i]); }
    h += "</div></div>";

    h += '<div class="section"><div class="section-title"><h2>Tools</h2></div><div class="grid three">';
    h += '<a class="card" href="#/lab/builder"><h3>✨ Prompt Lab</h3><div class="muted">Build prompts, check their strength and write app briefs.</div></a>';
    h += '<a class="card" href="#/playground"><h3>🐍 Python Playground</h3><div class="muted">Write and run real Python - including a simulated LLM.</div></a>';
    h += '<a class="card" href="#/glossary"><h3>📖 AI Glossary</h3><div class="muted">' + DATA.glossary.length + " AI terms explained in plain English.</div></a>";
    h += "</div></div>";

    if (tip) {
      h += '<div class="section callout tip"><div class="ch">Tip of the day</div><p>' + inline(tip) + "</p></div>";
    }

    h += '<div class="section card guide-card"><div class="guide-avatar"><img src="assets/icons/icon-96.png" alt=""></div><div><b>Meet your guide</b><div class="muted">Built by ' + esc(CONFIG.creator) + ", " + esc(CONFIG.creatorTitle) + '.</div><a href="#/about">About the academy →</a></div></div>';
    h += footer();
    view.innerHTML = h;
  }

  function weeklyBlock() {
    var w = UPD.weeks[0];
    if (!w) { return ""; }
    var h = '<div class="section card news-card"><div class="section-title"><h2>\uD83D\uDCF0 This week in AI</h2><span class="dim">' + esc(niceDate(w.date)) + "</span></div>";
    h += '<p class="muted">' + esc(w.summary) + "</p>";
    var news = w.news || [];
    if (news.length) {
      h += '<ul class="news-mini">';
      for (var i = 0; i < news.length && i < 3; i++) { h += "<li>" + esc(news[i].title) + "</li>"; }
      h += "</ul>";
    }
    h += '<div class="btn-row"><a class="btn small" href="#/news">Read the briefing \u2192</a></div>';
    var spot = w.spotlight || [];
    var shown = 0, sh = "";
    for (var s = 0; s < spot.length; s++) {
      var l = LESSON_MAP[spot[s].lesson];
      if (!l) { continue; }
      var t = TRACK_MAP[l.track];
      shown++;
      sh += '<a class="card lesson-item spot" href="#/lesson/' + l.id + '"><span class="lesson-num' + (state.done[l.id] ? " done" : "") + '">' + (state.done[l.id] ? "\u2713" : t.icon) + '</span><span class="li-body"><span class="li-title">' + esc(l.title) + "</span>" + freshPill(l) + '<br><span class="dim">' + esc(spot[s].reason) + "</span></span></a>";
    }
    if (shown) { h += '<h3 class="spot-head">\uD83D\uDD26 This week\'s focus</h3>' + sh; }
    return h + "</div>";
  }

  function renderNews() {
    var h = "<h1>\uD83D\uDCF0 This week in AI</h1>";
    h += '<p class="muted">A weekly, sourced briefing on new AI tools and workflows, written for learners. Researched by an AI agent and reviewed before publishing - always click through to the sources.</p>';
    if (!UPD.weeks.length) {
      h += '<div class="card center"><p class="muted">The first weekly briefing is on its way. Check back soon!</p><a class="btn secondary" href="#/learn">Keep learning</a></div>';
    }
    for (var i = 0; i < UPD.weeks.length; i++) {
      var w = UPD.weeks[i];
      h += '<div class="section"><div class="section-title"><h2>' + esc(niceDate(w.date)) + '</h2><span class="dim">v' + esc(w.version || "") + "</span></div>";
      h += '<p class="muted">' + esc(w.summary) + "</p>";
      var news = w.news || [];
      for (var n = 0; n < news.length; n++) {
        var it = news[n];
        h += '<article class="card news-item"><h3>' + esc(it.title) + "</h3><div>" + levelTags(it.levels) + "</div>";
        h += "<p>" + esc(it.summary) + "</p>";
        h += '<p class="why"><b>Why it matters:</b> ' + esc(it.why) + "</p>";
        h += '<a class="src" href="' + esc(safeUrl(it.url)) + '" target="_blank" rel="noopener">Source: ' + esc(it.source || it.url) + " \u2197</a></article>";
      }
      var spot = w.spotlight || [];
      for (var s = 0; s < spot.length; s++) {
        var l = LESSON_MAP[spot[s].lesson];
        if (l) { h += '<a class="card lesson-item spot" href="#/lesson/' + l.id + '"><span class="lesson-num">\uD83D\uDD26</span><span class="li-body"><span class="li-title">' + esc(l.title) + '</span><br><span class="dim">' + esc(spot[s].reason) + "</span></span></a>"; }
      }
      h += "</div>";
    }
    h += footer();
    view.innerHTML = h;
  }

  function renderLearn() {
    var h = "<h1>Learning tracks</h1>";
    h += '<p class="muted">Four tracks, from your very first prompt to building AI agents. Start anywhere - each lesson has a quick quiz, and every completed track earns a shareable certificate.</p>';
    h += '<div class="grid">';
    for (var i = 0; i < DATA.tracks.length; i++) { h += trackCard(DATA.tracks[i]); }
    h += "</div>";
    if (UPD.weeks.length) { h += '<div class="section"><a class="card" href="#/news"><h3>\uD83D\uDCF0 This week in AI</h3><div class="muted">' + esc(UPD.weeks[0].summary) + "</div></a></div>"; }
    h += '<div class="section card"><h3>How it works</h3><ul style="margin:0;padding-left:20px">' +
      "<li><b>Read and try</b> - short lessons with prompts to copy and code to run</li>" +
      "<li><b>Quiz</b> - get 2 of 3 right to complete a lesson (+50 XP, +20 for a perfect score)</li>" +
      "<li><b>Level up</b> - earn badges and certificates as you go</li></ul></div>";
    h += footer();
    view.innerHTML = h;
  }

  function renderTrack(id) {
    var t = TRACK_MAP[id];
    if (!t) { return renderNotFound(); }
    var h = '<div class="crumbs"><a href="#/learn">← All tracks</a></div>';
    h += '<div class="card track-card" style="border-left-color:' + t.color + '"><span class="ticon">' + t.icon + "</span>";
    h += '<div class="track-level" style="color:' + t.color + '">' + esc(t.level) + "</div><h1>" + esc(t.title) + "</h1>";
    h += '<p class="muted">' + esc(t.blurb) + "</p>";
    var n = doneCount(id);
    h += '<div class="bar"><i style="width:' + Math.round(100 * n / t.lessons.length) + "%;background:" + t.color + ';background-image:none"></i></div>';
    h += '<div class="dim" style="margin-top:4px">' + n + " of " + t.lessons.length + " complete</div>";
    if (n === t.lessons.length) {
      h += '<div class="btn-row"><button class="btn green" type="button" data-action="cert" data-track="' + t.id + '">🎓 Get your certificate</button></div>';
    }
    h += "</div>";
    h += '<div class="section"><ul class="lesson-list">';
    for (var i = 0; i < t.lessons.length; i++) {
      var l = t.lessons[i];
      var d = state.done[l.id];
      h += '<li><a class="card lesson-item" href="#/lesson/' + l.id + '"><span class="lesson-num' + (d ? " done" : "") + '">' + (d ? "✓" : l.num) + "</span>";
      h += '<span class="li-body"><span class="li-title">' + esc(l.title) + "</span>" + freshPill(l) + '<br><span class="dim">' + esc(l.summary) + " · " + l.mins + " min</span></span></a></li>";
    }
    h += "</ul></div>" + footer();
    view.innerHTML = h;
  }

  function block(b) {
    var h = "", i;
    switch (b.t) {
      case "p": return "<p>" + inline(b.x) + "</p>";
      case "h": return "<h2>" + inline(b.x) + "</h2>";
      case "list":
        h = "<ul>";
        for (i = 0; i < b.items.length; i++) { h += "<li>" + inline(b.items[i]) + "</li>"; }
        return h + "</ul>";
      case "tip": return '<div class="callout tip"><div class="ch">💡 Pro tip</div><p>' + inline(b.x) + "</p></div>";
      case "warn": return '<div class="callout warn"><div class="ch">⚠️ Heads up</div><p>' + inline(b.x) + "</p></div>";
      case "kid": return '<div class="callout kid"><div class="ch">🧒 For young learners</div><p>' + inline(b.x) + "</p></div>";
      case "activity":
        h = '<div class="callout activity"><div class="ch">🚀 Try it</div><p>' + inline(b.x) + "</p>";
        if (b.link) { h += '<div class="btn-row"><a class="btn green small" href="' + esc(b.link) + '">' + esc(b.linkText) + "</a></div>"; }
        return h + "</div>";
      case "prompt":
        CLIP.push(b.x);
        return '<div class="prompt-box"><div class="pb-head"><span>💬 ' + esc(b.label) + '</span><button class="btn small secondary" type="button" data-action="copy" data-clip="' + (CLIP.length - 1) + '">Copy</button></div><pre>' + esc(b.x) + "</pre></div>";
      case "compare":
        CLIP.push(b.good);
        return '<div class="compare"><div class="cbox cbad"><div class="clabel">✗ Weak</div>' + esc(b.bad) + '</div><div class="cbox cgood"><div class="clabel">✓ Strong</div>' + esc(b.good) +
          '<div class="btn-row"><button class="btn small secondary" type="button" data-action="copy" data-clip="' + (CLIP.length - 1) + '">Copy strong prompt</button></div></div><div class="cwhy">' + inline(b.why) + "</div></div>";
      case "code":
        CODES.push(b.x);
        i = CODES.length - 1;
        var rows = b.x.split("\n").length + 1;
        return '<div class="code-box"><div class="cb-head"><span>🐍 Python · editable</span><span class="cb-actions">' +
          '<button class="btn small green" type="button" data-action="run-code" data-i="' + i + '">▶ Run</button>' +
          '<button class="btn small secondary" type="button" data-action="reset-code" data-i="' + i + '">Reset</button>' +
          '<button class="btn small secondary" type="button" data-action="to-playground" data-i="' + i + '">Playground</button></span></div>' +
          '<textarea class="code-edit" id="cb-' + i + '" rows="' + rows + '" spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off" aria-label="Python code">' + esc(b.x) + "</textarea>" +
          '<pre class="code-out" id="cbo-' + i + '" aria-live="polite"></pre></div>';
      case "codeview":
        CLIP.push(b.x);
        return '<div class="code-box"><div class="cb-head"><span>📋 ' + esc(b.label) + '</span><span class="cb-actions"><button class="btn small secondary" type="button" data-action="copy" data-clip="' + (CLIP.length - 1) + '">Copy</button></span></div><pre class="code-view">' + esc(b.x) + "</pre></div>";
    }
    return "";
  }

  function lessonNeighbors(l) {
    var t = TRACK_MAP[l.track];
    var idx = l.num - 1;
    var prev = idx > 0 ? t.lessons[idx - 1] : null;
    var next = idx < t.lessons.length - 1 ? t.lessons[idx + 1] : null;
    var nextTrack = DATA.tracks[t.order + 1] || null;
    return { prev: prev, next: next, nextTrack: nextTrack, track: t };
  }

  function renderLesson(id) {
    var l = LESSON_MAP[id];
    if (!l) { return renderNotFound(); }
    var t = TRACK_MAP[l.track];
    state.last = l.id;
    save();
    var h = '<div class="crumbs"><a href="#/track/' + t.id + '">← ' + t.icon + " " + esc(t.title) + "</a></div>";
    h += '<div class="lesson-head"><span class="pill" style="color:' + t.color + '">Lesson ' + l.num + " of " + t.lessons.length + '</span><span class="pill">' + l.mins + " min</span>" +
      freshPill(l) + (state.done[l.id] ? '<span class="pill" style="color:#34d399">✓ Complete</span>' : "") +
      '<h1 style="margin-top:10px">' + esc(l.title) + '</h1><p class="muted">' + esc(l.summary) + "</p></div>";
    h += '<div class="lesson-body">';
    for (var i = 0; i < l.blocks.length; i++) { h += block(l.blocks[i]); }
    h += "</div>";
    h += '<div class="takeaways"><h2>⭐ Key takeaways</h2><ul>';
    for (var k = 0; k < l.takeaways.length; k++) { h += "<li>" + inline(l.takeaways[k]) + "</li>"; }
    h += "</ul></div>";
    if (l.sources && l.sources.length) {
      h += '<div class="sources dim"><b>Sources:</b> ';
      for (var si = 0; si < l.sources.length; si++) {
        h += (si ? " \u00B7 " : "") + '<a href="' + esc(safeUrl(l.sources[si])) + '" target="_blank" rel="noopener">[' + (si + 1) + "]</a>";
      }
      h += "</div>";
    }
    h += '<div class="quiz" id="quizBox"></div>';
    var nb = lessonNeighbors(l);
    h += '<div class="lesson-nav">';
    h += nb.prev ? '<a class="btn secondary" href="#/lesson/' + nb.prev.id + '">← Previous</a>' : '<a class="btn secondary" href="#/track/' + t.id + '">← Track</a>';
    if (nb.next) { h += '<a class="btn secondary" href="#/lesson/' + nb.next.id + '">Next →</a>'; }
    else if (nb.nextTrack) { h += '<a class="btn secondary" href="#/track/' + nb.nextTrack.id + '">Next track: ' + esc(nb.nextTrack.title) + " →</a>"; }
    h += "</div>" + footer();
    view.innerHTML = h;
    QUIZ = { lesson: l, picks: [], submitted: false };
    renderQuiz();
  }

  function renderQuiz() {
    var box = $("quizBox");
    if (!box || !QUIZ) { return; }
    var l = QUIZ.lesson;
    var h = "<h2>🧠 Quick quiz</h2>";
    if (state.done[l.id]) { h += '<p class="dim">Already complete (best score ' + state.done[l.id].score + "/3). Retake it anytime.</p>"; }
    for (var q = 0; q < l.quiz.length; q++) {
      var item = l.quiz[q];
      h += '<div class="qitem"><div class="qtext">' + (q + 1) + ". " + esc(item.q) + "</div>";
      for (var o = 0; o < item.options.length; o++) {
        var cls = "qopt";
        if (QUIZ.submitted) {
          if (o === item.a) { cls += " right"; }
          else if (QUIZ.picks[q] === o) { cls += " wrong"; }
        } else if (QUIZ.picks[q] === o) { cls += " sel"; }
        h += '<button type="button" class="' + cls + '" data-action="qpick" data-q="' + q + '" data-o="' + o + '"' + (QUIZ.submitted ? " disabled" : "") + ">" + esc(item.options[o]) + "</button>";
      }
      if (QUIZ.submitted) {
        h += '<div class="qwhy">' + (QUIZ.picks[q] === item.a ? "✅ " : "❌ ") + esc(item.why) + "</div>";
      }
      h += "</div>";
    }
    if (!QUIZ.submitted) {
      h += '<button class="btn" type="button" data-action="qsubmit">Check answers</button>';
    } else {
      var score = QUIZ.score;
      var pass = score >= 2;
      h += '<div class="qresult ' + (pass ? "pass" : "fail") + '"><div class="big">' + score + " / 3 " + (score === 3 ? "🌟 Perfect!" : pass ? "🎉 Passed!" : "Almost!") + "</div>";
      h += "<p>" + (pass ? "Lesson complete. Nice work!" : "Get 2 of 3 to complete the lesson. Review the explanations and try again.") + "</p>";
      h += '<div class="btn-row" style="justify-content:center">';
      var nb = lessonNeighbors(l);
      if (pass && nb.next) { h += '<a class="btn green" href="#/lesson/' + nb.next.id + '">Next lesson →</a>'; }
      else if (pass && trackComplete(l.track)) { h += '<button class="btn green" type="button" data-action="cert" data-track="' + l.track + '">🎓 Get certificate</button>'; }
      else if (pass) { h += '<a class="btn green" href="#/track/' + l.track + '">Back to track</a>'; }
      h += '<button class="btn secondary" type="button" data-action="qretry">Retake quiz</button></div></div>';
    }
    box.innerHTML = h;
  }

  function submitQuiz() {
    var l = QUIZ.lesson;
    for (var q = 0; q < l.quiz.length; q++) {
      if (typeof QUIZ.picks[q] !== "number") { toast("Answer all 3 questions first."); return; }
    }
    var score = 0;
    for (var i = 0; i < l.quiz.length; i++) { if (QUIZ.picks[i] === l.quiz[i].a) { score++; } }
    QUIZ.submitted = true;
    QUIZ.score = score;
    if (score >= 2) { completeLesson(l, score); }
    renderQuiz();
  }

  function completeLesson(l, score) {
    var prev = state.done[l.id];
    var gained = 0;
    if (!prev) {
      gained = 50 + (score === 3 ? 20 : 0);
      state.done[l.id] = { score: score, at: Date.now() };
    } else if (score > prev.score) {
      if (score === 3) { gained = 20; }
      prev.score = score;
    }
    touchStreak();
    addXP(gained, prev ? "perfect score" : "lesson complete");
    var wasComplete = !!state.badges["track_" + l.track];
    checkBadges();
    save();
    if (!wasComplete && trackComplete(l.track)) {
      toast("🎓 Track complete! Your certificate is ready.");
    }
  }

  /* ---------- Code running ---------- */
  function addOut(el, text, cls) {
    var span = document.createElement("span");
    if (cls) { span.className = cls; }
    span.textContent = text + "\n";
    el.appendChild(span);
    el.scrollTop = el.scrollHeight;
  }

  function setRunButtons(disabled, except) {
    var btns = document.querySelectorAll('[data-action="run-code"],#pgRun');
    for (var i = 0; i < btns.length; i++) { if (btns[i] !== except) { btns[i].disabled = disabled; } }
  }

  function startRun(code, outEl, btn) {
    if (!window.VCA_PY) { toast("Python runner not loaded."); return; }
    if (window.VCA_PY.isRunning()) { toast("Something is already running."); return; }
    outEl.style.display = "block";
    outEl.innerHTML = "";
    var label = btn.innerHTML, action = btn.getAttribute("data-action");
    btn.innerHTML = "■ Stop";
    btn.setAttribute("data-action", "stop-code");
    var hadGreen = btn.className.indexOf("green") >= 0;
    btn.className = btn.className.replace(" green", "") + " danger";
    setRunButtons(true, btn);
    var t0 = Date.now(), printed = false;
    window.VCA_PY.run(code, {
      onStatus: function (s) { addOut(outEl, "⏳ " + s, "sys"); },
      onOut: function (s) { printed = true; addOut(outEl, s, ""); },
      onErr: function (s) { printed = true; addOut(outEl, s, "err"); },
      onDone: function (err, stopped) {
        if (err) { addOut(outEl, err, stopped ? "sys" : "err"); }
        else {
          if (!printed) { addOut(outEl, "(Finished - no output. Use print() to show results.)", "sys"); }
          addOut(outEl, "✓ Finished in " + ((Date.now() - t0) / 1000).toFixed(1) + "s", "sys");
        }
        btn.innerHTML = label;
        btn.setAttribute("data-action", action);
        btn.className = btn.className.replace(" danger", "") + (hadGreen ? " green" : "");
        setRunButtons(false);
        if (!stopped && !(err && /couldn't load|crashed/.test(err))) { recordRun(); }
      }
    });
  }

  function editorKeys(ta, onRun) {
    ta.addEventListener("keydown", function (e) {
      if (e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        var s = ta.selectionStart, en = ta.selectionEnd;
        ta.value = ta.value.substring(0, s) + "    " + ta.value.substring(en);
        ta.selectionStart = ta.selectionEnd = s + 4;
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && onRun) {
        e.preventDefault();
        onRun();
      }
    });
  }

  /* ---------- Prompt Lab ---------- */
  var labCtx = { esc: esc, toast: toast, copy: copy, event: labEvent, shareText: function (title, text) { shareText(title, text); } };

  function renderLab(mode) {
    if (mode !== "check" && mode !== "brief") { mode = "builder"; }
    var h = "<h1>✨ Prompt Lab</h1>";
    h += '<div class="tabs"><a href="#/lab/builder"' + (mode === "builder" ? ' class="on"' : "") + ">Builder</a>" +
      '<a href="#/lab/check"' + (mode === "check" ? ' class="on"' : "") + ">Checkup</a>" +
      '<a href="#/lab/brief"' + (mode === "brief" ? ' class="on"' : "") + ">App Brief</a></div>";
    h += '<div id="labRoot"></div>' + footer();
    view.innerHTML = h;
    var root = $("labRoot");
    if (!window.VCA_LAB) { root.innerHTML = '<p class="muted">Prompt Lab failed to load.</p>'; return; }
    if (mode === "check") { window.VCA_LAB.renderCheck(root, labCtx); }
    else if (mode === "brief") { window.VCA_LAB.renderBrief(root, labCtx); }
    else { window.VCA_LAB.renderBuilder(root, labCtx); }
  }

  /* ---------- Playground ---------- */
  var PENDING_PG = null;
  var PG_DEFAULT = "# Welcome to the Python Playground!\n# Write code, then press Run (or Ctrl/Cmd + Enter).\n\nimport ai_sim  # a simulated, offline LLM for practice\n\nprint(\"2 + 2 =\", 2 + 2)\nprint(ai_sim.ask(\"Tell me a joke\"))\n";

  function renderPlayground() {
    var code = PENDING_PG;
    PENDING_PG = null;
    if (code == null) {
      try { code = localStorage.getItem(PG_KEY); } catch (e) { code = null; }
    }
    if (code == null) { code = PG_DEFAULT; }
    var h = "<h1>🐍 Python Playground</h1>";
    h += '<p class="muted">Real Python running in your browser. The standard library and <code>ai_sim</code> (a simulated LLM) are built in.</p>';
    h += '<div class="pg-toolbar"><select id="pgEx" aria-label="Load an example"><option value="">Load an example...</option>';
    for (var i = 0; i < ALL_CODE.length; i++) { h += '<option value="' + i + '">' + esc(ALL_CODE[i].label) + "</option>"; }
    h += "</select></div>";
    h += '<div class="code-box"><div class="cb-head"><span>main.py</span><span class="cb-actions">' +
      '<button class="btn small green" type="button" id="pgRun" data-action="pg-run">▶ Run</button>' +
      '<button class="btn small secondary" type="button" data-action="pg-copy">Copy</button>' +
      '<button class="btn small secondary" type="button" data-action="pg-clear">Clear output</button>' +
      '<button class="btn small secondary" type="button" data-action="pg-new">New</button></span></div>' +
      '<textarea class="code-edit pg-editor" id="pgCode" spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off" aria-label="Python editor">' + esc(code) + "</textarea>" +
      '<pre class="code-out pg-out" id="pgOut" aria-live="polite"><span class="sys">Output appears here.</span></pre></div>';
    h += '<div class="callout tip"><div class="ch">💡 Good to know</div><p>The first Run downloads Python (~10 MB) and caches it so it works offline afterward. <code>input()</code> isn\'t available here - set variables instead. For packages like numpy or pandas and for real AI API calls, use <b>Google Colab</b>.</p></div>';
    h += '<div class="callout"><div class="ch" style="color:#c4b5fd">ai_sim cheat sheet</div><pre class="code-view" style="background:transparent;padding:0">ai_sim.ask("prompt", system=None, temperature=0.7, max_tokens=300)  -> text\nai_sim.chat(messages, system=None, temperature=0.7,\n            max_tokens=300, tools=None)  -> dict\nai_sim.count_tokens("text")  -> int</pre></div>';
    h += footer();
    view.innerHTML = h;
    var ta = $("pgCode");
    ta.addEventListener("input", function () { try { localStorage.setItem(PG_KEY, ta.value); } catch (e) {} });
    editorKeys(ta, function () { var b = $("pgRun"); if (b && !b.disabled && b.getAttribute("data-action") === "pg-run") { b.click(); } });
    $("pgEx").addEventListener("change", function (e) {
      var v = e.target.value;
      if (v === "") { return; }
      ta.value = ALL_CODE[parseInt(v, 10)].code;
      try { localStorage.setItem(PG_KEY, ta.value); } catch (er) {}
      e.target.value = "";
      toast("Example loaded - press Run!");
    });
  }

  /* ---------- Progress ---------- */
  function renderProgress() {
    var h = "<h1>🏆 Your progress</h1>";
    h += '<div class="card">' + levelBlock() + "</div>";
    h += '<div class="section stats">' +
      '<div class="stat"><b>' + state.xp + "</b><span>Total XP</span></div>" +
      '<div class="stat"><b>' + doneCount() + "/" + LESSONS.length + "</b><span>Lessons done</span></div>" +
      '<div class="stat"><b>' + state.streak.count + "</b><span>Day streak</span></div>" +
      '<div class="stat"><b>' + state.runs + "</b><span>Python runs</span></div></div>";

    h += '<div class="section"><div class="section-title"><h2>Badges</h2><span class="dim">' + Object.keys(state.badges).length + " / " + BADGES.length + '</span></div><div class="badges">';
    for (var i = 0; i < BADGES.length; i++) {
      var b = BADGES[i];
      h += '<div class="badge' + (state.badges[b.id] ? "" : " locked") + '" title="' + esc(b.desc) + '"><span class="bi">' + b.icon + '</span><span class="bn">' + esc(b.name) + '</span><span class="bd">' + esc(b.desc) + "</span></div>";
    }
    h += "</div></div>";

    h += '<div class="section card"><h3>🎓 Certificates</h3>';
    h += '<div class="field"><label for="certName">Name on your certificates</label><input type="text" id="certName" placeholder="Your name" value="' + esc(state.name) + '"></div>';
    for (var t = 0; t < DATA.tracks.length; t++) {
      var tr = DATA.tracks[t];
      var c = trackComplete(tr.id);
      h += '<div class="cert-row"><span>' + tr.icon + " <b>" + esc(tr.title) + '</b><br><span class="dim">' + doneCount(tr.id) + "/" + tr.lessons.length + " lessons</span></span>";
      h += c ? '<button class="btn small green" type="button" data-action="cert" data-track="' + tr.id + '">View</button>' : '<a class="btn small secondary" href="#/track/' + tr.id + '">Continue</a>';
      h += "</div>";
    }
    h += "</div>";

    h += '<div class="section card"><h3>📣 Share your journey</h3><p class="muted">Inspire friends and coworkers to grow their AI skills too.</p><div class="btn-row"><button class="btn" type="button" data-action="share-progress">Share my progress</button></div></div>';

    h += '<div class="section card"><h3>More</h3><div class="btn-row">' +
      '<a class="btn secondary" href="#/news">\uD83D\uDCF0 This week in AI</a>' +
      '<a class="btn secondary" href="#/glossary">📖 Glossary</a>' +
      '<a class="btn secondary" href="#/about">ℹ️ About</a>' +
      '<button class="btn secondary" type="button" data-action="choose-path">🧭 Change my path</button></div>' +
      '<p class="dim" style="margin-top:12px">Progress is saved on this device only. Back it up or move it to another device:</p><div class="btn-row">' +
      '<button class="btn small secondary" type="button" data-action="export">Export progress</button>' +
      '<label class="btn small secondary" for="importFile">Import progress</label><input type="file" id="importFile" accept="application/json,.json" style="display:none">' +
      '<button class="btn small danger" type="button" data-action="reset-all">Reset everything</button></div></div>';
    h += footer();
    view.innerHTML = h;
    $("certName").addEventListener("input", function (e) { state.name = e.target.value; save(); });
    $("importFile").addEventListener("change", importProgress);
  }

  function progressSummary() {
    var lv = levelInfo(state.xp);
    var parts = [];
    for (var t = 0; t < DATA.tracks.length; t++) {
      if (trackComplete(DATA.tracks[t].id)) { parts.push(DATA.tracks[t].title); }
    }
    var txt = "I'm learning to build with AI on Vibe Code Academy! 🚀 Level " + lv.index + " (" + lv.title + "), " + doneCount() + " lessons done";
    if (parts.length) { txt += ", completed: " + parts.join(", "); }
    return txt + ". Free for every age and skill level:";
  }

  function shareProgressModal() {
    var url = shareUrl();
    var txt = progressSummary();
    var h = "<h2>Share your progress</h2><div class=\"output-box\" style=\"min-height:0\">" + esc(txt) + "<br>" + esc(url) + "</div>";
    h += '<div class="btn-row">';
    if (navigator.share) { h += '<button class="btn" type="button" data-action="native-share">Share...</button>'; }
    h += '<a class="btn secondary" target="_blank" rel="noopener" data-action="social" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(txt) + "&url=" + encodeURIComponent(url) + '">X / Twitter</a>';
    h += '<a class="btn secondary" target="_blank" rel="noopener" data-action="social" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url) + '">LinkedIn</a>';
    h += '<a class="btn secondary" target="_blank" rel="noopener" data-action="social" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '">Facebook</a>';
    h += '<button class="btn secondary" type="button" data-action="copy-progress">Copy text</button></div>';
    h += '<div class="btn-row"><button class="btn secondary" type="button" data-action="modal-close">Close</button></div>';
    openModal(h);
  }

  function markShared() {
    state.shares += 1;
    checkBadges();
    save();
  }

  /* ---------- Certificate ---------- */
  function drawCert(cv, t, name, done) {
    var W = 1600, H = 1100;
    cv.width = W;
    cv.height = H;
    var c = cv.getContext("2d");
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#241a6b");
    g.addColorStop(0.55, "#0d0b1f");
    g.addColorStop(1, "#0e3550");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    var bg = c.createLinearGradient(0, 0, W, 0);
    bg.addColorStop(0, "#22d3ee");
    bg.addColorStop(0.5, "#8b5cf6");
    bg.addColorStop(1, "#f472b6");
    c.lineWidth = 14;
    c.strokeStyle = bg;
    c.strokeRect(40, 40, W - 80, H - 80);
    c.lineWidth = 2;
    c.strokeStyle = "#3b3470";
    c.strokeRect(72, 72, W - 144, H - 144);
    c.textAlign = "center";
    c.textBaseline = "alphabetic";
    var sans = "-apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
    c.fillStyle = "#22d3ee";
    c.font = "700 34px " + sans;
    c.fillText("VIBE CODE ACADEMY", W / 2, 190);
    c.fillStyle = "#ffffff";
    c.font = "800 78px " + sans;
    c.fillText("Certificate of Completion", W / 2, 295);
    c.fillStyle = "#a7a1d4";
    c.font = "400 34px " + sans;
    c.fillText("This certifies that", W / 2, 385);
    var nm = name || "A Future AI Builder";
    var size = 96;
    c.font = "700 " + size + "px Georgia, 'Times New Roman', serif";
    while (c.measureText(nm).width > W - 360 && size > 40) {
      size -= 4;
      c.font = "700 " + size + "px Georgia, 'Times New Roman', serif";
    }
    c.fillStyle = "#fbbf24";
    c.fillText(nm, W / 2, 505);
    c.fillStyle = "#3b3470";
    c.fillRect(W / 2 - 420, 535, 840, 3);
    c.fillStyle = "#eeeaff";
    c.font = "400 36px " + sans;
    c.fillText("has successfully completed the", W / 2, 605);
    c.fillStyle = t.color;
    c.font = "800 66px " + sans;
    c.fillText(t.icon + " " + t.title + " track", W / 2, 695);
    c.fillStyle = "#a7a1d4";
    c.font = "400 30px " + sans;
    c.fillText(t.level + " · " + t.lessons.length + " lessons with quizzes", W / 2, 750);
    var d = new Date();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    c.font = "400 28px " + sans;
    c.fillStyle = "#c4b5fd";
    c.textAlign = "left";
    c.fillText(months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear(), 130, H - 140);
    c.textAlign = "right";
    c.fillText("An " + CONFIG.producer + " app · Created by " + CONFIG.creator, W - 130, H - 140);
    var img = new Image();
    img.onload = function () {
      c.drawImage(img, W / 2 - 60, H - 325, 120, 120);
      if (done) { done(); }
    };
    img.onerror = function () { if (done) { done(); } };
    img.src = "assets/icons/icon-512.png";
  }

  function showCert(trackId) {
    var t = TRACK_MAP[trackId];
    if (!t || !trackComplete(trackId)) { toast("Finish every lesson in this track to unlock the certificate."); return; }
    var h = "<h2>🎓 " + esc(t.title) + " certificate</h2>";
    h += '<div class="field"><label for="certName2">Name on certificate</label><input type="text" id="certName2" value="' + esc(state.name) + '" placeholder="Your name"></div>';
    h += '<canvas id="certCanvas" class="cert-canvas" aria-label="Certificate image"></canvas>';
    h += '<div class="btn-row"><button class="btn green" type="button" data-action="cert-download">Download</button>';
    h += '<button class="btn" type="button" data-action="cert-share">Share</button>';
    h += '<button class="btn secondary" type="button" data-action="modal-close">Close</button></div>';
    openModal(h);
    var cv = $("certCanvas");
    cv.setAttribute("data-track", trackId);
    drawCert(cv, t, state.name);
    $("certName2").addEventListener("input", function (e) {
      state.name = e.target.value;
      save();
      drawCert(cv, t, state.name);
    });
  }

  function certDownload() {
    var cv = $("certCanvas");
    if (!cv) { return; }
    var a = document.createElement("a");
    a.href = cv.toDataURL("image/png");
    a.download = "VibeCodeAcademy-" + cv.getAttribute("data-track") + "-certificate.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function certShare() {
    var cv = $("certCanvas");
    if (!cv) { return; }
    var t = TRACK_MAP[cv.getAttribute("data-track")];
    var text = "I just completed the " + t.title + " track on Vibe Code Academy! 🎓🚀";
    if (cv.toBlob && navigator.canShare && window.File) {
      cv.toBlob(function (blob) {
        try {
          var file = new File([blob], "VibeCodeAcademy-certificate.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: "My certificate", text: text + " " + shareUrl() }).then(markShared, function () {});
            return;
          }
        } catch (e) {}
        if (shareText("My certificate", text, shareUrl())) { markShared(); }
      }, "image/png");
    } else {
      shareText("My certificate", text, shareUrl());
      markShared();
    }
  }

  /* ---------- Export / import / reset ---------- */
  function exportProgress() {
    var payload = { app: "vibe-code-academy", version: CONFIG.version, exported: new Date().toISOString(), state: state };
    try { payload.lab = JSON.parse(localStorage.getItem("vca_lab_v1") || "null"); } catch (e) {}
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vibe-code-academy-progress-" + dayKey() + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    toast("Progress exported.");
  }

  function importProgress(e) {
    var f = e.target.files && e.target.files[0];
    if (!f) { return; }
    var r = new FileReader();
    r.onload = function () {
      try {
        var o = JSON.parse(r.result);
        if (!o || o.app !== "vibe-code-academy" || !o.state) { throw new Error("bad file"); }
        var s = defaultState();
        for (var k in o.state) { if (o.state.hasOwnProperty(k)) { s[k] = o.state[k]; } }
        state = s;
        if (o.lab) { try { localStorage.setItem("vca_lab_v1", JSON.stringify(o.lab)); } catch (e2) {} }
        save();
        toast("Progress imported!");
        route();
      } catch (err) {
        toast("That file isn't a Vibe Code Academy progress file.");
      }
    };
    r.readAsText(f);
  }

  function confirmReset() {
    openModal("<h2>Reset everything?</h2><p class=\"muted\">This erases your XP, lessons, badges and saved prompts on this device. Tip: export your progress first.</p>" +
      '<div class="btn-row"><button class="btn danger" type="button" data-action="reset-yes">Yes, reset</button><button class="btn secondary" type="button" data-action="modal-close">Cancel</button></div>');
  }

  /* ---------- Glossary / About / misc ---------- */
  function renderGlossary() {
    var h = "<h1>📖 AI Glossary</h1><p class=\"muted\">Plain-English definitions of the words you'll hear in the AI world.</p>";
    h += '<input type="search" class="search" id="glossSearch" placeholder="Search terms..." aria-label="Search the glossary">';
    h += '<div id="glossList"></div>' + footer();
    view.innerHTML = h;
    var list = $("glossList");
    function draw(q) {
      q = (q || "").toLowerCase();
      var out = "";
      var n = 0;
      for (var i = 0; i < DATA.glossary.length; i++) {
        var g = DATA.glossary[i];
        if (!q || g.term.toLowerCase().indexOf(q) >= 0 || g.def.toLowerCase().indexOf(q) >= 0) {
          out += '<div class="gloss-item"><b>' + esc(g.term) + "</b><br>" + esc(g.def) + "</div>";
          n++;
        }
      }
      list.innerHTML = n ? out : '<p class="muted">No matches. Try another word.</p>';
    }
    $("glossSearch").addEventListener("input", function (e) { draw(e.target.value); });
    draw("");
  }

  function renderAbout() {
    var h = "<h1>About the academy</h1>";
    h += '<div class="card"><p><b>' + esc(CONFIG.appName) + "</b> helps people of every age and skill level learn to work with AI - starting with plain-English prompting and vibe coding, and growing into Python, LLM APIs, tool use, agents, RAG and evals.</p>";
    h += '<p class="muted">Everything runs on your device. No account, no tracking, no ads. Lessons work offline after your first visit.</p></div>';
    h += '<div class="section card"><div class="guide-card" style="margin-bottom:12px"><div class="guide-avatar"><img src="assets/icons/icon-96.png" alt=""></div><div><h3 style="margin:0">' + esc(CONFIG.creator) + '</h3><div class="muted">' + esc(CONFIG.creatorTitle) + "</div></div></div>";
    for (var i = 0; i < CONFIG.bio.length; i++) { h += "<p>" + esc(CONFIG.bio[i]) + "</p>"; }
    h += '<div class="btn-row"><a class="btn cyan" href="' + esc(CONFIG.portfolioUrl) + '" target="_blank" rel="noopener">Visit my portfolio</a>' +
      '<a class="btn secondary" href="' + esc(CONFIG.githubUrl) + '" target="_blank" rel="noopener">GitHub</a></div></div>';
    h += '<div class="section card"><h3>Under the hood</h3><ul style="margin:0;padding-left:20px">' +
      "<li>Installable Progressive Web App with offline support</li>" +
      "<li>Real Python via Pyodide " + esc(window.VCA_PY ? window.VCA_PY.version : "") + " (CPython compiled to WebAssembly)</li>" +
      "<li><code>ai_sim</code> - a simulated LLM so you can practice API patterns with no key and no cost</li>" +
      "<li>Your progress lives in your browser's local storage</li></ul></div>";
    h += footer();
    view.innerHTML = h;
  }

  function renderNotFound() {
    view.innerHTML = '<div class="card center"><h2>Page not found</h2><p class="muted">That page doesn\'t exist.</p><a class="btn" href="#/home">Go home</a></div>';
  }

  function footer() {
    return '<div class="footer">' + esc(CONFIG.appName) + " v" + esc(CONFIG.version) + " · An " + esc(CONFIG.producer) + ' app<br>Created by <a href="#/about">' + esc(CONFIG.creator) + "</a></div>";
  }

  /* ======================= Router ======================= */
  function route() {
    var hash = location.hash.replace(/^#\/?/, "");
    var parts = hash.split("/");
    var name = parts[0] || "home";
    CLIP = [];
    CODES = [];
    QUIZ = null;
    if (window.VCA_PY && window.VCA_PY.isRunning()) { window.VCA_PY.stop(); }
    switch (name) {
      case "home": renderHome(); break;
      case "learn": renderLearn(); break;
      case "track": renderTrack(parts[1]); break;
      case "lesson": renderLesson(parts[1]); break;
      case "lab": renderLab(parts[1]); break;
      case "playground": renderPlayground(); break;
      case "progress": renderProgress(); break;
      case "glossary": renderGlossary(); break;
      case "about": renderAbout(); break;
      case "news": renderNews(); break;
      default: renderNotFound();
    }
    setTab(name);
    window.scrollTo(0, 0);
    var editors = view.querySelectorAll(".code-edit");
    for (var i = 0; i < editors.length; i++) {
      (function (ta) {
        if (ta.id === "pgCode") { return; }
        editorKeys(ta, function () {
          var idx = ta.id.replace("cb-", "");
          var btn = view.querySelector('[data-i="' + idx + '"][data-action="run-code"]');
          if (btn && !btn.disabled) { btn.click(); }
        });
      })(editors[i]);
    }
  }

  /* ======================= Click handling ======================= */
  document.addEventListener("click", function (e) {
    var el = e.target;
    while (el && el !== document && !el.getAttribute("data-action")) { el = el.parentNode; }
    if (!el || el === document) {
      if (e.target && e.target.id === "modal") {
        if (!state.onboarded) { state.onboarded = true; save(); }
        closeModal();
      }
      return;
    }
    var a = el.getAttribute("data-action");
    var idx = parseInt(el.getAttribute("data-i"), 10);
    switch (a) {
      case "copy": copy(CLIP[parseInt(el.getAttribute("data-clip"), 10)]); break;
      case "run-code": startRun($("cb-" + idx).value, $("cbo-" + idx), el); break;
      case "stop-code": if (window.VCA_PY) { window.VCA_PY.stop(); } break;
      case "reset-code": $("cb-" + idx).value = CODES[idx]; toast("Code reset."); break;
      case "to-playground": PENDING_PG = $("cb-" + idx).value; try { localStorage.setItem(PG_KEY, PENDING_PG); } catch (er) {} location.hash = "#/playground"; break;
      case "pg-run": startRun($("pgCode").value, $("pgOut"), el); break;
      case "pg-copy": copy($("pgCode").value, "Code copied!"); break;
      case "pg-clear": $("pgOut").innerHTML = ""; break;
      case "pg-new": $("pgCode").value = PG_DEFAULT; try { localStorage.setItem(PG_KEY, PG_DEFAULT); } catch (er2) {} break;
      case "qpick":
        if (!QUIZ || QUIZ.submitted) { return; }
        QUIZ.picks[parseInt(el.getAttribute("data-q"), 10)] = parseInt(el.getAttribute("data-o"), 10);
        renderQuiz();
        break;
      case "qsubmit": submitQuiz(); break;
      case "qretry": QUIZ.picks = []; QUIZ.submitted = false; renderQuiz(); break;
      case "pick-path":
        state.pick = el.getAttribute("data-track");
        state.onboarded = true;
        save();
        closeModal();
        location.hash = "#/track/" + state.pick;
        break;
      case "choose-path": showOnboarding(); break;
      case "toggle-text": state.textLg = !state.textLg; save(); toast(state.textLg ? "Larger text on" : "Standard text size"); break;
      case "cert": showCert(el.getAttribute("data-track")); break;
      case "cert-download": certDownload(); break;
      case "cert-share": certShare(); break;
      case "share-progress": shareProgressModal(); break;
      case "native-share":
        navigator.share({ title: "Vibe Code Academy", text: progressSummary(), url: shareUrl() }).then(markShared, function () {});
        break;
      case "social": markShared(); return;
      case "copy-progress": copy(progressSummary() + " " + shareUrl(), "Copied! Paste it anywhere."); markShared(); break;
      case "modal-close": closeModal(); break;
      case "export": exportProgress(); break;
      case "reset-all": confirmReset(); break;
      case "reset-yes":
        state = defaultState();
        state.onboarded = true;
        try { localStorage.removeItem("vca_lab_v1"); localStorage.removeItem(PG_KEY); } catch (er3) {}
        save();
        closeModal();
        toast("Everything was reset.");
        location.hash = "#/home";
        route();
        break;
    }
    if (el.tagName === "A" && a !== "social") { return; }
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && $("modal").className.indexOf("open") >= 0 && state.onboarded) { closeModal(); }
  });

  /* ======================= Boot ======================= */
  function boot() {
    view = $("view");
    updateChrome();
    window.addEventListener("hashchange", route);
    if (!location.hash) { location.replace("#/home"); }
    route();
    if (!state.onboarded) { showOnboarding(); }
    if ("serviceWorker" in navigator && /^https?:/.test(location.protocol)) {
      var hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register("sw.js").then(function () {}, function () {});
      var reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (!hadController || reloaded) { return; }
        reloaded = true;
        toast("Updated to the newest version!");
        setTimeout(function () { location.reload(); }, 1200);
      });
    }
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); } else { boot(); }
})();
