/* Vibe Code Academy - Python sandbox worker (Pyodide). ES5 syntax.
   Runs Python off the main thread so the page never freezes and
   long or infinite loops can be stopped by terminating this worker. */
var pyodide = null;
var readyPromise = null;
var currentId = 0;

function post(msg) { self.postMessage(msg); }

var SETUP_PY = [
  "import sys, builtins",
  "if '/home/pyodide' not in sys.path:",
  "    sys.path.insert(0, '/home/pyodide')",
  "def _vca_no_input(prompt=''):",
  "    raise RuntimeError(\"input() isn't available in this sandbox. Set a variable instead, e.g. name = 'Ada'\")",
  "builtins.input = _vca_no_input"
].join("\n");

function init(base, simUrl) {
  readyPromise = new Promise(function (resolve, reject) {
    try {
      importScripts(base + "pyodide.js");
    } catch (err) {
      reject(err);
      return;
    }
    self.loadPyodide({ indexURL: base }).then(function (py) {
      pyodide = py;
      py.setStdout({ batched: function (s) { post({ type: "out", id: currentId, text: s }); } });
      py.setStderr({ batched: function (s) { post({ type: "err", id: currentId, text: s }); } });
      return fetch(simUrl).then(function (r) {
        if (!r.ok) { throw new Error("Could not load ai_sim.py (" + r.status + ")"); }
        return r.text();
      });
    }).then(function (src) {
      pyodide.FS.writeFile("/home/pyodide/ai_sim.py", src);
      pyodide.runPython(SETUP_PY);
      resolve();
    })["catch"](reject);
  });
  readyPromise.then(function () { post({ type: "ready" }); }, function () {});
}

function cleanTrace(msg) {
  var lines = String(msg).split("\n");
  var out = [];
  var skipping = false;
  for (var i = 0; i < lines.length; i++) {
    var ln = lines[i];
    if (/^\s+File "/.test(ln)) {
      var mine = ln.indexOf('"<exec>"') >= 0 || ln.indexOf("ai_sim.py") >= 0;
      skipping = !mine;
      if (skipping) { continue; }
      out.push(ln.replace('"<exec>"', '"your code"'));
      continue;
    }
    if (skipping && /^\s{4,}/.test(ln)) { continue; }
    skipping = false;
    out.push(ln);
  }
  return out.join("\n").replace(/\s+$/, "");
}

function run(id, code) {
  currentId = id;
  readyPromise.then(function () {
    var ns = pyodide.globals.get("dict")();
    ns.set("__name__", "__main__");
    return pyodide.runPythonAsync(code, { globals: ns }).then(function () {
      ns.destroy();
      post({ type: "done", id: id });
    }, function (err) {
      try { ns.destroy(); } catch (e) {}
      post({ type: "done", id: id, error: cleanTrace(err && err.message ? err.message : err) });
    });
  }, function (err) {
    post({ type: "done", id: id, loadFail: true, error: String(err && err.message ? err.message : err) });
  });
}

self.onmessage = function (e) {
  var d = e.data || {};
  if (d.type === "init") { init(d.base, d.simUrl); }
  else if (d.type === "run") { run(d.id, d.code); }
};
