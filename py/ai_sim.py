"""
ai_sim.py - a tiny, OFFLINE, *simulated* LLM for learning.

It is NOT a real AI. It follows simple, predictable rules so you can practice
the exact code patterns used with real LLM APIs (messages, system prompts,
temperature, max_tokens, JSON output, tool use, agent loops) without an
API key, an internet connection, or any cost.

When you're ready for the real thing, swap ai_sim.chat(...) for a real SDK
call (see the "Real-world version" boxes in Vibe Code Academy).

Vibe Code Academy - an ARTEZIQ app.
"""

import json
import random
import re

MODEL_NAME = "sim-1 (simulated, offline)"

_POSITIVE = {"love", "great", "awesome", "amazing", "good", "happy", "excellent",
             "fantastic", "wonderful", "fun", "best", "enjoy", "enjoyed", "nice",
             "helpful", "easy", "fast", "beautiful", "perfect", "like", "glad"}
_NEGATIVE = {"hate", "bad", "terrible", "awful", "slow", "broken", "sad", "worst",
             "angry", "boring", "hard", "confusing", "bug", "crash", "crashed",
             "annoying", "poor", "disappointed", "ugly", "useless", "late"}
_STOP = {"the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "to",
         "of", "in", "on", "for", "with", "it", "this", "that", "i", "you", "my",
         "me", "we", "be", "at", "as", "so", "do", "did", "have", "has", "had",
         "from", "by", "about", "into", "your", "our", "they", "them", "its",
         "please", "can", "could", "would", "should", "what", "how", "why",
         "tell", "give", "make", "write", "very", "really", "just", "than"}


def count_tokens(text):
    """Rough token estimate. Real tokenizers average ~4 characters per token in English."""
    if not text:
        return 0
    return max(1, int(round(len(str(text)) / 4.0)))


def _text_of(message):
    content = message.get("content")
    if content is None:
        return ""
    return str(content)


def _last_user_text(messages):
    for m in reversed(messages):
        if m.get("role") == "user":
            return _text_of(m)
    return ""


def _first_user_text(messages):
    for m in messages:
        if m.get("role") == "user":
            return _text_of(m)
    return ""


def _payload(text):
    """The part after the first colon, e.g. 'Summarize this: <payload>'."""
    if ":" in text:
        return text.split(":", 1)[1].strip()
    return text.strip()


def _words(text):
    return re.findall(r"[a-zA-Z']+", text.lower())


def _sentiment(text):
    words = _words(text)
    pos = sum(1 for w in words if w in _POSITIVE)
    neg = sum(1 for w in words if w in _NEGATIVE)
    if pos > neg:
        label = "positive"
    elif neg > pos:
        label = "negative"
    else:
        label = "neutral"
    total = pos + neg
    confidence = 0.5 if total == 0 else round(0.5 + 0.5 * abs(pos - neg) / total, 2)
    return label, confidence


def _keywords(text, n=5):
    counts = {}
    order = []
    for w in _words(text):
        if len(w) < 3 or w in _STOP:
            continue
        if w not in counts:
            counts[w] = 0
            order.append(w)
        counts[w] += 1
    order.sort(key=lambda w: (-counts[w], order.index(w)))
    return order[:n]


def _find_math(text):
    """Find something that looks like arithmetic, e.g. '365 * 24' or '(12+8)/4'."""
    cleaned = text.replace("×", "*").replace("÷", "/")
    cleaned = re.sub(r"(?<=\d)\s*[xX]\s*(?=\d)", "*", cleaned)
    m = re.search(r"[\d\(][\d\s\.\+\-\*/\(\)%]*[\+\-\*/%][\d\s\.\+\-\*/\(\)%]*[\d\)]", cleaned)
    if m:
        return m.group(0).strip()
    return None


def _find_lookup(text):
    """Find a fact-lookup request like 'capital of Japan'."""
    m = re.search(r"capital (?:city )?of ([A-Za-z][A-Za-z ]*?)(?:[\?\.,!]|\band\b|$)", text, re.I)
    if m:
        return "capital of " + m.group(1).strip()
    m = re.search(r"(?:look ?up|search for|find out)\s+([^\?\.,!]+)", text, re.I)
    if m:
        return m.group(1).strip()
    return None


def _persona_prefix(system):
    s = (system or "").lower()
    if "pirate" in s:
        return "Arr, matey! "
    if "robot" in s:
        return "BEEP BOOP. "
    if "shakespeare" in s:
        return "Hark! "
    if "coach" in s:
        return "Let's go! "
    return ""


def _simple_words(system):
    s = (system or "").lower()
    return any(k in s for k in ("child", "kid", "5-year-old", "five year old", "beginner", "simple words"))


def _tool_names(tools):
    names = []
    for t in tools or []:
        if isinstance(t, dict) and t.get("name"):
            names.append(t["name"])
    return names


def _pick_tool(names, kind):
    for name in names:
        low = name.lower()
        if kind == "math" and any(k in low for k in ("calc", "math", "arith")):
            return name
        if kind == "lookup" and any(k in low for k in ("lookup", "search", "wiki", "fact", "capital", "find")):
            return name
    return None


def _make_response(content=None, tool_call=None, stop_reason="end_turn", input_tokens=0):
    out_tokens = count_tokens(content) if content else count_tokens(json.dumps(tool_call)) if tool_call else 0
    return {
        "role": "assistant",
        "model": MODEL_NAME,
        "content": content,
        "tool_call": tool_call,
        "stop_reason": stop_reason,
        "usage": {"input_tokens": input_tokens, "output_tokens": out_tokens},
    }


def chat(messages, system=None, temperature=0.7, max_tokens=300, tools=None):
    """
    Send a conversation to the simulated model and get one reply back.

    messages:    list of {"role": "user"|"assistant"|"tool", "content": "..."}
    system:      optional system prompt (sets persona / rules)
    temperature: 0 = predictable, higher = more varied (and messier!)
    max_tokens:  reply is cut off if it would be longer than this
    tools:       optional list of {"name", "description", "parameters"} dicts

    Returns a dict:
      {"role": "assistant", "content": str or None, "tool_call": dict or None,
       "stop_reason": "end_turn" | "tool_use" | "max_tokens", "usage": {...}}
    """
    if not isinstance(messages, list) or not messages:
        raise ValueError("messages must be a non-empty list of {'role': ..., 'content': ...} dicts")
    for m in messages:
        if not isinstance(m, dict) or "role" not in m:
            raise ValueError("every message needs a 'role' key, e.g. {'role': 'user', 'content': 'Hi'}")

    input_tokens = count_tokens(system) + sum(count_tokens(_text_of(m)) for m in messages)
    goal = _first_user_text(messages)
    last = _last_user_text(messages)
    names = _tool_names(tools)
    rng = random.Random(0) if temperature <= 0 else random.Random()

    # ---------- 1. Tool use / agent behaviour ----------
    calls_by_id = {}
    for m in messages:
        tc = m.get("tool_call") if m.get("role") == "assistant" else None
        if isinstance(tc, dict) and tc.get("id"):
            calls_by_id[tc["id"]] = tc
    tool_results = [m for m in messages if m.get("role") == "tool"]
    used_queries = []
    for m in tool_results:
        tc = calls_by_id.get(m.get("tool_call_id"), {})
        used_queries.append(str(tc.get("query", m.get("query", ""))))
    if names:
        needs = []
        expr = _find_math(goal)
        look = _find_lookup(goal)
        if look and _pick_tool(names, "lookup"):
            needs.append((_pick_tool(names, "lookup"), {"query": look}, look))
        if expr and _pick_tool(names, "math"):
            needs.append((_pick_tool(names, "math"), {"expression": expr}, expr))
        for tool_name, args, key in needs:
            if key not in used_queries:
                call = {"id": "call_" + str(len(calls_by_id) + 1), "name": tool_name,
                        "arguments": args, "query": key}
                return _make_response(None, call, "tool_use", input_tokens)
        if tool_results:
            parts = []
            for m, q in zip(tool_results, used_queries):
                parts.append((q or str(m.get("name", "tool"))) + " -> " + _text_of(m))
            text = "Here's what I found using my tools: " + "; ".join(parts) + "."
            return _finish(_persona_prefix(system) + text, max_tokens, input_tokens)

    # ---------- 2. JSON mode ----------
    wants_json = "json" in (system or "").lower() or "json" in last.lower()
    if wants_json:
        payload = _payload(last)
        low = last.lower()
        if "sentiment" in low or "feeling" in low or "mood" in low:
            label, conf = _sentiment(payload)
            obj = {"sentiment": label, "confidence": conf}
        elif "keyword" in low or "tag" in low or "topic" in low:
            obj = {"keywords": _keywords(payload)}
        elif "summar" in low:
            first = re.split(r"(?<=[.!?])\s+", payload)[0]
            obj = {"summary": first, "word_count": len(payload.split())}
        else:
            obj = {"answer": "(simulated) " + payload[:80], "confidence": 0.5}
        text = json.dumps(obj)
        if temperature >= 0.9:
            # Real models sometimes wrap JSON in markdown fences or add chatter.
            text = "Sure! Here is the JSON you asked for:\n```json\n" + json.dumps(obj, indent=2) + "\n```"
        return _finish(text, max_tokens, input_tokens)

    # ---------- 3. Fact questions without tools ----------
    if _find_lookup(last) and not names:
        text = ("I'm not certain, and I can't look things up because I don't have any tools. "
                "A real model might guess confidently here - that's called a hallucination. "
                "Give me a lookup tool and I can check.")
        return _finish(_persona_prefix(system) + text, max_tokens, input_tokens)

    # ---------- 4. Common tasks ----------
    low = last.lower()
    prefix = _persona_prefix(system)
    if "summar" in low:
        payload = _payload(last)
        first = re.split(r"(?<=[.!?])\s+", payload)[0]
        text = "Summary: " + first
    elif "sentiment" in low:
        label, conf = _sentiment(_payload(last))
        text = "The sentiment seems " + label + " (confidence " + str(conf) + ")."
    elif "keyword" in low or "tags" in low:
        text = "Keywords: " + ", ".join(_keywords(_payload(last)))
    elif re.search(r"\b(hi|hello|hey)\b", low):
        text = rng.choice(["Hello! How can I help you today?",
                           "Hi there! What would you like to build?",
                           "Hey! Ready when you are."])
    elif "joke" in low:
        text = rng.choice(["Why did the developer go broke? Because they used up all their cache.",
                           "I told my computer I needed a break. It said: 'No problem - I'll go to sleep.'",
                           "Why do programmers prefer dark mode? Because light attracts bugs."])
    elif "name" in low and ("idea" in low or "suggest" in low):
        words = _keywords(last, 2) or ["app"]
        base = words[0].capitalize()
        text = "Name ideas: " + ", ".join([base + "ly", base + "Hub", "Go" + base, base + " Buddy"])
    else:
        openers = ["Great question!", "Good thinking.", "Let's work through it.", "Here's my take."]
        topic = ", ".join(_keywords(last, 3)) or "your request"
        opener = openers[0] if temperature <= 0 else rng.choice(openers)
        if _simple_words(system):
            text = opener + " Let me explain " + topic + " in simple words, one small step at a time."
        else:
            text = (opener + " You asked about: " + topic + ". "
                    "(This is a simulated reply - a real LLM would write a full answer here.)")
    return _finish(prefix + text, max_tokens, input_tokens)


def _finish(text, max_tokens, input_tokens):
    limit_chars = max(4, int(max_tokens) * 4)
    if len(text) > limit_chars:
        return _make_response(text[:limit_chars], None, "max_tokens", input_tokens)
    return _make_response(text, None, "end_turn", input_tokens)


def ask(prompt, system=None, temperature=0.7, max_tokens=300):
    """Shortcut: send one user message, get back just the reply text."""
    reply = chat([{"role": "user", "content": prompt}], system=system,
                 temperature=temperature, max_tokens=max_tokens)
    return reply["content"]
