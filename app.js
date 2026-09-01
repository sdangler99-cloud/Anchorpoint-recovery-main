"use strict";

/* ===========================================================
   localStorage persistence
=========================================================== */
function readLS(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function writeLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}
function removeLS(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}
function listLS(prefix) {
  var keys = [];
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (k && k.indexOf(prefix) === 0) keys.push(k);
  }
  return keys;
}

/* ===========================================================
   DOM helpers
=========================================================== */
function el(tag, attrs, children) {
  var e = document.createElement(tag);
  attrs = attrs || {};
  Object.keys(attrs).forEach(function(k) {
    if (k === "style" && typeof attrs[k] === "object") {
      Object.assign(e.style, attrs[k]);
    } else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") {
      e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
    } else if (k === "html") {
      e.innerHTML = attrs[k];
    } else {
      e.setAttribute(k, attrs[k]);
    }
  });
  (children || []).forEach(function(c) {
    if (c === null || c === undefined) return;
    if (typeof c === "string") e.appendChild(document.createTextNode(c));
    else e.appendChild(c);
  });
  return e;
}

/* ===========================================================
   STATE
=========================================================== */
var state = {
  theme: readLS("settings:theme", "anchorpoint"),
  tab: "gratitude"
};
function theme() { return THEMES[state.theme] || THEMES.anchorpoint; }

/* ===========================================================
   RENDER ROOT
=========================================================== */
var root = document.getElementById("root");

function render() {
  var t = theme();
  document.body.style.background = t.bg;
  root.innerHTML = "";

  var wrap = el("div", { style: { minHeight: "100vh", background: t.bg, fontFamily: t.body, paddingBottom: "calc(140px + env(safe-area-inset-bottom, 0px))" } });
  var banner = crisisBanner(t);
  wrap.appendChild(banner);
  var spacer = el("div");
  wrap.appendChild(spacer);

  var container = el("div", { style: { maxWidth: "560px", margin: "0 auto", padding: "18px 16px 0" } });

  // header
  var logoMark = el("div", {
    style: { width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(160deg,#3B3F42,#191B1D 75%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", overflow: "hidden" }
  });
  logoMark.innerHTML = '<svg width="26" height="26" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<circle cx="230" cy="130" r="46" fill="#D5D8DA" stroke="#8B9096" stroke-width="3"/>'
    + '<circle cx="230" cy="122" r="20" fill="#9AA0A5" stroke="#6B7075" stroke-width="2"/>'
    + '<circle cx="230" cy="122" r="7" fill="#6B7075"/>'
    + '<ellipse cx="230" cy="168" rx="20" ry="14" fill="none" stroke="#D5D8DA" stroke-width="14"/>'
    + '<path d="M240 174C300 170,330 210,330 265C330 320,300 365,250 385C210 400,185 385,175 360" fill="none" stroke="#D5D8DA" stroke-width="22" stroke-linecap="round"/>'
    + '<path d="M240 174C200 178,180 210,180 250" fill="none" stroke="#D5D8DA" stroke-width="22" stroke-linecap="round"/>'
    + '<rect x="163" y="228" width="38" height="58" rx="10" fill="#D98A3D" stroke="#7A4718" stroke-width="2" transform="rotate(-6 182 257)"/>'
    + '<path d="M250 360C260 385,300 390,315 415C330 440,310 460,285 455C265 451,268 425,290 420C310 416,330 435,345 460C360 485,400 500,430 490" fill="none" stroke="#5FA8C4" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>'
    + '</svg>';
  var header = el("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" } }, [
    logoMark,
    el("div", {}, [
      el("div", { style: { fontFamily: t.display, fontWeight: "900", fontSize: "20px", color: t.text, letterSpacing: "-0.3px" } }, ["Anchorpoint"]),
      el("div", { style: { fontSize: "11px", color: t.textMuted, fontWeight: "700", letterSpacing: "0.6px", textTransform: "uppercase" } }, ["For When You Need To Climb Out"])
    ])
  ]);
  container.appendChild(header);

  if (state.tab === "gratitude") container.appendChild(quoteCard(t));

  var tabRenderers = {
    gratitude: renderGratitudeTab,
    sobriety: renderSobrietyTab,
    craving: renderCravingTab,
    journal: renderJournalTab,
    control: renderControlTab,
    resources: renderResourcesTab,
    settings: renderSettingsTab
  };
  container.appendChild(tabRenderers[state.tab](t));

  wrap.appendChild(container);
  wrap.appendChild(bottomBar(t));
  root.appendChild(wrap);

  // Match the spacer to the crisis banner's true rendered height (it wraps
  // to different heights depending on screen width, text size, and notch
  // safe-area inset) so content never sits underneath it.
  spacer.style.height = banner.offsetHeight + "px";
}
window.addEventListener("resize", function() {
  var b = document.querySelector('[data-crisis-banner="1"]');
  if (b && b.nextSibling) b.nextSibling.style.height = b.offsetHeight + "px";
});

/* ===========================================================
   SHARED UI PIECES
=========================================================== */
function card(t, children, extraStyle) {
  var style = { background: t.card, border: "1px solid " + t.border, borderRadius: "16px", padding: "18px" };
  Object.assign(style, extraStyle || {});
  return el("div", { style: style }, children);
}
function sectionLabel(t, text) {
  return el("div", { style: { fontFamily: t.display, fontWeight: "800", fontSize: "13px", letterSpacing: "1.2px", textTransform: "uppercase", color: t.textMuted, marginBottom: "10px" } }, [text]);
}
function primaryButton(t, text, onClick) {
  return el("button", {
    onclick: onClick,
    style: { background: t.primary, color: t.primaryText, border: "none", borderRadius: "12px", padding: "12px 18px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }
  }, [text]);
}
function crisisBanner(t) {
  return el("div", {
    "data-crisis-banner": "1",
    style: {
      position: "fixed", top: "0", left: "0", right: "0", zIndex: "1000", background: t.crisisBg, color: t.crisisText,
      padding: "calc(10px + env(safe-area-inset-top, 0px)) 14px 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", flexWrap: "wrap",
      textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.35)"
    }
  }, [
    el("span", { style: { fontWeight: "900", fontSize: "13px" } }, ["IN CRISIS? Call or text 988 \u2014 or dial 911 for emergencies"]),
    el("a", { href: "tel:988", style: { display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(0,0,0,0.25)", color: t.crisisText, padding: "4px 10px", borderRadius: "999px", fontWeight: "800", fontSize: "12px" } }, ["\u260E Call 988"]),
    el("a", { href: "sms:988", style: { display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(0,0,0,0.25)", color: t.crisisText, padding: "4px 10px", borderRadius: "999px", fontWeight: "800", fontSize: "12px" } }, ["\uD83D\uDCAC Text 988"])
  ]);
}
function quoteCard(t) {
  var doy = dayOfYear(new Date()) % QUOTES.length;
  var q = QUOTES[doy];
  return card(t, [
    el("div", { style: { display: "flex", gap: "10px" } }, [
      el("span", { style: { fontSize: "20px", color: t.accent, flexShrink: "0" } }, ["\u201C"]),
      el("div", {}, [
        el("div", { style: { fontFamily: t.display, fontSize: "16px", color: t.text, fontWeight: "700", lineHeight: "1.4" } }, [q[0]]),
        el("div", { style: { fontSize: "12px", color: t.textMuted, marginTop: "6px", fontWeight: "600" } }, ["\u2014 " + q[1]])
      ])
    ])
  ], { background: t.cardAlt, marginBottom: "20px" });
}

var TABS = [
  { key: "gratitude", label: "Morning", icon: "\u2600\uFE0F" },
  { key: "sobriety", label: "Sobriety", icon: "\uD83D\uDD25" },
  { key: "craving", label: "Urge", icon: "\uD83C\uDF0A" },
  { key: "journal", label: "Evening", icon: "\uD83C\uDF19" },
  { key: "control", label: "Control", icon: "\uD83E\uDDED" },
  { key: "resources", label: "Resources", icon: "\uD83D\uDCCD" },
  { key: "settings", label: "Settings", icon: "\u2699\uFE0F" }
];

/* ===========================================================
   AD BANNER — FIXED VERSION
   The ad slot is created ONCE and lives outside the part of the
   page that gets rebuilt on every tab switch. Previously a fresh
   <ins class="adsbygoogle"> was created and pushed to AdSense on
   every single render() call (i.e. every tab tap), while the old
   one was simultaneously destroyed via root.innerHTML = "". That
   race — destroying an ad node mid-load while re-invoking
   adsbygoogle.push() — is what was crashing the page (black
   screen, dropped back to Chrome). Now the ad container is
   appended directly to document.body once, is never removed, and
   is only ever filled a single time.
=========================================================== */
var ADSENSE_CLIENT_ID = "ca-pub-2293731514743936";
var AD_SLOT_ID = "8627879721";
var ADS_CONFIGURED = ADSENSE_CLIENT_ID.indexOf("XXXX") === -1 && AD_SLOT_ID.indexOf("XXXX") === -1;
var AD_BAR_HEIGHT = 50;

var adContainerEl = null;
var adInitialized = false;

function ensureAdContainer(t) {
  if (!adContainerEl) {
    adContainerEl = el("div", {
      style: {
        position: "fixed", left: "0", right: "0", bottom: "0", zIndex: "899",
        display: "flex", alignItems: "center", justifyContent: "center",
        height: AD_BAR_HEIGHT + "px", overflow: "hidden"
      }
    });
    document.body.appendChild(adContainerEl);
  }

  // Safe to update every render — this only touches the container's own
  // style, it never removes/recreates the ad node inside it.
  adContainerEl.style.background = t.bgSoft;
  adContainerEl.style.borderTop = "1px solid " + t.border;

  if (adInitialized) return;
  adInitialized = true;

  if (ADS_CONFIGURED) {
    var ins = el("ins", {
      "class": "adsbygoogle",
      style: { display: "inline-block", width: "320px", height: AD_BAR_HEIGHT + "px" },
      "data-ad-client": ADSENSE_CLIENT_ID,
      "data-ad-slot": AD_SLOT_ID
    });
    adContainerEl.appendChild(ins);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense push failed:", e);
    }
  } else {
    adContainerEl.appendChild(el("div", {
      style: { fontSize: "11px", color: t.textMuted, fontWeight: "600", letterSpacing: "0.3px" }
    }, ["Ad space \u2014 connect AdSense account to activate"]));
  }
}

function bottomBar(t) {
  ensureAdContainer(t);
  var wrap = el("div", { style: { position: "fixed", bottom: AD_BAR_HEIGHT + "px", left: "0", right: "0", zIndex: "900" } });
  wrap.appendChild(bottomNav(t));
  return wrap;
}

function bottomNav(t) {
  // flex:1 + minWidth:0 + ellipsis on the label (rather than space-around
  // with fixed padding) keeps all tabs reachable at once as more are added —
  // items shrink together instead of the last one getting pushed off-screen
  // on narrow phones.
  var nav = el("div", {
    style: { background: t.bgSoft, borderTop: "1px solid " + t.border, display: "flex", padding: "8px 2px calc(8px + env(safe-area-inset-bottom, 0px))" }
  });
  TABS.forEach(function(tb) {
    var active = state.tab === tb.key;
    var btn = el("button", {
      onclick: function() { state.tab = tb.key; render(); },
      style: { flex: "1 1 0", minWidth: "0", background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "6px 2px", cursor: "pointer", color: active ? t.primary : t.textMuted }
    }, [
      el("span", { style: { fontSize: "17px" } }, [tb.icon]),
      el("span", { style: { fontSize: "9px", fontWeight: "700", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, [tb.label])
    ]);
    nav.appendChild(btn);
  });
  return nav;
}

/* ===========================================================
   GRATITUDE TAB
=========================================================== */
function renderGratitudeTab(t) {
  var today = new Date();
  var key = "gratitude:" + dateKey(today);
  var entries = readLS(key, ["", "", "", "", ""]);

  var wrap = el("div");
  wrap.appendChild(el("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" } }, [
    el("span", { style: { fontSize: "22px" } }, ["\u2600\uFE0F"]),
    el("h2", { style: { fontFamily: t.display, fontSize: "22px", margin: "0", color: t.text } }, ["Morning Gratitude"])
  ]));
  wrap.appendChild(el("p", { style: { color: t.textMuted, fontSize: "14px", marginTop: "4px", marginBottom: "18px" } },
    ["List five things you're grateful for. Each day starts fresh \u2014 try to write something new; entries are kept for 30 days so we can nudge you if you repeat yourself."]));

  // Prune anything older than 30 days so storage doesn't grow forever
  // and old entries drop out of the duplicate check automatically.
  var THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  var cutoff = new Date(today.getTime() - THIRTY_DAYS_MS);
  var cutoffKey = dateKey(cutoff);
  var allGratitudeKeys = listLS("gratitude:").filter(function(k) { return k !== key; });
  allGratitudeKeys.forEach(function(k) {
    var d = k.replace("gratitude:", "");
    if (d < cutoffKey) removeLS(k);
  });

  var pastKeys = allGratitudeKeys.filter(function(k) { return k.replace("gratitude:", "") >= cutoffKey; }).sort();
  var pastSet = {};
  pastKeys.forEach(function(k) {
    var items = readLS(k, []);
    items.forEach(function(txt) { if (txt && txt.trim()) pastSet[txt.trim().toLowerCase()] = true; });
  });
  var repeat = entries.find(function(e) { return e.trim() && pastSet[e.trim().toLowerCase()]; });
  if (repeat) {
    wrap.appendChild(el("div", { style: { background: t.cardAlt, border: "1px dashed " + t.secondary, borderRadius: "12px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: t.text } },
      ["\u2728 You've written something similar to \"" + repeat + "\" in the last 30 days \u2014 see if you can find a new detail today."]));
  }

  var inputs = [];
  var cardBody = [];
  entries.forEach(function(val, i) {
    var ta = el("textarea", {
      rows: "2", placeholder: "Today I'm grateful for...",
      style: { width: "100%", marginTop: "4px", background: t.bgSoft, color: t.text, border: "1px solid " + t.border, borderRadius: "10px", padding: "10px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }
    });
    ta.value = val;
    inputs.push(ta);
    cardBody.push(el("div", { style: { marginBottom: i < 4 ? "12px" : "0" } }, [
      el("label", { style: { fontSize: "12px", color: t.textMuted, fontWeight: "700" } }, ["Gratitude " + (i + 1)]),
      ta
    ]));
  });
  wrap.appendChild(card(t, cardBody));

  var flashSpan = el("span", { style: { color: t.secondary, fontWeight: "700", fontSize: "13px", display: "none" } }, ["\u2713 Saved"]);
  var saveRow = el("div", { style: { marginTop: "14px", display: "flex", alignItems: "center", gap: "12px" } }, [
    primaryButton(t, "Save today's gratitude", function() {
      var next = inputs.map(function(i) { return i.value; });
      writeLS(key, next);
      if (next.some(function(v) { return v.trim(); })) recordStatDate("stats:gratitudeDates", dateKey(today));
      flashSpan.style.display = "inline";
      setTimeout(function() { flashSpan.style.display = "none"; }, 1800);
    }),
    flashSpan
  ]);
  wrap.appendChild(saveRow);

  if (pastKeys.length > 0) {
    wrap.appendChild(el("div", { style: { marginTop: "26px" } }, [sectionLabel(t, "Past entries")]));
    var displayKeys = pastKeys.slice().reverse().slice(0, 10);
    displayKeys.forEach(function(k) {
      var items = readLS(k, []).filter(Boolean);
      var lines = items.map(function(txt) { return el("div", { style: { fontSize: "13px", color: t.text, marginBottom: "2px" } }, ["\u2022 " + txt]); });
      wrap.appendChild(card(t, [
        el("div", { style: { fontWeight: "800", fontSize: "13px", color: t.secondary, marginBottom: "6px" } }, [k.replace("gratitude:", "")])
      ].concat(lines), { marginBottom: "10px" }));
    });
    if (pastKeys.length > displayKeys.length) {
      wrap.appendChild(el("div", { style: { fontSize: "12px", color: t.textMuted, marginTop: "4px" } },
        ["Showing your 10 most recent days. Entries are kept for 30 days total for the duplicate check above, then cleared automatically."]));
    }
  }

  return wrap;
}

/* ===========================================================
   SOBRIETY TAB
=========================================================== */
function durationSince(dateStr) {
  if (!dateStr) return null;
  var start = new Date(dateStr + "T00:00:00");
  if (isNaN(start.getTime())) return null;
  var now = new Date();
  var ms = now - start;
  if (ms < 0) return { invalid: true };
  var totalDays = Math.floor(ms / 86400000);
  var years = now.getFullYear() - start.getFullYear();
  var months = now.getMonth() - start.getMonth();
  var days = now.getDate() - start.getDate();
  if (days < 0) { months -= 1; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (months < 0) { years -= 1; months += 12; }
  return { years: years, months: months, days: days, totalDays: totalDays };
}
// Days between two dateKey() strings — used to size an archived streak at
// the moment it's reset, independent of "now" (unlike durationSince, which
// always measures up to the present and so can't describe a closed streak).
function daysBetween(fromStr, toStr) {
  var a = new Date(fromStr + "T00:00:00");
  var b = new Date(toStr + "T00:00:00");
  return Math.round((b - a) / 86400000);
}
var MILESTONES = [
  { label: "1 Day", value: 1 },
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "60 Days", value: 60 },
  { label: "90 Days", value: 90 },
  { label: "180 Days", value: 180 },
  { label: "1 Year", value: 365 }
];
// Shared by the per-substance day badges above and the cross-feature
// achievements below — both are "earn a badge at each threshold, show how
// far to the next one" with the same visuals, just different units.
function milestoneBadgeRow(t, milestones, currentValue) {
  var row = el("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } });
  var nextMilestone = null;
  milestones.forEach(function(m) {
    var earned = currentValue >= m.value;
    if (!earned && nextMilestone === null) nextMilestone = m;
    row.appendChild(el("div", {
      style: {
        display: "flex", alignItems: "center", gap: "6px",
        background: earned ? t.primary : t.bgSoft,
        border: "1px solid " + (earned ? t.primary : t.border),
        color: earned ? t.primaryText : t.textMuted,
        borderRadius: "999px", padding: "7px 12px", fontSize: "12px", fontWeight: "800",
        opacity: earned ? "1" : "0.65"
      }
    }, [earned ? "🏆 " + m.label : m.label]));
  });
  return { row: row, next: nextMilestone };
}

/* ===========================================================
   ACHIEVEMENTS — recovery milestones beyond streak days.
   Gratitude entries get pruned after 30 days (see the duplicate-check
   logic in the gratitude tab) and craving/trigger logs could in
   principle be cleared, so a lifetime count can't be derived from
   what's currently in localStorage. recordStatDate keeps a small,
   never-pruned list of dates-ever-saved just for this tally.
=========================================================== */
function recordStatDate(statKey, dateStr) {
  var dates = readLS(statKey, []);
  if (dates.indexOf(dateStr) === -1) {
    dates.push(dateStr);
    writeLS(statKey, dates);
  }
}
var ACHIEVEMENTS = [
  { label: "Grateful Days", icon: "☀️", unit: "days", tiers: [7, 30, 100],
    count: function() { return readLS("stats:gratitudeDates", []).length; } },
  { label: "Journal Entries", icon: "🌙", unit: "entries", tiers: [7, 30, 100],
    count: function() { return readLS("stats:journalDates", []).length; } },
  { label: "Urges Ridden Out", icon: "🌊", unit: "sessions", tiers: [5, 20, 50],
    count: function() { return readLS(CRAVING_LOG_KEY, []).length; } },
  { label: "Urges Passed", icon: "💪", unit: "wins", tiers: [5, 20, 50],
    count: function() { return readLS(CRAVING_LOG_KEY, []).filter(function(e) { return e.outcome === "passed"; }).length; } },
  { label: "Self-Awareness Logs", icon: "🚩", unit: "logs", tiers: [5, 20, 50],
    count: function() { return readLS(TRIGGER_LOG_KEY, []).length; } }
];
function renderAchievements(t) {
  var wrap = el("div", { style: { marginTop: "24px" } });
  wrap.appendChild(sectionLabel(t, "Milestones beyond the streak"));
  wrap.appendChild(el("div", { style: { fontSize: "12px", color: t.textMuted, marginBottom: "14px" } },
    ["Recovery shows up in more than days sober — these track the habits that support it."]));

  ACHIEVEMENTS.forEach(function(a) {
    var count = a.count();
    var tierMilestones = a.tiers.map(function(v) { return { label: v + " " + a.unit, value: v }; });
    var result = milestoneBadgeRow(t, tierMilestones, count);
    var body = [
      el("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" } }, [
        el("span", { style: { fontSize: "20px" } }, [a.icon]),
        el("div", {}, [
          el("div", { style: { fontFamily: t.display, fontWeight: "900", fontSize: "20px", color: t.text } }, [String(count)]),
          el("div", { style: { fontSize: "11px", color: t.textMuted, fontWeight: "700", textTransform: "uppercase" } }, [a.label])
        ])
      ]),
      result.row
    ];
    if (result.next) {
      var toGo = result.next.value - count;
      body.push(el("div", { style: { fontSize: "12px", color: t.textMuted, marginTop: "8px" } },
        [toGo + " more to reach " + result.next.value + "."]));
    } else {
      body.push(el("div", { style: { fontSize: "12px", color: t.secondary, fontWeight: "700", marginTop: "8px" } }, ["All tiers earned here — nice work."]));
    }
    wrap.appendChild(card(t, body, { marginBottom: "12px" }));
  });

  return wrap;
}
function renderSobrietyTab(t) {
  var data = readLS("sobriety:tracker", [
    { name: "Substance 1", since: "" }, { name: "Substance 2", since: "" }, { name: "Substance 3", since: "" },
    { name: "Substance 4", since: "" }, { name: "Substance 5", since: "" }
  ]);
  var wrap = el("div");
  wrap.appendChild(el("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" } }, [
    el("span", { style: { fontSize: "22px" } }, ["\uD83D\uDD25"]),
    el("h2", { style: { fontFamily: t.display, fontSize: "22px", margin: "0", color: t.text } }, ["Sobriety Tracker"])
  ]));
  wrap.appendChild(el("p", { style: { color: t.textMuted, fontSize: "14px", marginTop: "4px", marginBottom: "18px" } },
    ["Track up to five substances with the exact date \u2014 including year \u2014 you got clean. Earn milestone awards as you go."]));

  data.forEach(function(d, i) {
    var nameInput = el("input", {
      value: d.name, placeholder: "Substance name",
      style: { width: "100%", background: "transparent", border: "none", borderBottom: "2px solid " + t.border, color: t.text, fontFamily: t.display, fontWeight: "800", fontSize: "17px", padding: "4px 0", marginBottom: "14px", outline: "none", boxSizing: "border-box" }
    });
    nameInput.value = d.name;
    nameInput.addEventListener("input", function() {
      data[i].name = nameInput.value;
      writeLS("sobriety:tracker", data);
    });

    var dateInput = el("input", {
      type: "date", max: dateKey(new Date()),
      style: { width: "100%", marginTop: "4px", background: t.bgSoft, color: t.text, border: "1px solid " + t.border, borderRadius: "10px", padding: "10px", fontSize: "14px", boxSizing: "border-box" }
    });
    dateInput.value = d.since;

    var statsHolder = el("div");
    var badgesHolder = el("div");
    var resetHolder = el("div");
    var historyHolder = el("div");
    var resetPanelOpen = { v: false };

    function longestStreakDays() {
      var history = data[i].history || [];
      var best = history.reduce(function(max, h) { return Math.max(max, h.days || 0); }, 0);
      var dur = durationSince(dateInput.value);
      if (dur && !dur.invalid) best = Math.max(best, dur.totalDays);
      return best;
    }

    function renderStats() {
      statsHolder.innerHTML = "";
      badgesHolder.innerHTML = "";
      var dur = durationSince(dateInput.value);
      if (dur && !dur.invalid) {
        var row = el("div", { style: { marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" } });
        [["Years", dur.years], ["Months", dur.months], ["Days", dur.days]].forEach(function(pair) {
          row.appendChild(el("div", { style: { background: t.cardAlt, borderRadius: "12px", padding: "10px 16px", textAlign: "center", flex: "1 1 80px" } }, [
            el("div", { style: { fontFamily: t.display, fontSize: "24px", fontWeight: "900", color: t.primary } }, [String(pair[1])]),
            el("div", { style: { fontSize: "11px", color: t.textMuted, fontWeight: "700", textTransform: "uppercase" } }, [pair[0]])
          ]));
        });
        row.appendChild(el("div", { style: { background: t.cardAlt, borderRadius: "12px", padding: "10px 16px", textAlign: "center", flex: "1 1 100px" } }, [
          el("div", { style: { fontFamily: t.display, fontSize: "24px", fontWeight: "900", color: t.secondary } }, [String(dur.totalDays)]),
          el("div", { style: { fontSize: "11px", color: t.textMuted, fontWeight: "700", textTransform: "uppercase" } }, ["Total Days"])
        ]));
        statsHolder.appendChild(row);

        if ((data[i].history || []).length > 0) {
          var longest = longestStreakDays();
          statsHolder.appendChild(el("div", { style: { fontSize: "12px", color: t.textMuted, marginTop: "8px" } },
            ["\ud83c\udfc6 Longest streak so far: " + longest + " day" + (longest === 1 ? "" : "s") + "."]));
        }

        var badgeLabel = el("div", { style: { fontSize: "11px", color: t.textMuted, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "16px", marginBottom: "8px" } }, ["Milestone Awards"]);
        badgesHolder.appendChild(badgeLabel);
        var milestoneResult = milestoneBadgeRow(t, MILESTONES, dur.totalDays);
        badgesHolder.appendChild(milestoneResult.row);
        if (milestoneResult.next) {
          var daysToGo = milestoneResult.next.value - dur.totalDays;
          badgesHolder.appendChild(el("div", { style: { fontSize: "12px", color: t.textMuted, marginTop: "8px" } },
            [daysToGo + " day" + (daysToGo === 1 ? "" : "s") + " to go until " + milestoneResult.next.label + "."]));
        } else {
          badgesHolder.appendChild(el("div", { style: { fontSize: "12px", color: t.secondary, fontWeight: "700", marginTop: "8px" } }, ["All milestones earned \u2014 incredible work."]));
        }
      } else if (dur && dur.invalid) {
        statsHolder.appendChild(el("div", { style: { marginTop: "10px", color: t.accent, fontSize: "12px", fontWeight: "700" } }, ["That date is in the future \u2014 double check it."]));
      }
    }

    function renderResetPanel() {
      resetHolder.innerHTML = "";
      if (!dateInput.value) return;

      if (!resetPanelOpen.v) {
        resetHolder.appendChild(el("button", {
          type: "button",
          onclick: function() { resetPanelOpen.v = true; renderResetPanel(); },
          style: { background: "none", border: "none", color: t.textMuted, fontSize: "12px", fontWeight: "700", textDecoration: "underline", cursor: "pointer", padding: "4px 0", marginTop: "16px" }
        }, ["Had a setback? Log a reset"]));
        return;
      }

      var resetDateInput = el("input", {
        type: "date", max: dateKey(new Date()), min: dateInput.value,
        style: { width: "100%", marginTop: "4px", background: t.bgSoft, color: t.text, border: "1px solid " + t.border, borderRadius: "10px", padding: "10px", fontSize: "14px", boxSizing: "border-box" }
      });
      resetDateInput.value = dateKey(new Date());
      var resetNoteInput = el("textarea", {
        rows: "2", placeholder: "What happened, or what would help next time? (optional, just for you)",
        style: { width: "100%", marginTop: "10px", background: t.bgSoft, color: t.text, border: "1px solid " + t.border, borderRadius: "10px", padding: "10px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }
      });
      var warnDiv = el("div", { style: { color: t.accent, fontSize: "12px", marginTop: "8px", display: "none" } },
        ["The reset date can't be before your current streak started."]);

      resetHolder.appendChild(card(t, [
        el("div", { style: { fontFamily: t.display, fontWeight: "800", fontSize: "14px", color: t.text, marginBottom: "4px" } }, ["Log a reset"]),
        el("div", { style: { fontSize: "12px", color: t.textMuted, marginBottom: "12px" } },
          ["Setbacks are part of recovery for a lot of people \u2014 this isn't erased. Your current streak is saved to your history below, and a new count starts from the date you pick."]),
        el("label", { style: { fontSize: "12px", color: t.textMuted, fontWeight: "700" } }, ["Reset date"]),
        resetDateInput,
        resetNoteInput,
        warnDiv,
        el("div", { style: { display: "flex", gap: "10px", marginTop: "12px" } }, [
          el("button", {
            type: "button",
            onclick: function() { resetPanelOpen.v = false; renderResetPanel(); },
            style: { flex: "1", padding: "12px", borderRadius: "12px", border: "1px solid " + t.border, background: "none", color: t.text, fontWeight: "700", fontSize: "13px", cursor: "pointer" }
          }, ["Cancel"]),
          el("button", {
            type: "button",
            onclick: function() {
              var resetDate = resetDateInput.value;
              if (!resetDate || resetDate < dateInput.value) {
                warnDiv.style.display = "block";
                return;
              }
              var history = data[i].history || [];
              history.push({
                since: dateInput.value,
                until: resetDate,
                days: daysBetween(dateInput.value, resetDate),
                note: resetNoteInput.value.trim()
              });
              data[i].history = history;
              data[i].since = resetDate;
              writeLS("sobriety:tracker", data);
              dateInput.value = resetDate;
              resetPanelOpen.v = false;
              renderStats();
              renderResetPanel();
              renderHistory();
            },
            style: { flex: "1", padding: "12px", borderRadius: "12px", border: "none", background: t.primary, color: t.primaryText, fontWeight: "700", fontSize: "13px", cursor: "pointer" }
          }, ["Confirm reset"])
        ])
      ], { marginTop: "16px", background: t.cardAlt }));
    }

    function renderHistory() {
      historyHolder.innerHTML = "";
      var history = (data[i].history || []).slice().reverse();
      if (history.length === 0) return;
      historyHolder.appendChild(el("div", { style: { fontSize: "11px", color: t.textMuted, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "18px", marginBottom: "8px" } }, ["Past streaks"]));
      history.forEach(function(h) {
        historyHolder.appendChild(el("div", { style: { background: t.bgSoft, border: "1px solid " + t.border, borderRadius: "10px", padding: "10px 12px", marginBottom: "8px" } }, [
          el("div", { style: { fontSize: "13px", color: t.text, fontWeight: "700" } }, [h.since + " \u2192 " + h.until + " \u00b7 " + h.days + " day" + (h.days === 1 ? "" : "s")]),
          h.note ? el("div", { style: { fontSize: "12px", color: t.textMuted, marginTop: "4px" } }, [h.note]) : null
        ]));
      });
    }

    dateInput.addEventListener("change", function() {
      data[i].since = dateInput.value;
      writeLS("sobriety:tracker", data);
      renderStats();
      renderResetPanel();
    });
    renderStats();
    renderResetPanel();
    renderHistory();

    wrap.appendChild(card(t, [
      nameInput,
      el("label", { style: { fontSize: "12px", color: t.textMuted, fontWeight: "700" } }, ["Clean since (month / day / year)"]),
      dateInput,
      statsHolder,
      badgesHolder,
      resetHolder,
      historyHolder
    ], { marginBottom: "14px" }));
  });

  wrap.appendChild(renderAchievements(t));

  return wrap;
}

/* ===========================================================
   URGE / CRAVING TAB
   Urges peak and pass like a wave, usually within 10-20 minutes.
   This is a guided "urge surfing" timer: a quick HALT + intensity
   check-in, a paced-breathing countdown, then a check-in on the
   way out that gets logged so patterns become visible over time.
=========================================================== */
var CRAVING_LOG_KEY = "craving:log";
var HALT_OPTIONS = [
  { key: "hungry", label: "Hungry", icon: "🍽️" },
  { key: "angry", label: "Angry / Anxious", icon: "😤" },
  { key: "lonely", label: "Lonely", icon: "🙋" },
  { key: "tired", label: "Tired", icon: "😴" }
];
var CRAVING_DURATIONS = [5, 10, 15, 20];

// Ephemeral (not persisted) — an in-progress session shouldn't survive a
// browser restart, but should survive switching tabs and coming back, so
// remaining time is computed from a stored end timestamp rather than a
// counter that would desync while the tab isn't mounted.
var cravingSession = null;

function newCravingSession() {
  return { phase: "setup", halt: {}, intensityBefore: 5, durationMin: 10 };
}
function formatCountdown(ms) {
  var totalSec = Math.max(0, Math.ceil(ms / 1000));
  var m = Math.floor(totalSec / 60);
  var s = totalSec % 60;
  return m + ":" + String(s).padStart(2, "0");
}

// One persistent ticker (mirrors the ad-container pattern above) instead of
// creating/tearing down an interval on every tab switch. It only triggers a
// re-render while the craving tab is actually mounted and a timer is running.
setInterval(function() {
  if (!cravingSession || cravingSession.phase !== "active") return;
  if (Date.now() >= cravingSession.endsAt) cravingSession.phase = "checkin";
  if (state.tab === "craving") render();
}, 1000);

function haltChipRow(t, selected, onToggle) {
  var row = el("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } });
  HALT_OPTIONS.forEach(function(opt) {
    var active = !!selected[opt.key];
    row.appendChild(el("button", {
      type: "button",
      onclick: function() { onToggle(opt.key); },
      style: {
        display: "flex", alignItems: "center", gap: "6px",
        background: active ? t.primary : t.bgSoft, color: active ? t.primaryText : t.text,
        border: "1px solid " + (active ? t.primary : t.border), borderRadius: "999px",
        padding: "8px 14px", fontSize: "13px", fontWeight: "700", cursor: "pointer"
      }
    }, [opt.icon + " " + opt.label]));
  });
  return row;
}
function intensitySlider(t, value, onChange) {
  var display = el("div", { style: { fontFamily: t.display, fontSize: "28px", fontWeight: "900", color: t.primary, textAlign: "center", marginBottom: "6px" } }, [String(value)]);
  var input = el("input", {
    type: "range", min: "1", max: "10", step: "1",
    style: { width: "100%" }
  });
  input.value = String(value);
  input.addEventListener("input", function() {
    display.textContent = input.value;
    onChange(parseInt(input.value, 10));
  });
  var labels = el("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "11px", color: t.textMuted, fontWeight: "700", marginTop: "2px" } }, [
    el("span", {}, ["Barely there"]), el("span", {}, ["Overwhelming"])
  ]);
  return el("div", {}, [display, input, labels]);
}

function renderCravingSetup(t) {
  if (!cravingSession) cravingSession = newCravingSession();
  var s = cravingSession;

  var haltHolder = el("div");
  function refreshHalt() {
    haltHolder.innerHTML = "";
    haltHolder.appendChild(haltChipRow(t, s.halt, function(key) {
      s.halt[key] = !s.halt[key];
      refreshHalt();
    }));
  }
  refreshHalt();

  var durationRow = el("div", { style: { display: "flex", gap: "8px" } });
  function refreshDuration() {
    durationRow.innerHTML = "";
    CRAVING_DURATIONS.forEach(function(mins) {
      var active = s.durationMin === mins;
      durationRow.appendChild(el("button", {
        type: "button",
        onclick: function() { s.durationMin = mins; refreshDuration(); },
        style: {
          flex: "1", padding: "10px", borderRadius: "10px", cursor: "pointer", fontWeight: "800", fontSize: "13px",
          background: active ? t.primary : t.bgSoft, color: active ? t.primaryText : t.text, border: "1px solid " + (active ? t.primary : t.border)
        }
      }, [mins + " min"]));
    });
  }
  refreshDuration();

  return el("div", {}, [
    card(t, [
      el("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" } }, [
        el("span", { style: { fontSize: "28px" } }, ["🌊"]),
        el("div", {}, [
          el("div", { style: { fontFamily: t.display, fontWeight: "800", fontSize: "16px", color: t.text } }, ["Having an urge?"]),
          el("div", { style: { fontSize: "12px", color: t.textMuted } }, ["Urges peak and fall like a wave — most pass within 10–20 minutes. You don't have to act on it."])
        ])
      ]),
      sectionLabel(t, "What's going on right now? (optional)"),
      haltHolder,
      el("div", { style: { marginTop: "18px" } }, [sectionLabel(t, "How strong is it, 1–10?")]),
      intensitySlider(t, s.intensityBefore, function(v) { s.intensityBefore = v; }),
      el("div", { style: { marginTop: "18px" } }, [sectionLabel(t, "Ride it out for")]),
      durationRow
    ]),
    el("div", { style: { marginTop: "16px" } }, [
      primaryButton(t, "Start riding the wave", function() {
        var now = Date.now();
        s.startedAt = now;
        s.endsAt = now + s.durationMin * 60 * 1000;
        s.phase = "active";
        render();
      })
    ])
  ]);
}

function renderCravingActive(t) {
  var s = cravingSession;
  var remaining = s.endsAt - Date.now();
  var pct = Math.min(1, Math.max(0, 1 - remaining / (s.durationMin * 60 * 1000)));

  var breathCircle = el("div", {
    style: {
      width: "150px", height: "150px", borderRadius: "50%", margin: "10px auto",
      background: "radial-gradient(circle at 40% 35%, " + t.primary + ", " + t.secondary + ")",
      animation: "anchorpoint-breathe 8s ease-in-out infinite",
      boxShadow: "0 0 40px " + t.primary + "55"
    }
  });

  var selectedHalt = Object.keys(s.halt || {}).filter(function(k) { return s.halt[k]; });
  var haltLine = selectedHalt.length
    ? el("div", { style: { fontSize: "12px", color: t.textMuted, textAlign: "center", marginTop: "4px" } },
        ["Noted: " + selectedHalt.map(function(k) { var o = HALT_OPTIONS.find(function(x) { return x.key === k; }); return o ? o.label : k; }).join(", ")])
    : null;

  var body = [
    el("div", { style: { fontSize: "13px", color: t.textMuted, textAlign: "center", fontWeight: "700" } }, ["Breathe in slowly as it grows… out slowly as it shrinks."]),
    breathCircle,
    el("div", { style: { fontFamily: t.display, fontSize: "40px", fontWeight: "900", color: t.text, textAlign: "center" } }, [formatCountdown(remaining)]),
    el("div", { style: { fontSize: "12px", color: t.textMuted, textAlign: "center", marginBottom: "4px" } }, ["remaining · " + Math.round(pct * 100) + "% through"])
  ];
  if (haltLine) body.push(haltLine);

  var actions = el("div", { style: { display: "flex", gap: "10px", marginTop: "16px" } }, [
    el("button", {
      onclick: function() { s.endsAt += 5 * 60 * 1000; s.durationMin += 5; render(); },
      style: { flex: "1", padding: "12px", borderRadius: "12px", border: "1px solid " + t.border, background: t.bgSoft, color: t.text, fontWeight: "700", fontSize: "13px", cursor: "pointer" }
    }, ["+5 more minutes"]),
    primaryButton(t, "I'm through it", function() { s.phase = "checkin"; render(); })
  ]);

  return el("div", {}, [card(t, body), actions]);
}

function renderCravingCheckin(t) {
  var s = cravingSession;
  var afterVal = { v: 5 };
  var outcomeHolder = el("div");
  var chosenOutcome = { v: null };
  var noteInput = el("textarea", {
    rows: "3", placeholder: "Anything worth remembering for next time? (optional)",
    style: { width: "100%", marginTop: "10px", background: t.bgSoft, color: t.text, border: "1px solid " + t.border, borderRadius: "10px", padding: "10px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }
  });

  function refreshOutcomes() {
    outcomeHolder.innerHTML = "";
    var row = el("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } });
    [
      { key: "passed", label: "🌊 It passed", color: t.secondary },
      { key: "gave_in", label: "I gave in", color: t.accent }
    ].forEach(function(opt) {
      var active = chosenOutcome.v === opt.key;
      row.appendChild(el("button", {
        type: "button",
        onclick: function() { chosenOutcome.v = opt.key; refreshOutcomes(); },
        style: {
          flex: "1 1 120px", padding: "10px", borderRadius: "10px", cursor: "pointer", fontWeight: "800", fontSize: "13px",
          background: active ? opt.color : t.bgSoft, color: active ? t.primaryText : t.text, border: "1px solid " + (active ? opt.color : t.border)
        }
      }, [opt.label]));
    });
    outcomeHolder.appendChild(row);
  }
  refreshOutcomes();

  return el("div", {}, [
    card(t, [
      el("div", { style: { fontFamily: t.display, fontWeight: "800", fontSize: "16px", color: t.text, marginBottom: "4px" } }, ["How is it now?"]),
      el("div", { style: { fontSize: "12px", color: t.textMuted, marginBottom: "12px" } }, ["Started at " + s.intensityBefore + "/10."]),
      intensitySlider(t, 5, function(v) { afterVal.v = v; }),
      el("div", { style: { marginTop: "18px" } }, [sectionLabel(t, "What happened?")]),
      outcomeHolder,
      noteInput
    ]),
    el("div", { style: { marginTop: "16px" } }, [
      primaryButton(t, "Save and finish", function() {
        var log = readLS(CRAVING_LOG_KEY, []);
        log.push({
          date: dateKey(new Date()),
          halt: Object.keys(s.halt || {}).filter(function(k) { return s.halt[k]; }),
          durationMin: s.durationMin,
          intensityBefore: s.intensityBefore,
          intensityAfter: afterVal.v,
          outcome: chosenOutcome.v || "unspecified",
          note: noteInput.value.trim()
        });
        writeLS(CRAVING_LOG_KEY, log);
        cravingSession = null;
        render();
      })
    ])
  ]);
}

function cravingStats(t) {
  var log = readLS(CRAVING_LOG_KEY, []);
  if (log.length === 0) return null;
  var passed = log.filter(function(e) { return e.outcome === "passed"; }).length;
  var wrap = el("div", { style: { marginTop: "26px" } });
  wrap.appendChild(sectionLabel(t, "Your track record"));
  var row = el("div", { style: { display: "flex", gap: "10px", marginBottom: "14px" } }, [
    el("div", { style: { background: t.cardAlt, borderRadius: "12px", padding: "10px 16px", textAlign: "center", flex: "1" } }, [
      el("div", { style: { fontFamily: t.display, fontSize: "22px", fontWeight: "900", color: t.primary } }, [String(log.length)]),
      el("div", { style: { fontSize: "11px", color: t.textMuted, fontWeight: "700", textTransform: "uppercase" } }, ["Urges ridden out"])
    ]),
    el("div", { style: { background: t.cardAlt, borderRadius: "12px", padding: "10px 16px", textAlign: "center", flex: "1" } }, [
      el("div", { style: { fontFamily: t.display, fontSize: "22px", fontWeight: "900", color: t.secondary } }, [String(passed)]),
      el("div", { style: { fontSize: "11px", color: t.textMuted, fontWeight: "700", textTransform: "uppercase" } }, ["Passed without using"])
    ])
  ]);
  wrap.appendChild(row);

  log.slice(-8).reverse().forEach(function(e) {
    var outcomeLabel = e.outcome === "passed" ? "🌊 Passed" : e.outcome === "gave_in" ? "Gave in" : "Logged";
    wrap.appendChild(card(t, [
      el("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "4px" } }, [
        el("div", { style: { fontWeight: "800", fontSize: "13px", color: t.secondary } }, [e.date]),
        el("div", { style: { fontWeight: "800", fontSize: "13px", color: t.text } }, [outcomeLabel])
      ]),
      el("div", { style: { fontSize: "12px", color: t.textMuted } }, ["Intensity " + e.intensityBefore + " → " + e.intensityAfter + " · " + e.durationMin + " min" + (e.halt && e.halt.length ? " · " + e.halt.join(", ") : "")]),
      e.note ? el("div", { style: { fontSize: "13px", color: t.text, marginTop: "6px" } }, [e.note]) : null
    ], { marginBottom: "10px" }));
  });
  return wrap;
}

/* ===========================================================
   TRIGGER / WARNING SIGNS LOG
   A lighter-weight companion to the timer above — for noting what
   pulled at you (people, places, feelings, situations) even when it
   didn't rise to a full craving session, so patterns become visible
   over time.
=========================================================== */
var TRIGGER_LOG_KEY = "craving:triggers";
var TRIGGER_TAGS = [
  "Stress", "Boredom", "Loneliness", "Conflict / argument", "Celebration or party",
  "Payday", "A specific person", "A specific place", "Poor sleep",
  "Anniversary / holiday", "Seeing others use", "Physical pain"
];

function renderTriggerLogForm(t) {
  var selected = {};
  var severity = { v: 5 };

  var chipHolder = el("div");
  function refreshChips() {
    chipHolder.innerHTML = "";
    var row = el("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } });
    TRIGGER_TAGS.forEach(function(tag) {
      var active = !!selected[tag];
      row.appendChild(el("button", {
        type: "button",
        onclick: function() { selected[tag] = !selected[tag]; refreshChips(); },
        style: {
          background: active ? t.primary : t.bgSoft, color: active ? t.primaryText : t.text,
          border: "1px solid " + (active ? t.primary : t.border), borderRadius: "999px",
          padding: "7px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer"
        }
      }, [tag]));
    });
    chipHolder.appendChild(row);
  }
  refreshChips();

  var customInput = el("input", {
    placeholder: "Something else? Add your own (optional)",
    style: { width: "100%", marginTop: "10px", background: t.bgSoft, color: t.text, border: "1px solid " + t.border, borderRadius: "10px", padding: "10px", fontSize: "14px", boxSizing: "border-box" }
  });
  var noteInput = el("textarea", {
    rows: "2", placeholder: "Anything else worth noting? (optional)",
    style: { width: "100%", marginTop: "10px", background: t.bgSoft, color: t.text, border: "1px solid " + t.border, borderRadius: "10px", padding: "10px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }
  });

  var warnDiv = el("div", { style: { color: t.accent, fontSize: "12px", marginTop: "8px", display: "none" } },
    ["Pick at least one trigger, add your own, or leave a note before logging."]);

  return card(t, [
    el("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" } }, [
      el("span", { style: { fontSize: "20px" } }, ["🚩"]),
      el("div", { style: { fontFamily: t.display, fontWeight: "800", fontSize: "16px", color: t.text } }, ["Triggers & warning signs"])
    ]),
    el("div", { style: { fontSize: "12px", color: t.textMuted, marginBottom: "12px" } },
      ["Notice something pulling at you today, even if you didn't act on it? Log it here — patterns get easier to spot over time."]),
    chipHolder,
    customInput,
    el("div", { style: { marginTop: "16px" } }, [sectionLabel(t, "How strong was the pull, 1–10?")]),
    intensitySlider(t, 5, function(v) { severity.v = v; }),
    noteInput,
    warnDiv,
    el("div", { style: { marginTop: "14px" } }, [
      primaryButton(t, "Log this", function() {
        var tags = Object.keys(selected).filter(function(k) { return selected[k]; });
        if (customInput.value.trim()) tags.push(customInput.value.trim());
        var note = noteInput.value.trim();
        if (tags.length === 0 && !note) {
          warnDiv.style.display = "block";
          return;
        }
        var log = readLS(TRIGGER_LOG_KEY, []);
        log.push({ date: dateKey(new Date()), tags: tags, severity: severity.v, note: note });
        writeLS(TRIGGER_LOG_KEY, log);
        render();
      })
    ])
  ]);
}

function renderTriggerLogHistory(t) {
  var log = readLS(TRIGGER_LOG_KEY, []);
  if (log.length === 0) return null;

  var tally = {};
  log.forEach(function(e) { (e.tags || []).forEach(function(tag) { tally[tag] = (tally[tag] || 0) + 1; }); });
  var topTags = Object.keys(tally).sort(function(a, b) { return tally[b] - tally[a]; }).slice(0, 5);

  var wrap = el("div", { style: { marginTop: "20px" } });
  if (topTags.length > 0) {
    wrap.appendChild(sectionLabel(t, "Your most common triggers"));
    var tallyRow = el("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" } });
    topTags.forEach(function(tag) {
      tallyRow.appendChild(el("div", {
        style: { background: t.cardAlt, border: "1px solid " + t.border, borderRadius: "999px", padding: "7px 12px", fontSize: "12px", fontWeight: "700", color: t.text }
      }, [tag + " · " + tally[tag]]));
    });
    wrap.appendChild(tallyRow);
  }

  wrap.appendChild(sectionLabel(t, "Recent log"));
  log.slice(-8).reverse().forEach(function(e) {
    wrap.appendChild(card(t, [
      el("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "4px" } }, [
        el("div", { style: { fontWeight: "800", fontSize: "13px", color: t.secondary } }, [e.date]),
        el("div", { style: { fontWeight: "800", fontSize: "13px", color: t.text } }, ["Pull: " + e.severity + "/10"])
      ]),
      (e.tags && e.tags.length) ? el("div", { style: { fontSize: "12px", color: t.textMuted } }, [e.tags.join(", ")]) : null,
      e.note ? el("div", { style: { fontSize: "13px", color: t.text, marginTop: "6px" } }, [e.note]) : null
    ], { marginBottom: "10px" }));
  });
  return wrap;
}

function renderCravingTab(t) {
  var wrap = el("div");
  wrap.appendChild(el("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" } }, [
    el("span", { style: { fontSize: "22px" } }, ["🌊"]),
    el("h2", { style: { fontFamily: t.display, fontSize: "22px", margin: "0", color: t.text } }, ["Ride the Wave"])
  ]));
  wrap.appendChild(el("p", { style: { color: t.textMuted, fontSize: "14px", marginTop: "4px", marginBottom: "18px" } },
    ["A guided timer for riding out a craving instead of acting on it."]));

  if (!cravingSession || cravingSession.phase === "setup") {
    wrap.appendChild(renderCravingSetup(t));
    var stats = cravingStats(t);
    if (stats) wrap.appendChild(stats);
    wrap.appendChild(el("div", { style: { marginTop: "26px" } }, [renderTriggerLogForm(t)]));
    var triggerHistory = renderTriggerLogHistory(t);
    if (triggerHistory) wrap.appendChild(triggerHistory);
  } else if (cravingSession.phase === "active") {
    wrap.appendChild(renderCravingActive(t));
  } else {
    wrap.appendChild(renderCravingCheckin(t));
  }

  return wrap;
}

/* ===========================================================
   CONTROL TAB
   Ported from Groundwork's "Skills" view: a checklist of things
   within your control, and a "Right now" circle-of-control scale
   that surfaces an encouraging quote based on where you tap.
=========================================================== */
function renderControlTab(t) {
  var wrap = el("div");
  wrap.appendChild(el("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" } }, [
    el("span", { style: { fontSize: "22px" } }, ["🧭"]),
    el("h2", { style: { fontFamily: t.display, fontSize: "22px", margin: "0", color: t.text } }, ["What I Can Control"])
  ]));
  wrap.appendChild(el("p", { style: { color: t.textMuted, fontSize: "14px", marginTop: "4px", marginBottom: "18px" } },
    ["Somewhere to put your focus when everything else feels like too much."]));

  /* ---- 50 things I can control ---- */
  var controlChecked = readLS("control:checklist", {});
  var controlProgressLabel = el("div", { style: { fontSize: "12px", color: t.textMuted, fontWeight: "700", marginBottom: "10px" } });
  var controlProgressTrack = el("div", { style: { height: "6px", borderRadius: "999px", background: t.bgSoft, overflow: "hidden", marginBottom: "14px" } });
  var controlProgressFill = el("div", { style: { height: "100%", borderRadius: "999px", background: t.secondary, width: "0%", transition: "width 0.3s ease" } });
  controlProgressTrack.appendChild(controlProgressFill);
  function updateControlProgress() {
    var done = CONTROL_ITEMS.reduce(function(n, item, i) { return n + (controlChecked[i] ? 1 : 0); }, 0);
    controlProgressLabel.textContent = done + " of " + CONTROL_ITEMS.length + " checked";
    controlProgressFill.style.width = Math.round((done / CONTROL_ITEMS.length) * 100) + "%";
  }
  updateControlProgress();

  var controlList = el("div");
  CONTROL_ITEMS.forEach(function(text, i) {
    if (CONTROL_CATEGORY_BREAKS[i]) {
      controlList.appendChild(el("div", {
        style: { fontFamily: t.display, fontWeight: "800", fontSize: "12px", letterSpacing: "0.8px", textTransform: "uppercase", color: t.textMuted, margin: i === 0 ? "0 2px 10px" : "18px 2px 10px" }
      }, [CONTROL_CATEGORY_BREAKS[i]]));
    }
    var cb = el("input", { type: "checkbox" });
    cb.checked = !!controlChecked[i];
    cb.style.marginRight = "10px";
    cb.style.width = "16px";
    cb.style.height = "16px";
    cb.style.flexShrink = "0";
    cb.addEventListener("change", function() {
      controlChecked[i] = cb.checked;
      writeLS("control:checklist", controlChecked);
      updateControlProgress();
    });
    controlList.appendChild(el("label", {
      style: { display: "flex", alignItems: "center", padding: "6px 4px", cursor: "pointer" }
    }, [cb, el("span", { style: { fontSize: "14px", color: t.text } }, [text])]));
  });

  var controlResetBtn = el("button", {
    type: "button",
    onclick: function() {
      controlChecked = {};
      writeLS("control:checklist", controlChecked);
      controlList.querySelectorAll("input[type=checkbox]").forEach(function(cb) { cb.checked = false; });
      updateControlProgress();
    },
    style: { border: "1px solid " + t.border, background: t.cardAlt, color: t.text, borderRadius: "10px", padding: "8px 14px", fontWeight: "700", fontSize: "12.5px", cursor: "pointer" }
  }, ["Reset"]);

  wrap.appendChild(card(t, [
    sectionLabel(t, "50 things I can control"),
    el("p", { style: { fontSize: "13px", color: t.textMuted, marginTop: "-4px", marginBottom: "4px" } }, ["What to focus on right now, when everything else feels like too much."]),
    controlProgressLabel, controlProgressTrack,
    controlList,
    el("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: "12px" } }, [controlResetBtn])
  ], { marginBottom: "14px" }));

  /* ---- right now: circle-of-control scale, with a quote on tap ---- */
  var controlScale = readLS("control:scale", null);
  var scaleQuote = el("div", {
    style: {
      display: controlScale ? "block" : "none", fontFamily: t.display, fontStyle: "italic", fontWeight: "700",
      fontSize: "14px", lineHeight: "1.4", color: t.text, background: t.bgSoft, borderRadius: "12px",
      padding: "12px 14px", marginTop: "12px"
    }
  }, [controlScale ? (controlScale <= 5 ? CONTROL_QUOTES_AGENCY[0] : CONTROL_QUOTES_UPLIFT[0]) : ""]);
  var scaleGrid = el("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginTop: "6px" } });
  for (var scaleN = 1; scaleN <= 10; scaleN++) {
    (function(n) {
      var btn = el("button", {
        type: "button",
        style: {
          padding: "12px 0", borderRadius: "10px", border: "1px solid " + (controlScale === n ? t.primary : t.border),
          background: controlScale === n ? t.primary : t.bgSoft, color: controlScale === n ? t.primaryText : t.text,
          fontWeight: "800", fontSize: "14px", cursor: "pointer"
        }
      }, [String(n)]);
      btn.addEventListener("click", function() {
        controlScale = n;
        writeLS("control:scale", controlScale);
        Array.prototype.forEach.call(scaleGrid.children, function(b) {
          b.style.background = t.bgSoft; b.style.color = t.text; b.style.borderColor = t.border;
        });
        btn.style.background = t.primary; btn.style.color = t.primaryText; btn.style.borderColor = t.primary;

        var pool = n <= 5 ? CONTROL_QUOTES_AGENCY : CONTROL_QUOTES_UPLIFT;
        scaleQuote.textContent = pool[Math.floor(Math.random() * pool.length)];
        scaleQuote.style.display = "block";
      });
      scaleGrid.appendChild(btn);
    })(scaleN);
  }

  wrap.appendChild(card(t, [
    sectionLabel(t, "Right now"),
    el("div", { style: { fontFamily: t.display, fontWeight: "800", fontSize: "15px", color: t.text, marginBottom: "2px" } }, ["How much control do I have?"]),
    el("p", { style: { fontSize: "13px", color: t.textMuted, marginBottom: "4px" } }, ["Tap the number that fits this situation."]),
    scaleGrid,
    el("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "11px", color: t.textMuted, fontWeight: "700", marginTop: "6px" } }, [
      el("span", {}, ["Can control"]), el("span", {}, ["Can't control"])
    ]),
    scaleQuote
  ]));

  return wrap;
}

/* ===========================================================
   JOURNAL TAB
=========================================================== */
function renderJournalTab(t) {
  var today = new Date();
  var key = "journal:" + dateKey(today);
  var doy = dayOfYear(today) % TOPIC_DECK.length;
  var topicObj = TOPIC_DECK[doy];
  var entry = readLS(key, { mode: "topic", text: "" });

  var wrap = el("div");
  wrap.appendChild(el("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" } }, [
    el("span", { style: { fontSize: "22px" } }, ["\uD83C\uDF19"]),
    el("h2", { style: { fontFamily: t.display, fontSize: "22px", margin: "0", color: t.text } }, ["Nightly Journal"])
  ]));
  wrap.appendChild(el("p", { style: { color: t.textMuted, fontSize: "14px", marginTop: "4px", marginBottom: "16px" } },
    ["Reflect on your day \u2014 freestyle, or use today's prompt. A new topic every day, all year."]));

  var topicCardHolder = el("div");
  var textarea = el("textarea", {
    rows: "8",
    style: { width: "100%", background: t.bgSoft, color: t.text, border: "1px solid " + t.border, borderRadius: "10px", padding: "12px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }
  });

  function updateTopicVisibility() {
    topicCardHolder.innerHTML = "";
    textarea.placeholder = entry.mode === "topic" ? "Write your reflection here..." : "Write freely about your day...";
    if (entry.mode === "topic") {
      topicCardHolder.appendChild(card(t, [
        el("div", { style: { fontSize: "11px", fontWeight: "800", color: t.secondary, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" } }, [topicObj.category + " \u00B7 Day " + (doy + 1) + " of 366"]),
        el("div", { style: { fontFamily: t.display, fontSize: "17px", color: t.text, fontWeight: "700" } }, [topicObj.text])
      ], { marginBottom: "14px", background: t.cardAlt }));
    }
  }

  var btnTopic = el("button", {
    onclick: function() { entry.mode = "topic"; refreshModeButtons(); updateTopicVisibility(); },
    style: { flex: "1", padding: "10px 12px", borderRadius: "10px", border: "1px solid " + t.border, cursor: "pointer", fontWeight: "700", fontSize: "13px" }
  }, ["Today's Topic"]);
  var btnFree = el("button", {
    onclick: function() { entry.mode = "freestyle"; refreshModeButtons(); updateTopicVisibility(); },
    style: { flex: "1", padding: "10px 12px", borderRadius: "10px", border: "1px solid " + t.border, cursor: "pointer", fontWeight: "700", fontSize: "13px" }
  }, ["Freestyle"]);
  function refreshModeButtons() {
    btnTopic.style.background = entry.mode === "topic" ? t.primary : t.cardAlt;
    btnTopic.style.color = entry.mode === "topic" ? t.primaryText : t.text;
    btnFree.style.background = entry.mode === "freestyle" ? t.primary : t.cardAlt;
    btnFree.style.color = entry.mode === "freestyle" ? t.primaryText : t.text;
  }
  refreshModeButtons();

  wrap.appendChild(el("div", { style: { display: "flex", gap: "8px", marginBottom: "16px" } }, [btnTopic, btnFree]));
  wrap.appendChild(topicCardHolder);
  updateTopicVisibility();

  textarea.value = entry.text;
  wrap.appendChild(card(t, [textarea]));

  var flashSpan = el("span", { style: { color: t.secondary, fontWeight: "700", fontSize: "13px", display: "none" } }, ["\u2713 Saved"]);
  wrap.appendChild(el("div", { style: { marginTop: "14px", display: "flex", alignItems: "center", gap: "12px" } }, [
    primaryButton(t, "Save entry", function() {
      entry.text = textarea.value;
      writeLS(key, entry);
      if (entry.text.trim()) recordStatDate("stats:journalDates", dateKey(today));
      flashSpan.style.display = "inline";
      setTimeout(function() { flashSpan.style.display = "none"; }, 1800);
    }),
    flashSpan
  ]));

  var pastKeys = listLS("journal:").filter(function(k) { return k !== key; }).sort();
  pastKeys = pastKeys.slice(Math.max(0, pastKeys.length - 7));
  if (pastKeys.length > 0) {
    wrap.appendChild(el("div", { style: { marginTop: "26px" } }, [sectionLabel(t, "Past entries")]));
    pastKeys.slice().reverse().forEach(function(k) {
      var h = readLS(k, { text: "" });
      wrap.appendChild(card(t, [
        el("div", { style: { fontWeight: "800", fontSize: "13px", color: t.secondary, marginBottom: "6px" } }, [k.replace("journal:", "")]),
        el("div", { style: { fontSize: "13px", color: t.text, whiteSpace: "pre-wrap" } }, [h.text || "(no entry text)"])
      ], { marginBottom: "10px" }));
    });
  }

  return wrap;
}

/* ===========================================================
   RESOURCES TAB
=========================================================== */
function renderResourcesTab(t) {
  var wrap = el("div");
  wrap.appendChild(el("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" } }, [
    el("span", { style: { fontSize: "22px" } }, ["\uD83D\uDCCD"]),
    el("h2", { style: { fontFamily: t.display, fontSize: "22px", margin: "0", color: t.text } }, ["Find Local Resources"])
  ]));
  wrap.appendChild(el("p", { style: { color: t.textMuted, fontSize: "14px", marginTop: "4px", marginBottom: "16px" } },
    ["Enter your zip code, then tap a category to open the right locator for your area."]));

  var zipRow = el("div", { style: { display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" } });
  var zipInput = el("input", {
    placeholder: "Zip code", inputmode: "numeric",
    style: { flex: "1 1 140px", minWidth: "0", background: t.card, color: t.text, border: "1px solid " + t.border, borderRadius: "12px", padding: "14px", fontSize: "16px", fontWeight: "700", boxSizing: "border-box" }
  });
  var locBtn = el("button", {
    type: "button",
    style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", flex: "1 1 140px", minWidth: "0", background: t.cardAlt, color: t.text, border: "1px solid " + t.border, borderRadius: "12px", padding: "12px 14px", fontSize: "13px", fontWeight: "800", cursor: "pointer", whiteSpace: "nowrap", boxSizing: "border-box" }
  }, ["\uD83D\uDCCD Use my location"]);
  zipRow.appendChild(zipInput);
  zipRow.appendChild(locBtn);
  wrap.appendChild(zipRow);

  var locStatus = el("div", { style: { fontSize: "12px", color: t.textMuted, marginBottom: "14px", display: "none" } });
  wrap.appendChild(locStatus);

  locBtn.addEventListener("click", function() {
    if (!("geolocation" in navigator)) {
      locStatus.style.display = "block";
      locStatus.style.color = t.accent;
      locStatus.textContent = "Location isn't available in this browser. Enter your zip code manually.";
      return;
    }
    locBtn.disabled = true;
    locBtn.style.opacity = "0.6";
    locStatus.style.display = "block";
    locStatus.style.color = t.textMuted;
    locStatus.textContent = "Finding your zip code\u2026";

    navigator.geolocation.getCurrentPosition(function(pos) {
      var lat = pos.coords.latitude, lon = pos.coords.longitude;
      fetch("https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" + lat + "&lon=" + lon + "&zoom=16&addressdetails=1")
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var z = data && data.address && data.address.postcode ? data.address.postcode.replace(/\D/g, "").slice(0, 5) : "";
          if (/^\d{5}$/.test(z)) {
            zipInput.value = z;
            updateEnabled();
            locStatus.textContent = "Zip code set from your location.";
            locStatus.style.color = t.textMuted;
          } else {
            locStatus.textContent = "Couldn't determine a zip code from your location. Enter it manually.";
            locStatus.style.color = t.accent;
          }
        })
        .catch(function() {
          locStatus.textContent = "Couldn't look up your zip code. Enter it manually.";
          locStatus.style.color = t.accent;
        })
        .finally(function() {
          locBtn.disabled = false;
          locBtn.style.opacity = "1";
        });
    }, function(err) {
      locBtn.disabled = false;
      locBtn.style.opacity = "1";
      locStatus.textContent = err && err.code === 1
        ? "Location access was denied. You can enable it in your browser settings, or enter your zip code manually."
        : "Couldn't get your location. Enter your zip code manually.";
      locStatus.style.color = t.accent;
    }, { enableHighAccuracy: false, timeout: 10000 });
  });

  var warnDiv = el("div", { style: { color: t.accent, fontSize: "12px", marginTop: "-12px", marginBottom: "14px", display: "none" } }, ["Enter a 5-digit zip code."]);
  wrap.appendChild(warnDiv);

  // Online AA meetings, sorted by language (real per-language directories)
  // and, once there, filterable by day and time on the page itself.
  var AA_ONLINE_LANGUAGES = [
    { label: "English", url: "https://aa-intergroup.org/meetings/" },
    { label: "Espa\u00f1ol", url: "https://aa-intergroup.org/es/directorio-de-reuniones/" },
    { label: "Fran\u00e7ais", url: "https://aa-intergroup.org/fr/repertoire-des-reunions/" },
    { label: "Portugu\u00eas", url: "https://aa-intergroup.org/pt-br/diretorio-de-reunioes/" },
    { label: "Italiano", url: "https://aa-intergroup.org/it/elenco-riunioni/" },
    { label: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439", url: "https://aa-intergroup.org/ru/%d0%ba%d0%b0%d1%82%d0%b0%d0%bb%d0%be%d0%b3-%d1%81%d0%be%d0%b1%d1%80%d0%b0%d0%bd%d0%b8%d0%b9/" },
    { label: "\u4e2d\u6587", url: "https://aa-intergroup.org/zh-hans/%e4%bc%9a%e8%ae%ae%e7%9b%ae%e5%bd%95/" },
    { label: "\u65e5\u672c\u8a9e", url: "https://aa-intergroup.org/ja/%e3%83%9f%e3%83%bc%e3%83%86%e3%82%a3%e3%83%b3%e3%82%b0%e3%83%87%e3%82%a3%e3%83%ac%e3%82%af%e3%83%88%e3%83%aa/" },
    { label: "\u0641\u0627\u0631\u0633\u06cc", url: "https://aa-intergroup.org/fa/%d9%81%d9%87%d8%b1%d8%b3%d8%aa-%d8%ac%d9%84%d8%b3%d8%a7%d8%aa/" }
  ];
  var aaChipRow = el("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } });
  AA_ONLINE_LANGUAGES.forEach(function(lang) {
    aaChipRow.appendChild(el("button", {
      type: "button",
      onclick: function() { window.open(lang.url, "_blank"); },
      style: { background: t.cardAlt, color: t.text, border: "1px solid " + t.border, borderRadius: "999px", padding: "8px 14px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }
    }, [lang.label]));
  });
  wrap.appendChild(card(t, [
    el("div", { style: { fontWeight: "800", fontSize: "14px", color: t.text, marginBottom: "2px" } }, ["AA Meetings \u2014 Online"]),
    el("div", { style: { fontSize: "12px", color: t.textMuted, marginBottom: "12px" } }, ["Pick a language to open the Online Intergroup's meeting directory. Once there, filter further by day and time using the site's own filters."]),
    aaChipRow
  ], { marginBottom: "14px" }));

  var grid = el("div", { style: { display: "grid", gap: "10px" } });
  var buttons = [];
  RESOURCE_CATEGORIES.forEach(function(cat) {
    var btn = el("button", {
      onclick: function() {
        var z = zipInput.value.replace(/\D/g, "").slice(0, 5);
        if (cat.always || /^\d{5}$/.test(z)) window.open(cat.url(z), "_blank");
      },
      style: { display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", background: t.card, border: "1px solid " + t.border, borderRadius: "14px", padding: "14px", cursor: "pointer", width: "100%" }
    }, [
      el("div", {}, [
        el("div", { style: { fontWeight: "800", fontSize: "14px", color: t.text } }, [cat.label]),
        el("div", { style: { fontSize: "12px", color: t.textMuted, marginTop: "2px" } }, [cat.desc])
      ]),
      el("span", { style: { color: t.secondary, marginLeft: "10px" } }, ["\u2197"])
    ]);
    buttons.push({ btn: btn, cat: cat });
    grid.appendChild(btn);
  });
  wrap.appendChild(grid);

  function updateEnabled() {
    var z = zipInput.value.replace(/\D/g, "").slice(0, 5);
    var valid = /^\d{5}$/.test(z);
    warnDiv.style.display = (!valid && z.length > 0) ? "block" : "none";
    buttons.forEach(function(b) {
      var enabled = b.cat.always || valid;
      b.btn.style.opacity = enabled ? "1" : "0.5";
      b.btn.style.cursor = enabled ? "pointer" : "not-allowed";
    });
  }
  zipInput.addEventListener("input", function() {
    zipInput.value = zipInput.value.replace(/\D/g, "").slice(0, 5);
    updateEnabled();
  });
  updateEnabled();

  wrap.appendChild(el("div", { style: { fontSize: "11px", color: t.textMuted, marginTop: "18px", lineHeight: "1.5" } },
    ["These links open trusted national directories (988, findtreatment.gov, 211, HUD, Feeding America, CareerOneStop, HRSA). Availability and accuracy of listed services depend on those organizations."]));

  return wrap;
}

/* ===========================================================
   DATA EXPORT / IMPORT
   Everything lives in localStorage only — no account, no server — so
   losing the browser (cache clear, new device) means losing months of
   entries. Export bundles every Anchorpoint key into one JSON file the
   user can save anywhere; import restores it, replacing what's on the
   device.
=========================================================== */
function exportAllData() {
  var payload = { app: "anchorpoint", version: 1, exportedAt: new Date().toISOString(), data: {} };
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    payload.data[k] = localStorage.getItem(k);
  }
  var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var a = el("a", { href: url, download: "anchorpoint-backup-" + dateKey(new Date()) + ".json" });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
}
// Persists a status message across the render() the settings tab triggers
// right after an action (import, reminder permission issues, etc.) — a
// message set on the current DOM node would be destroyed by that render()
// before it was ever seen, so it lives here instead and gets read back out
// by renderSettingsTab.
var settingsFlash = null;
function showSettingsFlash(color, text) {
  settingsFlash = { color: color, text: text };
  render();
  var thisFlash = settingsFlash;
  setTimeout(function() {
    if (settingsFlash === thisFlash) { settingsFlash = null; if (state.tab === "settings") render(); }
  }, 4000);
}

function importAllData(file, onDone) {
  var reader = new FileReader();
  reader.onload = function() {
    var parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch (e) {
      onDone(false, "That file doesn't look like a valid Anchorpoint backup.");
      return;
    }
    if (!parsed || typeof parsed.data !== "object" || parsed.data === null) {
      onDone(false, "That file doesn't look like a valid Anchorpoint backup.");
      return;
    }
    var keys = Object.keys(parsed.data);
    if (keys.length === 0) {
      onDone(false, "That backup file is empty.");
      return;
    }
    if (!window.confirm("Importing will replace all Anchorpoint data currently on this device (" + keys.length + " item" + (keys.length === 1 ? "" : "s") + " in this backup). This can't be undone. Continue?")) {
      onDone(false, null);
      return;
    }
    localStorage.clear();
    keys.forEach(function(k) { localStorage.setItem(k, parsed.data[k]); });
    onDone(true, null);
  };
  reader.onerror = function() { onDone(false, "Couldn't read that file."); };
  reader.readAsText(file);
}

/* ===========================================================
   DAILY REMINDERS
   No server means no push notifications — this uses the plain
   Notification API, checked on a timer while the app is open (including
   backgrounded browser tabs). It won't fire once the browser is fully
   closed; that's an honest limitation of a static, backend-free app, not
   something worth overpromising in the UI copy below.
=========================================================== */
var REMINDERS_KEY = "settings:reminders";
function defaultReminders() {
  return {
    morning: { enabled: false, time: "08:00", lastFired: "" },
    evening: { enabled: false, time: "20:00", lastFired: "" }
  };
}
function notificationsSupported() { return "Notification" in window; }

function checkReminders() {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  var reminders = readLS(REMINDERS_KEY, null);
  if (!reminders) return;
  var now = new Date();
  var todayKey = dateKey(now);
  var hhmm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  var changed = false;

  function maybeFire(cfg, title, body, alreadyDone) {
    if (!cfg || !cfg.enabled || !cfg.time) return;
    if (cfg.lastFired === todayKey) return;
    if (hhmm < cfg.time) return;
    if (!alreadyDone()) {
      try {
        var n = new Notification(title, { body: body, icon: "icon-192.png", tag: "anchorpoint-" + title });
        n.onclick = function() { window.focus(); n.close(); };
      } catch (e) {}
    }
    cfg.lastFired = todayKey;
    changed = true;
  }

  maybeFire(reminders.morning, "Morning gratitude ☀️", "Take a minute for today's gratitude in Anchorpoint.", function() {
    return readLS("stats:gratitudeDates", []).indexOf(todayKey) !== -1;
  });
  maybeFire(reminders.evening, "Evening reflection 🌙", "How was today? Your journal is ready when you are.", function() {
    return readLS("stats:journalDates", []).indexOf(todayKey) !== -1;
  });

  if (changed) writeLS(REMINDERS_KEY, reminders);
}

function toggleSwitch(t, on, onClick) {
  return el("button", {
    type: "button",
    onclick: onClick,
    style: {
      width: "44px", height: "26px", borderRadius: "999px", border: "none", cursor: "pointer",
      background: on ? t.primary : t.border, position: "relative", flexShrink: "0", padding: "0"
    }
  }, [
    el("span", { style: { position: "absolute", top: "3px", left: on ? "21px" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "left 0.15s" } })
  ]);
}

function reminderRow(t, reminders, key, icon, label, description) {
  var cfg = reminders[key];

  var timeInput = el("input", {
    type: "time",
    style: {
      background: t.bgSoft, color: t.text, border: "1px solid " + t.border, borderRadius: "10px",
      padding: "8px 10px", fontSize: "14px", opacity: cfg.enabled ? "1" : "0.5"
    }
  });
  timeInput.value = cfg.time;
  timeInput.disabled = !cfg.enabled;
  timeInput.addEventListener("change", function() {
    cfg.time = timeInput.value || cfg.time;
    cfg.lastFired = ""; // a new time today should still fire today if it's due
    writeLS(REMINDERS_KEY, reminders);
  });

  var switchBtn = toggleSwitch(t, cfg.enabled, function() {
    if (cfg.enabled) {
      cfg.enabled = false;
      writeLS(REMINDERS_KEY, reminders);
      render();
      return;
    }
    if (!notificationsSupported()) {
      showSettingsFlash("accent", "Notifications aren't supported in this browser.");
      return;
    }
    if (Notification.permission === "denied") {
      showSettingsFlash("accent", "Notifications are blocked for this site — enable them in your browser settings first.");
      return;
    }
    if (Notification.permission === "granted") {
      cfg.enabled = true;
      cfg.lastFired = "";
      writeLS(REMINDERS_KEY, reminders);
      render();
      return;
    }
    Notification.requestPermission().then(function(perm) {
      if (perm === "granted") {
        cfg.enabled = true;
        cfg.lastFired = "";
        writeLS(REMINDERS_KEY, reminders);
        render();
      } else {
        showSettingsFlash("accent", "Notification permission wasn't granted, so this reminder is off.");
      }
    });
  });

  return card(t, [
    el("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" } }, [
      el("div", { style: { display: "flex", alignItems: "center", gap: "10px" } }, [
        el("span", { style: { fontSize: "20px" } }, [icon]),
        el("div", {}, [
          el("div", { style: { fontFamily: t.display, fontWeight: "800", fontSize: "14px", color: t.text } }, [label]),
          el("div", { style: { fontSize: "12px", color: t.textMuted, marginTop: "2px" } }, [description])
        ])
      ]),
      switchBtn
    ]),
    el("div", { style: { marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" } }, [
      el("span", { style: { fontSize: "12px", color: t.textMuted, fontWeight: "700" } }, ["Remind me at"]),
      timeInput
    ])
  ], { marginBottom: "12px" });
}

/* ===========================================================
   SETTINGS TAB
=========================================================== */
function renderSettingsTab(t) {
  var wrap = el("div");
  wrap.appendChild(el("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" } }, [
    el("span", { style: { fontSize: "22px" } }, ["\u2699\uFE0F"]),
    el("h2", { style: { fontFamily: t.display, fontSize: "22px", margin: "0", color: t.text } }, ["Settings"])
  ]));

  var themeSection = el("div", { style: { marginTop: "20px" } }, [sectionLabel(t, "Color theme")]);
  var grid = el("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" } });
  Object.keys(THEMES).forEach(function(k) {
    var tt = THEMES[k];
    var selected = state.theme === k;
    var swatch = el("div", { style: { display: "flex", gap: "4px", marginBottom: "8px" } }, [
      el("span", { style: { width: "14px", height: "14px", borderRadius: "99px", background: tt.primary, display: "inline-block" } }),
      el("span", { style: { width: "14px", height: "14px", borderRadius: "99px", background: tt.secondary, display: "inline-block" } }),
      el("span", { style: { width: "14px", height: "14px", borderRadius: "99px", background: tt.accent, display: "inline-block" } })
    ]);
    var btn = el("button", {
      onclick: function() { state.theme = k; writeLS("settings:theme", k); render(); },
      style: { border: selected ? "2px solid " + t.primary : "1px solid " + t.border, borderRadius: "14px", padding: "12px", background: tt.bg, cursor: "pointer", textAlign: "left" }
    }, [swatch, el("div", { style: { fontSize: "13px", fontWeight: "800", color: tt.text, fontFamily: tt.display } }, [tt.name])]);
    grid.appendChild(btn);
  });
  themeSection.appendChild(grid);
  wrap.appendChild(themeSection);

  var reminders = readLS(REMINDERS_KEY, defaultReminders());
  var remindersSection = el("div", { style: { marginTop: "24px" } }, [
    sectionLabel(t, "Daily reminders"),
    el("div", { style: { fontSize: "12px", color: t.textMuted, marginBottom: "12px" } },
      ["Reminders fire while Anchorpoint is open in a browser tab, including in the background. There's no server here, so a plain web app can't schedule a notification for after the browser is fully closed — keeping a tab open (or checking in around these times) is the most reliable way to get them for now."]),
    reminderRow(t, reminders, "morning", "☀️", "Morning gratitude", "A nudge to write today's gratitude, skipped if you've already saved one."),
    reminderRow(t, reminders, "evening", "🌙", "Evening reflection", "A nudge to journal, skipped if you've already saved an entry today.")
  ]);
  wrap.appendChild(remindersSection);

  // render() below rebuilds the whole tab (fresh DOM, including a new
  // importStatus node), so a message set on the *current* node and
  // followed by render() would be destroyed before ever being seen. Keep
  // it in a module-level var that survives the re-render and gets read
  // back out below instead.
  var importStatus = el("div", {
    style: { fontSize: "12px", marginTop: "10px", display: settingsFlash ? "block" : "none", color: settingsFlash ? t[settingsFlash.color] : t.text }
  }, [settingsFlash ? settingsFlash.text : ""]);
  var fileInput = el("input", { type: "file", accept: "application/json", style: { display: "none" } });
  fileInput.addEventListener("change", function() {
    var file = fileInput.files && fileInput.files[0];
    fileInput.value = "";
    if (!file) return;
    importAllData(file, function(success, errorMsg) {
      if (success) {
        state.theme = readLS("settings:theme", "anchorpoint");
        cravingSession = null;
        showSettingsFlash("secondary", "Backup imported. Your data has been restored.");
      } else if (errorMsg) {
        showSettingsFlash("accent", errorMsg);
      }
      // else: user cancelled the confirm — nothing changed, no flash
    });
  });
  var dataCard = card(t, [
    el("div", { style: { fontSize: "13px", color: t.text, marginBottom: "12px" } },
      ["Everything you write — gratitude, journal entries, sobriety dates, urge logs — lives only in this browser. Export a backup regularly, especially before switching devices or clearing your browser data."]),
    el("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap" } }, [
      primaryButton(t, "⬇️ Export backup", exportAllData),
      el("button", {
        onclick: function() { fileInput.click(); },
        style: { background: t.bgSoft, color: t.text, border: "1px solid " + t.border, borderRadius: "12px", padding: "12px 18px", fontWeight: "700", fontSize: "14px", cursor: "pointer" }
      }, ["⬆️ Import backup"])
    ]),
    fileInput,
    importStatus
  ]);
  wrap.appendChild(el("div", { style: { marginTop: "24px" } }, [sectionLabel(t, "Your data"), dataCard]));

  var feedbackCard = card(t, [
    el("div", { style: { fontSize: "13px", color: t.text, marginBottom: "10px" } }, ["This app is in beta. Found a bug or have an idea? We'd love to hear it."]),
    el("a", { href: "mailto:sdangler99@gmail.com?subject=Beta%20feedback", style: { display: "inline-flex", alignItems: "center", gap: "8px", color: t.primaryText, background: t.primary, padding: "10px 16px", borderRadius: "10px", fontWeight: "700", fontSize: "13px" } }, ["\u2709\uFE0F Email feedback"])
  ]);
  wrap.appendChild(el("div", { style: { marginTop: "24px" } }, [sectionLabel(t, "Beta feedback"), feedbackCard]));

  wrap.appendChild(el("div", { style: { marginTop: "24px", textAlign: "center", color: t.textMuted, fontSize: "12px" } }, [
    "Built by ",
    el("span", { style: { fontWeight: "800", color: t.text } }, ["Steve Dangler"]),
    el("div", { style: { marginTop: "4px" } }, ["Beta \u2014 your feedback shapes what this becomes."])
  ]));

  return wrap;
}

/* ===========================================================
   BOOT
=========================================================== */
render();
checkReminders();
setInterval(checkReminders, 60 * 1000);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("service-worker.js").catch(function (err) {
      console.warn("Service worker registration failed:", err);
    });
  });
}
