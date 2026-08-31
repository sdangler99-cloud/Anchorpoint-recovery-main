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
    journal: renderJournalTab,
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
  { key: "journal", label: "Evening", icon: "\uD83C\uDF19" },
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
  var nav = el("div", {
    style: { background: t.bgSoft, borderTop: "1px solid " + t.border, display: "flex", justifyContent: "space-around", padding: "8px 4px calc(8px + env(safe-area-inset-bottom, 0px))" }
  });
  TABS.forEach(function(tb) {
    var active = state.tab === tb.key;
    var btn = el("button", {
      onclick: function() { state.tab = tb.key; render(); },
      style: { background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "6px 10px", cursor: "pointer", color: active ? t.primary : t.textMuted }
    }, [
      el("span", { style: { fontSize: "18px" } }, [tb.icon]),
      el("span", { style: { fontSize: "10px", fontWeight: "700" } }, [tb.label])
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
var MILESTONES = [
  { label: "1 Day", days: 1 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "60 Days", days: 60 },
  { label: "90 Days", days: 90 },
  { label: "180 Days", days: 180 },
  { label: "1 Year", days: 365 }
];
function renderSobrietyTab(t) {
  var data = readLS("sobriety:tracker", [
    { name: "Alcohol", since: "" }, { name: "Substance 2", since: "" }, { name: "Substance 3", since: "" },
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

        var badgeLabel = el("div", { style: { fontSize: "11px", color: t.textMuted, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "16px", marginBottom: "8px" } }, ["Milestone Awards"]);
        badgesHolder.appendChild(badgeLabel);
        var badgeRow = el("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } });
        var nextMilestone = null;
        MILESTONES.forEach(function(m) {
          var earned = dur.totalDays >= m.days;
          if (!earned && nextMilestone === null) nextMilestone = m;
          badgeRow.appendChild(el("div", {
            style: {
              display: "flex", alignItems: "center", gap: "6px",
              background: earned ? t.primary : t.bgSoft,
              border: "1px solid " + (earned ? t.primary : t.border),
              color: earned ? t.primaryText : t.textMuted,
              borderRadius: "999px", padding: "7px 12px", fontSize: "12px", fontWeight: "800",
              opacity: earned ? "1" : "0.65"
            }
          }, [earned ? "\uD83C\uDFC6 " + m.label : m.label]));
        });
        badgesHolder.appendChild(badgeRow);
        if (nextMilestone) {
          var daysToGo = nextMilestone.days - dur.totalDays;
          badgesHolder.appendChild(el("div", { style: { fontSize: "12px", color: t.textMuted, marginTop: "8px" } },
            [daysToGo + " day" + (daysToGo === 1 ? "" : "s") + " to go until " + nextMilestone.label + "."]));
        } else {
          badgesHolder.appendChild(el("div", { style: { fontSize: "12px", color: t.secondary, fontWeight: "700", marginTop: "8px" } }, ["All milestones earned \u2014 incredible work."]));
        }
      } else if (dur && dur.invalid) {
        statsHolder.appendChild(el("div", { style: { marginTop: "10px", color: t.accent, fontSize: "12px", fontWeight: "700" } }, ["That date is in the future \u2014 double check it."]));
      }
    }
    dateInput.addEventListener("change", function() {
      data[i].since = dateInput.value;
      writeLS("sobriety:tracker", data);
      renderStats();
    });
    renderStats();

    wrap.appendChild(card(t, [
      nameInput,
      el("label", { style: { fontSize: "12px", color: t.textMuted, fontWeight: "700" } }, ["Clean since (month / day / year)"]),
      dateInput,
      statsHolder,
      badgesHolder
    ], { marginBottom: "14px" }));
  });

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
  var zip = "";
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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("service-worker.js").catch(function (err) {
      console.warn("Service worker registration failed:", err);
    });
  });
}
