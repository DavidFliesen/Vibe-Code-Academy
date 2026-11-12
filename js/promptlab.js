/* Vibe Code Academy - Prompt Lab (builder, checkup, app brief). ES5 syntax. */
(function () {
  var LAB_KEY = "vca_lab_v1";

  var TEMPLATES = [
    { id: "blank", name: "Blank - start from scratch", f: {} },
    { id: "explain", name: "Explain anything simply", f: {
      role: "a patient teacher who loves analogies",
      task: "Explain how the internet works",
      context: "I've never studied computers and I want to finally understand it.",
      audience: "a curious 10-year-old",
      format: "3 short paragraphs plus one everyday analogy",
      constraints: "Use simple words. No jargon. Under 200 words." } },
    { id: "email", name: "Write an email", f: {
      role: "a professional communications coach",
      task: "Write an email to my manager asking to move our 1:1 meeting to Thursday",
      context: "I have a doctor's appointment Wednesday. We usually meet Wednesdays at 2pm.",
      audience: "my manager",
      format: "A subject line, then the email",
      constraints: "Friendly but professional. Under 120 words." } },
    { id: "plan", name: "Plan a project", f: {
      role: "an experienced project manager",
      task: "Create a plan to launch a small community newsletter",
      context: "I'm one person with about 3 hours a week. I want the first issue out in 4 weeks.",
      audience: "me, a beginner",
      format: "A checklist grouped by week, with time estimates",
      constraints: "Keep it realistic. Flag the riskiest step." } },
    { id: "debug", name: "Debug my code", f: {
      role: "a senior developer and patient teacher",
      task: "Find and fix the bug in my code",
      context: "Expected: [what should happen]\nActual: [what happens]\nError message: [paste exact error]\nDevice/browser: [e.g. iPad, Safari]\nCode: [paste code]",
      audience: "a beginner coder",
      format: "1) The cause in plain English 2) The fixed code 3) How to avoid it next time",
      constraints: "Explain the cause before fixing. Don't change anything unrelated." } },
    { id: "image", name: "Image prompt helper", f: {
      role: "an expert art director",
      task: "Write a detailed image-generation prompt for: a cozy treehouse library",
      context: "Style: watercolor storybook. Mood: warm, magical, golden-hour light. Composition: wide shot.",
      audience: "an AI image generator",
      format: "One prompt under 60 words, then 2 alternate versions",
      constraints: "No famous characters or living artists' names." } },
    { id: "tutor", name: "Tutor me step by step", f: {
      role: "a Socratic tutor",
      task: "Teach me how Python for loops work",
      context: "I know what variables are, but loops confuse me.",
      audience: "a beginner",
      format: "One small step at a time with a tiny example",
      constraints: "After each step, ask me a question and wait for my answer before continuing." } },
    { id: "learnai", name: "Get better at using AI", f: {
      role: "an AI productivity coach",
      task: "Suggest 5 ways I could use AI to save time in my job",
      context: "I work as [your job]. My most repetitive tasks are [list them].",
      audience: "someone new to AI tools",
      format: "A numbered list. For each: the idea, an example prompt, and the time it could save",
      constraints: "Practical ideas only. Mention anything I should double-check." } }
  ];

  var FIELDS = [
    { k: "role", label: "Role", hint: "Who should the AI act as?", ph: "e.g. a friendly science teacher" },
    { k: "task", label: "Task", hint: "Start with a verb: explain, write, list, plan, fix...", ph: "e.g. Explain how vaccines work", area: true },
    { k: "context", label: "Context", hint: "Background it can't guess", ph: "e.g. I'm writing a school report and I'm 13", area: true },
    { k: "audience", label: "Audience", hint: "Who is the answer for?", ph: "e.g. a 7th-grade class" },
    { k: "format", label: "Format", hint: "How should it look?", ph: "e.g. 5 bullet points, a table, 3 paragraphs" },
    { k: "constraints", label: "Constraints", hint: "Length, tone, what to avoid", ph: "e.g. under 150 words, no jargon" },
    { k: "example", label: "Example (optional)", hint: "Show what good looks like", ph: "e.g. Like this: ...", area: true }
  ];

  var BRIEF_CHECKS = [
    "One single HTML file (CSS and JavaScript inside)",
    "Installable PWA that works offline",
    "Mobile-first with large, easy-to-tap buttons",
    "No login or accounts",
    "No paid or keyed APIs",
    "Save data on the device (localStorage)",
    "Accessible: good contrast and screen-reader labels",
    "Will be hosted on GitHub Pages"
  ];
  var BRIEF_DEFAULT_CHECKS = [0, 2, 3, 5];

  function loadLab() {
    var d = { builder: {}, ask: false, check: "", brief: { checks: BRIEF_DEFAULT_CHECKS.slice(0) } };
    try {
      var raw = localStorage.getItem(LAB_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        for (var k in o) { if (o.hasOwnProperty(k)) { d[k] = o[k]; } }
      }
    } catch (e) {}
    if (!d.brief) { d.brief = { checks: BRIEF_DEFAULT_CHECKS.slice(0) }; }
    if (!d.brief.checks) { d.brief.checks = BRIEF_DEFAULT_CHECKS.slice(0); }
    return d;
  }
  var lab = loadLab();
  function saveLab() { try { localStorage.setItem(LAB_KEY, JSON.stringify(lab)); } catch (e) {} }

  function trim(s) { return String(s == null ? "" : s).replace(/^\s+|\s+$/g, ""); }

  /* ---------------- Builder ---------------- */
  function assemble(f, ask) {
    var out = [];
    var role = trim(f.role);
    if (role) {
      if (/^(you are|act as|pretend)/i.test(role)) { out.push(role.charAt(0).toUpperCase() + role.slice(1).replace(/\.?$/, ".")); }
      else { out.push("You are " + role.replace(/\.$/, "") + "."); }
    }
    if (trim(f.task)) { out.push("Task: " + trim(f.task)); }
    if (trim(f.context)) { out.push("Context: " + trim(f.context)); }
    if (trim(f.audience)) { out.push("Audience: " + trim(f.audience)); }
    if (trim(f.format)) { out.push("Format: " + trim(f.format)); }
    if (trim(f.constraints)) { out.push("Constraints: " + trim(f.constraints)); }
    if (trim(f.example)) { out.push("Example of what I want: " + trim(f.example)); }
    if (ask) { out.push("Before you answer, ask me any questions you need to do this really well."); }
    return out.join("\n\n");
  }

  function renderBuilder(root, ctx) {
    var f = lab.builder || {};
    var h = '<div class="card">';
    h += '<p class="muted">Fill in the 5-part recipe (plus an optional example). Your prompt builds itself below.</p>';
    h += '<div class="field"><label for="tplSel">Start from a template</label><select id="tplSel">';
    for (var i = 0; i < TEMPLATES.length; i++) {
      h += '<option value="' + TEMPLATES[i].id + '">' + ctx.esc(TEMPLATES[i].name) + "</option>";
    }
    h += "</select></div>";
    for (var j = 0; j < FIELDS.length; j++) {
      var fd = FIELDS[j];
      h += '<div class="field"><label for="pf-' + fd.k + '">' + fd.label + ' <span class="hint">- ' + ctx.esc(fd.hint) + "</span></label>";
      if (fd.area) {
        h += '<textarea id="pf-' + fd.k + '" data-k="' + fd.k + '" placeholder="' + ctx.esc(fd.ph) + '">' + ctx.esc(f[fd.k] || "") + "</textarea>";
      } else {
        h += '<input type="text" id="pf-' + fd.k + '" data-k="' + fd.k + '" placeholder="' + ctx.esc(fd.ph) + '" value="' + ctx.esc(f[fd.k] || "") + '">';
      }
      h += "</div>";
    }
    h += '<div class="checks"><label><input type="checkbox" id="pfAsk"' + (lab.ask ? " checked" : "") + '> Ask me clarifying questions first (a pro move!)</label></div>';
    h += "</div>";
    h += '<div class="section"><div class="section-title"><h2>Your prompt</h2></div>';
    h += '<div class="output-box" id="pfOut"></div>';
    h += '<div class="btn-row"><button class="btn" type="button" id="pfCopy">Copy prompt</button>';
    h += '<button class="btn secondary" type="button" id="pfCheck">Check its strength</button>';
    h += '<button class="btn secondary" type="button" id="pfShare">Share</button>';
    h += '<button class="btn secondary" type="button" id="pfClear">Clear</button></div>';
    h += '<p class="dim">Paste it into Claude, ChatGPT, Gemini or any AI tool.</p></div>';
    root.innerHTML = h;

    var out = document.getElementById("pfOut");
    function refresh() {
      var txt = assemble(lab.builder, lab.ask);
      out.textContent = txt || "Start typing above and your prompt will appear here.";
      out.className = txt ? "output-box" : "output-box muted";
    }
    var inputs = root.querySelectorAll("[data-k]");
    for (var n = 0; n < inputs.length; n++) {
      inputs[n].addEventListener("input", function (e) {
        lab.builder[e.target.getAttribute("data-k")] = e.target.value;
        saveLab();
        refresh();
      });
    }
    document.getElementById("pfAsk").addEventListener("change", function (e) { lab.ask = e.target.checked; saveLab(); refresh(); });
    document.getElementById("tplSel").addEventListener("change", function (e) {
      var tpl = null;
      for (var t = 0; t < TEMPLATES.length; t++) { if (TEMPLATES[t].id === e.target.value) { tpl = TEMPLATES[t]; } }
      if (!tpl) { return; }
      lab.builder = {};
      for (var k in tpl.f) { if (tpl.f.hasOwnProperty(k)) { lab.builder[k] = tpl.f[k]; } }
      saveLab();
      for (var q = 0; q < FIELDS.length; q++) {
        document.getElementById("pf-" + FIELDS[q].k).value = lab.builder[FIELDS[q].k] || "";
      }
      refresh();
    });
    document.getElementById("pfCopy").addEventListener("click", function () {
      var txt = assemble(lab.builder, lab.ask);
      if (!txt) { ctx.toast("Fill in at least the Task first."); return; }
      ctx.copy(txt, "Prompt copied!");
      ctx.event("builder");
    });
    document.getElementById("pfCheck").addEventListener("click", function () {
      lab.check = assemble(lab.builder, lab.ask);
      saveLab();
      location.hash = "#/lab/check";
    });
    document.getElementById("pfShare").addEventListener("click", function () {
      var txt = assemble(lab.builder, lab.ask);
      if (!txt) { ctx.toast("Build a prompt first."); return; }
      ctx.shareText("A prompt I built in Vibe Code Academy", txt);
    });
    document.getElementById("pfClear").addEventListener("click", function () {
      lab.builder = {};
      saveLab();
      renderBuilder(root, ctx);
    });
    refresh();
  }

  /* ---------------- Checkup ---------------- */
  function has(text, list) {
    for (var i = 0; i < list.length; i++) { if (text.indexOf(list[i]) >= 0) { return true; } }
    return false;
  }
  var VERBS = ["explain", "write", "list", "create", "make", "summarize", "summarise", "compare", "plan", "generate", "build", "fix", "debug", "describe", "draft", "design", "translate", "rewrite", "analyze", "analyse", "review", "suggest", "teach", "give", "help", "tell", "outline", "brainstorm", "calculate", "convert", "find", "turn", "edit", "improve", "recommend", "teach", "show", "draw", "code", "organize", "extract"];

  function check(raw) {
    var text = " " + String(raw || "").toLowerCase().replace(/\s+/g, " ") + " ";
    var words = trim(raw).split(/\s+/).filter(function (w) { return w.length > 0; }).length;
    var verbHit = false;
    for (var v = 0; v < VERBS.length; v++) {
      if (new RegExp("\\b" + VERBS[v] + "\\b").test(text)) { verbHit = true; break; }
    }
    var ctxCue = has(text, [" i am ", " i'm ", " my ", " our ", " we ", "because", "context:", "background", " so that ", " i have ", " i want ", " i need ", " i work"]);
    var crits = [
      { k: "Clear task", pts: 20, ok: verbHit, tip: "Start with an action verb: explain, write, list, plan, compare, fix..." },
      { k: "Context", pts: 20, ok: ctxCue && words >= 15, half: ctxCue || words >= 25, tip: "Add background the AI can't guess: your situation, goal, or what you've tried." },
      { k: "Audience", pts: 10, ok: has(text, ["for a ", "for my ", "for kids", "for beginners", "audience", "year-old", "year old", "beginner", "expert", "students", "student", "my team", "customers", "my boss", "manager", "readers", "class", "grade", "child", "teen"]), tip: "Say who it's for: a 10-year-old, a beginner, your boss, customers..." },
      { k: "Format", pts: 20, ok: has(text, ["bullet", " list", "table", " steps", "step-by-step", "step by step", "paragraph", "sentence", "json", "checklist", "outline", "heading", "numbered", " words", "summary", "format", "markdown", "subject line", "email", "code block", "one line", "tweet", "slide"]), tip: "Describe the shape: 5 bullet points, a table, 3 paragraphs, a checklist..." },
      { k: "Constraints", pts: 15, ok: has(text, ["under ", "no more than", "at most", "at least", "avoid", "don't", "do not", "must", " only", "limit", " max", "tone", "keep it", "exactly", "without", "no jargon", "simple words", "formal", "casual", "friendly"]), tip: "Add limits: length, tone, reading level, what to avoid." },
      { k: "Role", pts: 10, ok: has(text, ["you are", "act as", "pretend you", "role:", "as an expert", "as a "]), tip: "Give the AI a role: \"You are a patient math tutor.\"" },
      { k: "Example", pts: 5, ok: has(text, ["for example", "e.g.", "example:", "such as", "like this", "example of"]), tip: "Show a quick example of what good output looks like." }
    ];
    var score = 0;
    for (var c = 0; c < crits.length; c++) {
      if (crits[c].ok) { score += crits[c].pts; }
      else if (crits[c].half) { score += Math.round(crits[c].pts / 2); crits[c].partial = true; }
    }
    if (words < 6) { score = Math.min(score, 30); }
    var label = score >= 90 ? "Pro level!" : score >= 70 ? "Strong" : score >= 40 ? "Getting there" : "Needs work";
    var color = score >= 90 ? "#34d399" : score >= 70 ? "#22d3ee" : score >= 40 ? "#fbbf24" : "#f87171";
    return { score: score, label: label, color: color, crits: crits, words: words };
  }

  function renderCheck(root, ctx) {
    var h = '<div class="card"><p class="muted">Paste any prompt and get an instant checkup. It runs right on your device - nothing is sent anywhere.</p>';
    h += '<div class="field"><label for="ckText">Your prompt</label><textarea id="ckText" rows="6" placeholder="e.g. Tell me about dogs.">' + ctx.esc(lab.check || "") + "</textarea></div>";
    h += '<div class="btn-row"><button class="btn" type="button" id="ckRun">Check my prompt</button><button class="btn secondary" type="button" id="ckEx">Try a weak example</button></div></div>';
    h += '<div id="ckResult"></div>';
    root.innerHTML = h;

    var ta = document.getElementById("ckText");
    function show() {
      var r = check(ta.value);
      var res = document.getElementById("ckResult");
      if (!trim(ta.value)) { res.innerHTML = ""; return; }
      var o = '<div class="section card">';
      o += '<div class="score-ring"><div class="score-num" style="color:' + r.color + '">' + r.score + '</div><div><b style="color:' + r.color + '">' + r.label + '</b><div class="dim">' + r.words + " words</div></div></div>";
      o += '<div class="bar"><i style="width:' + r.score + "%;background:" + r.color + ';background-image:none"></i></div><br>';
      for (var i = 0; i < r.crits.length; i++) {
        var c = r.crits[i];
        o += '<div class="crit"><div class="ck ' + (c.ok ? "yes" : "no") + '">' + (c.ok ? "&#10003;" : c.partial ? "&#189;" : "&#8226;") + "</div><div><b>" + c.k + "</b> <span class=\"dim\">(" + c.pts + " pts)</span>";
        if (!c.ok) { o += '<div class="muted">' + ctx.esc(c.tip) + "</div>"; }
        o += "</div></div>";
      }
      o += '<div class="btn-row"><a class="btn secondary" href="#/lab/builder">Improve it in the Builder</a></div></div>';
      res.innerHTML = o;
      ctx.event("check", r.score);
    }
    document.getElementById("ckRun").addEventListener("click", function () { lab.check = ta.value; saveLab(); show(); });
    document.getElementById("ckEx").addEventListener("click", function () { ta.value = "Tell me about dogs."; lab.check = ta.value; saveLab(); show(); });
    ta.addEventListener("input", function () { lab.check = ta.value; saveLab(); });
    if (trim(ta.value)) { show(); }
  }

  /* ---------------- App brief ---------------- */
  function lines(s) {
    var arr = String(s || "").split(/\n+/);
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var t = trim(arr[i].replace(/^[-*•]\s*/, ""));
      if (t) { out.push(t); }
    }
    return out;
  }

  function assembleBrief(b) {
    var name = trim(b.name) || "My App";
    var musts = lines(b.must);
    var nice = lines(b.nice);
    var o = [];
    o.push("Build a web app called \"" + name + "\".");
    if (trim(b.goal)) { o.push("Goal: " + trim(b.goal)); }
    if (trim(b.users)) { o.push("Who it's for: " + trim(b.users) + (b.device ? " (mainly on " + b.device + ")" : "")); }
    else if (b.device) { o.push("Main device: " + b.device); }
    if (musts.length) { o.push("Must-have features:\n- " + musts.join("\n- ")); }
    if (nice.length) { o.push("Nice-to-have features (NOT now - save for later versions):\n- " + nice.join("\n- ")); }
    if (trim(b.look)) { o.push("Look and feel: " + trim(b.look)); }
    var req = [];
    for (var i = 0; i < BRIEF_CHECKS.length; i++) { if (b.checks && b.checks.indexOf(i) >= 0) { req.push(BRIEF_CHECKS[i]); } }
    if (req.length) { o.push("Technical requirements:\n- " + req.join("\n- ")); }
    var first = musts.length ? musts[0] : "the core feature";
    o.push("How we'll work together:\n" +
      "- Build in small steps. Start with ONLY: " + first + ". Then stop and wait for my feedback.\n" +
      "- Give me complete files and list exactly what changed each time.\n" +
      "- Use version numbers starting at v1.0.0.\n" +
      "- Explain anything I need to do (like where files go) in simple steps.\n" +
      "- Before writing code, ask me any questions you need answered.");
    return o.join("\n\n");
  }

  function renderBrief(root, ctx) {
    var b = lab.brief;
    function inp(k, label, hint, ph, area) {
      var s = '<div class="field"><label for="bf-' + k + '">' + label + ' <span class="hint">- ' + ctx.esc(hint) + "</span></label>";
      if (area) { s += '<textarea id="bf-' + k + '" data-b="' + k + '" placeholder="' + ctx.esc(ph) + '">' + ctx.esc(b[k] || "") + "</textarea>"; }
      else { s += '<input type="text" id="bf-' + k + '" data-b="' + k + '" placeholder="' + ctx.esc(ph) + '" value="' + ctx.esc(b[k] || "") + '">'; }
      return s + "</div>";
    }
    var h = '<div class="card"><p class="muted">Describe the app you want. This builds a pro-quality <b>vibe coding brief</b> you can paste into any AI.</p>';
    h += inp("name", "App name", "Anything works for now", "e.g. Water Buddy");
    h += inp("goal", "Goal", "One sentence: what does it do?", "e.g. Help me drink 8 glasses of water a day", true);
    h += inp("users", "Who it's for", "Who will use it?", "e.g. me and my family");
    h += '<div class="field"><label for="bf-device">Main device</label><select id="bf-device" data-b="device">';
    var devs = ["", "phones", "tablets", "computers", "phones and computers"];
    for (var d = 0; d < devs.length; d++) {
      h += '<option value="' + devs[d] + '"' + (b.device === devs[d] ? " selected" : "") + ">" + (devs[d] || "Choose...") + "</option>";
    }
    h += "</select></div>";
    h += inp("must", "Must-have features", "One per line - the first one gets built first", "e.g. A big +1 glass button\nA progress ring for today\nResets at midnight", true);
    h += inp("nice", "Nice-to-haves", "One per line - saved for later", "e.g. Reminder notifications\nWeekly chart", true);
    h += inp("look", "Look and feel", "Colors, mood, style", "e.g. calm blues, rounded buttons, large text, dark mode", true);
    h += '<div class="field"><label>Tech requirements</label><div class="checks">';
    for (var i = 0; i < BRIEF_CHECKS.length; i++) {
      h += '<label><input type="checkbox" data-c="' + i + '"' + (b.checks.indexOf(i) >= 0 ? " checked" : "") + "> " + ctx.esc(BRIEF_CHECKS[i]) + "</label>";
    }
    h += "</div></div></div>";
    h += '<div class="section"><div class="section-title"><h2>Your build brief</h2></div><div class="output-box" id="bfOut"></div>';
    h += '<div class="btn-row"><button class="btn" type="button" id="bfCopy">Copy brief</button><button class="btn secondary" type="button" id="bfShare">Share</button><button class="btn secondary" type="button" id="bfClear">Clear</button></div>';
    h += '<p class="dim">Tip: after the AI builds step one, test it, then reply with what to change or the next feature.</p></div>';
    root.innerHTML = h;

    var out = document.getElementById("bfOut");
    function refresh() { out.textContent = assembleBrief(lab.brief); }
    var fields = root.querySelectorAll("[data-b]");
    for (var n = 0; n < fields.length; n++) {
      fields[n].addEventListener("input", function (e) { lab.brief[e.target.getAttribute("data-b")] = e.target.value; saveLab(); refresh(); });
      fields[n].addEventListener("change", function (e) { lab.brief[e.target.getAttribute("data-b")] = e.target.value; saveLab(); refresh(); });
    }
    var cbs = root.querySelectorAll("[data-c]");
    for (var m = 0; m < cbs.length; m++) {
      cbs[m].addEventListener("change", function () {
        var arr = [];
        var all = root.querySelectorAll("[data-c]");
        for (var z = 0; z < all.length; z++) { if (all[z].checked) { arr.push(parseInt(all[z].getAttribute("data-c"), 10)); } }
        lab.brief.checks = arr;
        saveLab();
        refresh();
      });
    }
    document.getElementById("bfCopy").addEventListener("click", function () {
      ctx.copy(assembleBrief(lab.brief), "Build brief copied!");
      ctx.event("brief");
    });
    document.getElementById("bfShare").addEventListener("click", function () {
      ctx.shareText("My app build brief", assembleBrief(lab.brief));
    });
    document.getElementById("bfClear").addEventListener("click", function () {
      lab.brief = { checks: BRIEF_DEFAULT_CHECKS.slice(0) };
      saveLab();
      renderBrief(root, ctx);
    });
    refresh();
  }

  window.VCA_LAB = {
    renderBuilder: renderBuilder,
    renderCheck: renderCheck,
    renderBrief: renderBrief,
    check: check,
    assemble: assemble,
    assembleBrief: assembleBrief
  };
})();
