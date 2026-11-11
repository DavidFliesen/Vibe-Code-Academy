/* Vibe Code Academy - Python runner (main thread side). ES5 syntax.
   Real Python (Pyodide / CPython compiled to WebAssembly) runs in js/py-worker.js.
   First run downloads ~10 MB from the CDN; the service worker caches it for offline use. */
(function () {
  var PYODIDE_VERSION = "0.29.5";
  var DEFAULT_BASE = "https://cdn.jsdelivr.net/npm/pyodide@" + PYODIDE_VERSION + "/";

  var worker = null;
  var ready = false;
  var current = null;
  var nextId = 1;

  function base() { return window.VCA_PYODIDE_BASE || DEFAULT_BASE; }
  function abs(path) { var a = document.createElement("a"); a.href = path; return a.href; }

  function kill() {
    if (worker) { try { worker.terminate(); } catch (e) {} }
    worker = null;
    ready = false;
  }

  function finish(err, stopped) {
    var c = current;
    current = null;
    if (c && c.onDone) { c.onDone(err || null, !!stopped); }
  }

  function start() {
    worker = new Worker("js/py-worker.js");
    ready = false;
    worker.onmessage = function (e) {
      var d = e.data || {};
      if (d.type === "ready") {
        ready = true;
        if (current && current.onStatus) { current.onStatus("Python is ready."); }
        return;
      }
      if (!current || d.id !== current.id) { return; }
      if (d.type === "out") { current.onOut(d.text); }
      else if (d.type === "err") { current.onErr(d.text); }
      else if (d.type === "done") {
        if (d.loadFail) {
          kill();
          var msg = navigator.onLine === false ?
            "Python couldn't load because you're offline. Connect once to download Python (~10 MB); after that it works offline." :
            "Python couldn't load: " + d.error + "\nCheck your connection and try again.";
          finish(msg);
        } else {
          finish(d.error);
        }
      }
    };
    worker.onerror = function (ev) {
      kill();
      finish("The Python engine crashed: " + (ev && ev.message ? ev.message : "unknown error") + "\nPress Run to restart it.");
    };
    worker.postMessage({ type: "init", base: base(), simUrl: abs("py/ai_sim.py") });
  }

  /* cb = { onOut(text), onErr(text), onStatus(text), onDone(errorText|null, stopped) } */
  function run(code, cb) {
    if (current) {
      if (cb.onDone) { cb.onDone("Another program is still running. Press Stop first.", false); }
      return;
    }
    current = {
      id: nextId++,
      onOut: cb.onOut || function () {},
      onErr: cb.onErr || function () {},
      onStatus: cb.onStatus || null,
      onDone: cb.onDone || function () {}
    };
    if (!worker) {
      start();
      if (current.onStatus) { current.onStatus("Loading Python... (first time downloads ~10 MB, then it's cached)"); }
    }
    worker.postMessage({ type: "run", id: current.id, code: code });
  }

  function stop() {
    if (!current) { return; }
    kill();
    finish("Stopped. (Python will restart on your next Run.)", true);
  }

  window.VCA_PY = {
    run: run,
    stop: stop,
    isRunning: function () { return !!current; },
    isReady: function () { return ready; },
    version: PYODIDE_VERSION
  };
})();
