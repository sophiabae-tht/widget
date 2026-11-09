// Widget interaction prototype — v2/link (Android Large 360×800)
const phone = document.getElementById("phone");
const appScreen = document.getElementById("appScreen");
const appTitle = document.getElementById("appTitle");
const appBody = document.getElementById("appBody");
const appBack = document.getElementById("appBack");
const flexTile = document.getElementById("flexTile");
const callTile = document.getElementById("callTile");
const toastEl = document.getElementById("toast");

// Destinations the widget deep-links into. html can be a function of how the page was opened.
// Purses as named on the Nations portal (Core App Experience, Figma 6287:23451). Never summed, and
// no total or "N balances" summary on the widget (Molina feedback, 11/5). Members have up to 4.
// short: the portal name, trimmed only where it doesn't fit the widget tile's 2-line label
// (16px semibold, 116px wide with the link-out icon beside line 1). Same words and casing as the portal.
const C = "assets/carehub/";
// Purse detail page (tap a purse on the Flex card page): when the balance resets or expires, how
// it's earned, and where it can be spent.
// PLACEHOLDER COPY: drafted for the 11/10 demo, not confirmed with Molina or Nations. Swap in the
// real wording from Sam / the client before this goes further.
//   expires: the line next to the balance. earn: "How you get it". spend: "Where you can use it" tags.
const NATIONS_PURSES = [
  {
    name: "2026 Health Screening Rewards", short: ["Health", "Screening"], amount: "$375.00",
    icon: "icon-heartbeat.svg", icon16: "icon-gift-16.svg",
    expires: "Expires Dec 31, 2026",
    earn: "Added after you complete a preventive screening, like a mammogram, colon cancer screening, or diabetic eye exam. It can take up to 60 days after your visit to show up.",
    spend: ["Groceries", "Over-the-counter items", "Personal care", "Household essentials"],
  },
  {
    name: "Over the Counter, Food & Produce", short: ["OTC, Food", "& Produce"], amount: "$143.00",
    icon: "icon-basket.svg", icon16: "icon-basket-16.svg",
    expires: "Expires Dec 31, 2026",
    earn: "Part of your plan. It's added to your card at the start of every quarter, and anything you don't use doesn't carry over.",
    spend: ["Fresh produce", "Healthy food", "Over-the-counter medicine", "Vitamins", "First aid"],
  },
  {
    name: "Post Discharge Incentives", short: ["Post", "Discharge"], amount: "$50.00",
    icon: "icon-hospital.svg", icon16: "icon-hospital-16.svg",
    expires: "Expires Dec 31, 2026",
    earn: "Added when you see your doctor for a follow-up visit within 7 days of leaving the hospital.",
    spend: ["Groceries", "Over-the-counter items", "Rides to appointments"],
  },
  {
    name: "Health Risk Assessment Rewards", short: ["Health Risk", "Assessment"], amount: "$25.00",
    icon: "icon-clipboard-text.svg", icon16: "icon-clipboard-text-16.svg",
    expires: "Expires Dec 31, 2026",
    earn: "Added when you complete your yearly Health Risk Assessment, a short survey about your health.",
    spend: ["Groceries", "Over-the-counter items", "Personal care"],
  },
];
// Times follow the viewer's real clock. "Last updated" / "As of" is when the page was opened (when
// the app would fetch the balances), stamped at render: "3:42 PM". The balance's as-of carries the
// date too (Sam, 11/6): "As of Nov 10, 3:42 PM". The status bar ticks separately (see Clock below).
const timeNow = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const balanceAsOf = () => `As of ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeNow()}`;

const pageHeader = (title, body) => `
  <div class="ch-page-header"><h2 class="ch-h2">${title}</h2><p class="ch-body">${body}</p></div>`;
const section = (title) => `<h3 class="ch-section">${title}</h3>`;

// Care hub (Figma 6283:1802) — work-in-progress mock
const CONTACTS = [
  { name: "Member Services", desc: "Call about your health plan", call: true },
  { name: "24/7 Nurse Line", desc: "Talk to a nurse day or night" },
];
const APPS = [
  { name: "My Molina", desc: "See your ID card, benefits, and doctors near you", molina: true },
  { name: "CVS Caremark", desc: "Access prescriptions, compare prices, find pharmacies in one app", img: "app-cvs.webp" },
];
// Resources: skeleton rows until Molina's real resource list is decided.
// Each entry = widths of the title bar and the description lines.
const RESOURCE_SKELETONS = [
  { title: "58%", lines: ["100%", "72%"] },
  { title: "42%", lines: ["84%"] },
  { title: "50%", lines: ["100%", "64%"] },
  { title: "36%", lines: ["90%", "48%"] },
];

const DESTINATIONS = {
  benefits: {
    title: "Your benefits",
    html: () => `
      <div class="app-hero"><h3>Make the most of your plan</h3><p>Here's what your Molina plan covers this year.</p></div>
      <div class="app-row"><span>Dental cleanings</span><span>2 / year</span></div>
      <div class="app-row"><span>Vision exam</span><span>Covered</span></div>
      <div class="app-row"><span>Rides to appointments</span><span>24 left</span></div>
      <div class="app-row"><span>Over-the-counter items</span><span>$50 / qtr</span></div>`,
  },
  // Flex card (Figma 2737:10925): purse name + available balance only, named as on the Nations
  // portal. No "lives in Care hub" copy: it opens with Care hub underneath, which shows where it lives.
  flex: {
    title: "Flex card",
    core: true,
    html: () => `
      ${pageHeader("Flex card", "View your available balance for each benefit.")}
      ${NATIONS_PURSES.map((p, i) => `
      <div class="ch-pad"><button class="ch-perk" type="button" data-goto="purse" data-purse="${i}">
        <span class="ch-circle ch-circle--32"><img src="${C}${p.icon}" width="20" height="20" alt="" /></span>
        <span class="ch-perk-text">
          <span class="ch-perk-name">${p.name}</span>
          <span class="ch-perk-amount">${p.amount}</span>
          <span class="ch-perk-label">Available balance</span>
        </span>
        <img class="ch-perk-caret" src="${C}icon-caret-right-20.svg" width="20" height="20" alt="" />
      </button></div>`).join("")}
      <p class="ch-updated">Last updated today, ${timeNow()}</p>`,
  },
  // One purse (tap a purse on the Flex card page). A sub-page, laid out like the app's other detail
  // pages (Figma drafts/v2 references): perksDetailExpanded for the header (minus the brand eyebrow) and accordions, the
  // Thrive wallet's walletBalance card for the balance. No tab bar on sub-pages. Benefits Pro is
  // the Care hub link-out card (cardNavigationItem with the external-link icon).
  // The balance always reads "Available balance" with the time it was fetched, so it can't be
  // mistaken for the purse's total (Molina feedback, 11/6). Copy is placeholder; see NATIONS_PURSES.
  purse: {
    title: "Flex card",
    core: true,
    sub: true,
    html: ({ purse = 0 } = {}) => {
      const p = NATIONS_PURSES[purse] || NATIONS_PURSES[0];
      const accordion = (title, body) => `
        <div class="ch-acc">
          <button class="ch-acc-head" type="button" aria-expanded="true" data-accordion>
            <span>${title}</span><img src="${C}icon-caret-up-20.svg" width="20" height="20" alt="" />
          </button>
          <div class="ch-acc-body">${body}</div>
        </div>`;
      return `
      <div class="ch-purse-logo"><span class="ch-circle ch-circle--64"><img src="${C}${p.icon}" width="32" height="32" alt="" /></span></div>
      <h2 class="ch-h3 ch-purse-title">${p.name}</h2>
      <div class="ch-pad"><div class="ch-wallet">
        <div class="ch-wallet-top">
          <p class="ch-eyebrow">Available balance</p>
          <p class="ch-wallet-amount">${p.amount}</p>
          <p class="ch-wallet-asof">${balanceAsOf()}</p>
        </div>
        <p class="ch-wallet-foot">${p.expires}</p>
      </div></div>
      <div class="ch-accordions">
        ${accordion("How you get it", `<p class="ch-purse-copy">${p.earn}</p>`)}
        ${accordion("Where you can use it", `<ul class="ch-tags">${p.spend.map((s) => `<li>${s}</li>`).join("")}</ul>`)}
      </div>
      ${section("Shop with your card")}
      <div class="ch-pad ch-purse-shop">
        <button class="ch-nav-card" type="button" data-benefits-pro>
          <span class="ch-nav-main">
            <img class="ch-purse-app" src="${C}app-benefits-pro.webp" width="48" height="48" alt="" />
            <span class="ch-nav-text"><span class="ch-nav-title">Benefits Pro</span><span class="ch-nav-body">Find eligible items and stores near you</span></span>
            <img src="${C}icon-arrow-square-out.svg" width="20" height="20" alt="" />
          </span>
        </button>
      </div>`;
    },
  },
  // Care hub (Figma 6283:1802): tab root, so no back arrow
  home: {
    title: "Care hub",
    core: true,
    root: true,
    html: () => `
      ${pageHeader("Care hub", "Easy access to all the tools and services your Molina plan offers.")}
      <div class="ch-member">
        <span class="ch-member-icon"><img src="${C}logo-molina-icon.svg" width="22" height="19" alt="" /></span>
        <span><span class="ch-member-label">Molina member ID</span><span class="ch-member-id">W123456789</span></span>
      </div>
      ${section("Your benefits")}
      <div class="ch-pad">
        <button class="ch-nav-card" data-goto="flex" type="button">
          <span class="ch-nav-main">
            <span class="ch-circle ch-circle--48"><img src="${C}icon-cardholder-24.svg" width="24" height="24" alt="" /></span>
            <span class="ch-nav-text"><span class="ch-nav-title">Flex card</span><span class="ch-nav-body">Check your card’s balances</span></span>
            <img src="${C}icon-caret-right-20.svg" width="20" height="20" alt="" />
          </span>
          <span class="ch-nav-foot">Last updated at ${timeNow()}</span>
        </button>
      </div>
      <div class="ch-spacer"></div>
      ${section("Contacts")}
      <div class="ch-hscroll">
        ${CONTACTS.map((c) => `
        <button class="ch-contact" type="button"${c.call ? " data-call" : ""}>
          <span class="ch-circle ch-circle--32"><img src="${C}icon-phone-20.svg" width="20" height="20" alt="" /></span>
          <span class="ch-contact-text"><span class="ch-contact-name">${c.name}</span><span class="ch-contact-desc">${c.desc}</span></span>
        </button>`).join("")}
      </div>
      <div class="ch-spacer"></div>
      ${section("Useful Apps")}
      <div class="ch-hscroll">
        ${APPS.map((a) => `
        <div class="ch-app">
          <span class="ch-app-top">
            ${a.molina
              ? `<span class="ch-app-logo ch-app-logo--molina"><img src="${C}app-molina-mark.svg" width="50" height="43" alt="" /></span>`
              : `<img class="ch-app-logo" src="${C}${a.img}" width="64" height="64" alt="" />`}
            <img src="${C}icon-download.svg" width="20" height="20" alt="" />
          </span>
          <span class="ch-app-name">${a.name}</span>
          <span class="ch-app-desc">${a.desc}</span>
        </div>`).join("")}
      </div>
      <div class="ch-spacer"></div>
      ${section("Resources")}
      <div class="ch-resources" aria-hidden="true">
        ${RESOURCE_SKELETONS.map((r) => `
        <div class="ch-resource ch-resource--skeleton">
          <span>
            <i class="skel skel--title" style="width: ${r.title}"></i>
            ${r.lines.map((w) => `<i class="skel skel--line" style="width: ${w}"></i>`).join("")}
          </span>
          <i class="skel skel--icon"></i>
        </div>`).join("")}
      </div>`,
  },
};

/* ---------- App launch from a widget (Android 12+ launcher) ----------
   Tapping anything on a widget launches the app from the WHOLE widget, not the tapped tile:
   Launcher3 morphs the widget's background view (@android:id/background on the widget root) into
   the app window. During the morph the app window is scaled down to the widget's width and
   cropped to its height, the corner radius goes from the widget's (16dp) to the screen's, the
   widget's own content fades out first, then the app's content fades in. The rest of the home
   screen scales down a little and fades. Going home plays the same morph in reverse, back into
   the widget. */
const LAUNCH = { open: 500, close: 420, ease: "cubic-bezier(0.2, 0, 0, 1)" };
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let launchFrom = null; // the widget root the app launched from
let launchAnims = [];

// Widget root's rect in phone coordinates (the 360×800 frame may be scaled to fit the window)
function phoneRect(el) {
  const p = phone.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const k = phone.offsetWidth / p.width;
  return { x: (r.left - p.left) * k, y: (r.top - p.top) * k, w: r.width * k, h: r.height * k };
}
// The app window (360×800) scaled to the widget's width and cropped to its height
function windowAt(el) {
  const W = appScreen.offsetWidth, H = appScreen.offsetHeight;
  const r = phoneRect(el);
  const k = r.w / W;
  return {
    transform: `translate(${r.x}px, ${r.y}px) scale(${k})`,
    clipPath: `inset(0px 0px ${Math.max(0, H - r.h / k)}px 0px round ${16 / k}px)`,
  };
}
const FULL = { transform: "translate(0px, 0px) scale(1)", clipPath: "inset(0px 0px 0px 0px round 32px)" };
const appLayers = () => [...appScreen.children];
const homeLayers = () => [...phone.querySelectorAll(".widget-frame")];

function stopLaunch() {
  launchAnims.forEach((a) => a.cancel());
  launchAnims = [];
}
function playLaunch(opening) {
  stopLaunch();
  const from = windowAt(launchFrom);
  if (reduceMotion.matches) {
    launchAnims.push(appScreen.animate([{ opacity: opening ? 0 : 1 }, { opacity: opening ? 1 : 0 }], { duration: 150 }));
    return;
  }
  const d = opening ? LAUNCH.open : LAUNCH.close;
  const opts = { duration: d, easing: LAUNCH.ease };
  // Window: morphs between the widget's bounds and the full screen
  launchAnims.push(appScreen.animate(opening ? [from, FULL] : [FULL, from], opts));
  // Window surface: covers the widget at its exact bounds, so fading it is the widget → app cross-fade
  launchAnims.push(appScreen.animate(opening
    ? [{ opacity: 0 }, { opacity: 1, offset: 0.16 }, { opacity: 1 }]
    : [{ opacity: 1 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: d }));
  // App content: in after the widget content is gone; out first when going home
  appLayers().forEach((el) => launchAnims.push(el.animate(opening
    ? [{ opacity: 0 }, { opacity: 0, offset: 0.14 }, { opacity: 1, offset: 0.5 }, { opacity: 1 }]
    : [{ opacity: 1 }, { opacity: 0, offset: 0.45 }, { opacity: 0 }], { duration: d })));
  // The launch source stays hidden under the window; the rest of the home screen recedes
  homeLayers().forEach((el) => {
    if (el.contains(launchFrom)) {
      // Stays fully visible until the window surface is opaque on top of it (no wallpaper bleed)
      launchAnims.push(el.animate(opening
        ? [{ opacity: 1 }, { opacity: 1, offset: 0.16 }, { opacity: 0, offset: 0.17 }, { opacity: 0 }]
        : [{ opacity: 0 }, { opacity: 0, offset: 0.79 }, { opacity: 1, offset: 0.8 }, { opacity: 1 }],
      { duration: d, fill: "forwards" }));
    } else {
      launchAnims.push(el.animate(opening
        ? [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(0.94)", opacity: 0 }]
        : [{ transform: "scale(0.94)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }],
      { ...opts, fill: "forwards" }));
    }
  });
}

/* Fit the 360×800 frame: desktop → to the window height (phone left, settings right);
   mobile → to the screen width (phone on top, settings below). */
// Side by side whenever the scaled phone + a readable settings column (320px) fit;
// otherwise stack them (phone on top). Decided by real space, not a fixed breakpoint.
// Layout, decided by real space (no fixed breakpoints):
// · Side by side (two columns): phone scaled to the window height on the left; on the right the notes
//   in one column (the card, then the widget notes under it), up to 540px wide for readable lines.
//   The notes never scroll: when they're taller than the window, the notes panel is scaled down
//   (CSS zoom) just enough to fit.
// · Stacked: only when the window is too narrow for the notes beside the phone (phones, small
//   windows): phone on top, notes below, and the page scrolls.
const NOTES_MIN = 320;   // narrowest readable notes column
const notesPanel = document.querySelector(".notes");
function fitDevice() {
  const root = document.documentElement;
  const availH = window.innerHeight - 48;
  const sideScale = Math.min(1, availH / 800);
  const notesW = window.innerWidth - 48 - 40 - 360 * sideScale;
  notesPanel.style.zoom = "";
  if (notesW >= NOTES_MIN) {
    root.classList.remove("stacked");
    root.style.setProperty("--s", sideScale.toFixed(4));
    const h = notesPanel.scrollHeight; // natural height at full size
    if (h > availH) notesPanel.style.zoom = (availH / h).toFixed(4);
  } else {
    root.classList.add("stacked");
    root.style.setProperty("--s", Math.min(1, (window.innerWidth - 32) / 360).toFixed(4));
  }
}
let fitQueued = false;
const queueFit = () => {
  if (fitQueued) return;
  fitQueued = true;
  requestAnimationFrame(() => { fitQueued = false; fitDevice(); });
};
window.addEventListener("resize", queueFit);
// Notes content changes height (widget switch, Android notes, Dropped open/closed) → re-fit
new ResizeObserver(queueFit).observe(notesPanel);
fitDevice();

let appStack = []; // in-app navigation, so Back from Flex Card returns to Care Hub
function renderApp() {
  const { key, opts } = appStack[appStack.length - 1];
  const dest = DESTINATIONS[key];
  appTitle.textContent = dest.title;
  appScreen.classList.toggle("app-screen--core", !!dest.core);
  appScreen.classList.toggle("app-screen--sub", !!dest.sub); // sub-page: no tab bar
  appBack.hidden = !!dest.root && appStack.length === 1;
  appBody.innerHTML = dest.html(opts);
  appBody.scrollTop = 0;
}
function openApp(key, fromEl, opts = {}) {
  if (!DESTINATIONS[key]) return;
  appStack = [{ key, opts }];
  // Deep link from the widget: Care hub is underneath (Android: TaskStackBuilder with Care hub as
  // the parent), so Back goes to Care hub and the Care hub tab is selected.
  if (key === "flex" && opts.source === "widget") appStack.unshift({ key: "home", opts: {} });
  renderApp();

  // Launches from the whole widget (its root background view), whichever tile was tapped
  launchFrom = fromEl.closest(".widget") || fromEl;
  phone.classList.add("app-open");
  appScreen.setAttribute("aria-hidden", "false");
  playLaunch(true);
}

function closeApp() {
  if (!phone.classList.contains("app-open")) return;
  stopHomePulse();
  phone.classList.remove("app-open");
  appScreen.setAttribute("aria-hidden", "true");
  if (launchFrom) playLaunch(false);
  // Home screen is back once the window has folded into the widget
  const done = Promise.all(launchAnims.map((a) => a.finished)).catch(() => {});
  done.then(() => { if (!phone.classList.contains("app-open")) stopLaunch(); });
}

document.querySelectorAll("[data-open]").forEach((el) => {
  el.addEventListener("click", () => openApp(el.dataset.open, el.closest(".card") || el));
});
appBack.addEventListener("click", () => {
  if (appStack.length > 1) { appStack.pop(); renderApp(); }
  else closeApp();
});
// Bottom nav: Care hub tab → Care hub root. Other tabs aren't part of this prototype.
document.getElementById("appNav").addEventListener("click", (e) => {
  const tab = e.target.closest("[data-tab]");
  if (tab?.dataset.tab === "carehub") { appStack = [{ key: "home", opts: {} }]; renderApp(); }
});
document.getElementById("appHelp").addEventListener("click", () => phone.classList.add("sheet-open"));
/* ---------- In the app: pulse for getting back to the widget ----------
   The way back to the widget is the phone's swipe up from the bottom, outside the app. A tap that
   goes nowhere (a heading, empty space, a tab this prototype doesn't have, or the
   app's own Home tab) suggests the member is looking for a way out, so the bottom edge pulses
   around the gesture handle. Each wrong tap replays it; any tap that does something stops it.
   Android: taps no view handles reach the root view (onTouchEvent on the root layout, or
   dispatchTouchEvent in the Activity). The app is edge-to-edge, so it draws the glow behind the
   gesture area, sized from the navigation bar inset (WindowInsetsCompat.Type.navigationBars());
   the system handle stays on top and can't be animated. With 3-button navigation the glow sits
   around the home button. Cap how often it plays in the real app (e.g. 3 times). */
const homePulse = document.getElementById("homePulse");
function pulseHome() {
  homePulse.classList.remove("show");
  reflow(homePulse);
  homePulse.classList.add("show");
}
const stopHomePulse = () => homePulse.classList.remove("show");
homePulse.addEventListener("animationend", (e) => { if (e.target === homePulse.lastElementChild) stopHomePulse(); });
appScreen.addEventListener("click", (e) => {
  const hit = e.target.closest("button, a, [data-goto], [data-call]");
  const tab = hit?.dataset.tab;
  if (!hit || (tab && tab !== "carehub")) return pulseHome();
  stopHomePulse();
});
appBody.addEventListener("click", (e) => {
  const link = e.target.closest("[data-goto]");
  if (link) {
    const opts = { source: "carehub" };
    if (link.dataset.purse) opts.purse = Number(link.dataset.purse);
    appStack.push({ key: link.dataset.goto, opts });
    renderApp();
    return;
  }
  const acc = e.target.closest("[data-accordion]");
  if (acc) { toggleAccordion(acc); return; }
  // Real app: deep link into the Nations Benefits Pro app, or its store listing if not installed
  if (e.target.closest("[data-benefits-pro]")) { toast("Opening Benefits Pro…"); return; }
  if (e.target.closest("[data-call]")) { phone.classList.add("sheet-open"); return; }
});

/* Purse page accordions: the screen stays put when a section closes.
   Closing a section near the bottom makes the page shorter, and the browser would pull the scroll
   position up (everything jumps). Instead, the space the section gave up is held as an empty
   filler at the end of the page, so the tapped header stays exactly where it was, and the filler
   shrinks away as the member scrolls back up (nothing moves while it does).
   Android: the same in a NestedScrollView/LazyColumn: keep the scroll offset and pad the bottom
   by the collapsed height, or animate the collapse and let content above stay anchored. */
function scrollHold() {
  let hold = appBody.querySelector(":scope > .scroll-hold");
  if (!hold) {
    hold = document.createElement("div");
    hold.className = "scroll-hold";
    hold.setAttribute("aria-hidden", "true");
    appBody.appendChild(hold);
  }
  return hold;
}
// Filler needed so the current scroll position still fits: whatever is on screen below the content
function fitHold(scrollTop) {
  const hold = scrollHold();
  const content = appBody.scrollHeight - hold.offsetHeight;
  hold.style.height = `${Math.max(0, scrollTop + appBody.clientHeight - content)}px`;
}
function toggleAccordion(head) {
  const scrollTop = appBody.scrollTop;
  head.setAttribute("aria-expanded", String(head.getAttribute("aria-expanded") !== "true"));
  fitHold(scrollTop);
  appBody.scrollTop = scrollTop;
}
// Scrolling back up uses up the filler; it never grows here, so the page doesn't shift
appBody.addEventListener("scroll", () => {
  const hold = appBody.querySelector(":scope > .scroll-hold");
  if (hold && hold.offsetHeight) fitHold(appBody.scrollTop);
}, { passive: true });

/* ---------- Flex Card purses ----------
   Content + icons from Figma 2663:16237 / 2664:16248 / 2664:16318.
   One purse per card — never summed (per the flexCard/purseCard note in Figma). */
let N = NATIONS_PURSES.length;
const DURATION = 450;
const PAGE_TURN_MS = 700; // Page turn look (styles.css @keyframes v4-page-turn)

// Each card is one collection item: label, icon AND hint (arrow / dots) are drawn inside it,
// so they stay correct even when the launcher advances the widget on its own.
// Purse labels on the widget: "short" = the Figma widget frames (3 purses, 2-line labels),
// "portal" = the Nations portal names from the Flex card page (4 purses, name clamped to 2 lines).
const widgetPurses = (names) => names === "portal"
  ? NATIONS_PURSES.map((p) => ({ name: p.name, amount: p.amount, icon: `${C}${p.icon}`, icon16: `assets/v4/${p.icon16}` }))
  : NATIONS_PURSES.map((p) => ({ line1: p.short[0], line2: p.short[1], amount: p.amount, icon: `${C}${p.icon}`, icon16: `assets/v4/${p.icon16}` }));
let cards = [];
let railCount = null;
/* ---------- Widget 1 · v4 looks (Figma Molina_Widget_v4, frames v4/w1) ----------
   All five: label (2 lines, cut off with … like Figma), amount, and "1 of 4" in each flipper item;
   flipping is next-only and wraps from the last purse to the first. Tap anywhere else → Care hub.
   · v4-right  Right caret: wallet icon top right and "1 of 4" bottom left are both fixed (only the count's text changes); bottom half (count + ›) flips.
   · v4-bottom Bottom caret: same as Right caret, with ⌄ instead of › in the corner.
   · v4-strip  Caret flipper: right strip split in two; top cell shows the purse icon, bottom cell's ⌄ flips.
   · v4-tab    Caret flipper, corner tab: same, no dividers; the ⌄ sits on a raised corner tab.
   · v4-page   Page turn: card with a folded bottom-right corner; purse icon top right (fixed spot,
               image swaps per purse); bottom half flips.                                       */
const V4_LOOKS = ["v4-right", "v4-bottom", "v4-strip", "v4-tab", "v4-page"];
const v4Card = (look) => (p, i) => {
  const [l1, l2] = p.name ? [p.name, ""] : [p.line1, p.line2];
  return `
  <div class="pcard" data-i="${i}" aria-label="${i + 1} of ${N}">
    <div class="pcard-body v4-body">
      <span class="v4-label"><span>${l1}</span>${l2 ? `<span>${l2}</span>` : ""}</span>
      <span class="v4-amount">${p.amount}</span>
      <span class="v4-count">${i + 1} of ${N}</span>
    </div>
  </div>`;
};
// All v4 looks: the purse icon sits outside the flipper, so it stays put while the purses
// slide; only its image is swapped to the current purse. Android: a static ImageView updated with
// setImageViewResource() in the same partiallyUpdateAppWidget() call as showNext().
const v4PurseIcon = `
  <span class="v4-purse tile-icon" aria-hidden="true"><img id="v4PurseImg" width="16" height="16" alt="" draggable="false" /></span>`;
let purseIcons = [];
let purseImg = null;
let v4Count = null;
let iconSwapTimer = null;
const v4Chrome = {
  // Android: ImageView outside the flipper (opens Care hub with the card); the bottom half is a
  // separate view whose fill-in intent → broadcast → showNext().
  // Right caret keeps the wallet icon for every purse (no per-purse swap).
  // Its "1 of 4" also sits outside the flipper, so it stays put and only its text changes.
  "v4-right": `
  <span class="v4-icon tile-icon" aria-hidden="true"><img src="assets/icon-cardholder.svg" width="16" height="16" alt="" draggable="false" /></span>
  <span class="v4-count v4-count--static" id="v4Count" aria-hidden="true"></span>
  <button class="v4-next v4-next--half" data-next type="button" aria-label="Next balance"><span class="v4-caret"><img src="assets/v4/icon-caret-right-16.svg" width="16" height="16" alt="" draggable="false" /></span></button>`,
  "v4-bottom": `
  <span class="v4-icon tile-icon" aria-hidden="true"><img id="v4PurseImg" width="16" height="16" alt="" draggable="false" /></span>
  <button class="v4-next v4-next--half" data-next type="button" aria-label="Next balance"><span class="v4-caret"><img src="assets/v4/icon-caret-down-16.svg" width="16" height="16" alt="" draggable="false" /></span></button>`,
  "v4-strip": v4PurseIcon + `
  <span class="v4-strip" aria-hidden="true"><span class="v4-strip-top"></span></span>
  <button class="v4-next v4-next--cell" data-next type="button" aria-label="Next balance"><span class="v4-circle"><img src="assets/v4/icon-caret-down-16.svg" width="16" height="16" alt="" draggable="false" /></span></button>`,
  "v4-tab": v4PurseIcon + `
  <button class="v4-next v4-next--tab" data-next type="button" aria-label="Next balance"><span class="v4-circle v4-circle--bare"><img src="assets/v4/icon-caret-down-16.svg" width="16" height="16" alt="" draggable="false" /></span></button>`,
  "v4-page": `
  <img class="v4-surface" src="assets/v4/card-surface.svg?v=2" width="156" height="124" alt="" draggable="false" />
  <span class="v4-icon tile-icon" aria-hidden="true"><img id="v4PurseImg" width="16" height="16" alt="" draggable="false" /></span>
  <button class="v4-next v4-next--half" data-next type="button" aria-label="Next balance"><img class="v4-corner" src="assets/v4/page-corner.svg?v=3" width="40" height="40" alt="" draggable="false" /></button>`,
};

function buildCards(list, { look = "" } = {}) {
  purseIcons = list.map((p) => p.icon16);
  purseImg = null;
  v4Count = null;
  if (V4_LOOKS.includes(look)) {
    N = list.length;
    const items = list.map(v4Card(look)).join("");
    // Right caret: the purses slide inside a fixed clip layer, so the text can fade out around the
    // purse icon and the › (styles.css .v4-clip) while the layer itself stays put.
    flexTile.innerHTML = (look === "v4-right" ? `<div class="v4-clip">${items}</div>` : items) + v4Chrome[look] + `
  <span hidden id="railCount"></span>`;
    cards = [...flexTile.querySelectorAll(".pcard")];
    railCount = document.getElementById("railCount");
    purseImg = document.getElementById("v4PurseImg");
    v4Count = document.getElementById("v4Count");
    return;
  }
  N = list.length;
  flexTile.innerHTML = list.map((p, i) => `
  <div class="pcard${i === N - 1 ? " is-last" : ""}" data-i="${i}" aria-label="${i + 1} of ${N}">
    <div class="pcard-body">
      <div class="page-text">
        ${p.name
          ? `<span class="tile-name cue-target">${p.name}</span>`
          : `<span class="tile-line">${p.line1}</span><span class="tile-line cue-target">${p.line2}</span>`}
        <span class="tile-line tile-line--strong">${p.amount}</span>
      </div>
      <div class="tile-side">
        <span class="tile-icon"><img src="${p.icon}" width="16" height="16" alt="" draggable="false" /></span>
        <span class="tile-count">${i + 1} of ${N}</span>
        <span class="tile-hint">
          <button class="tile-next" data-next type="button" aria-label="Next purse">
            <img src="assets/icon-arrow-down-white.svg" width="20" height="20" alt="" draggable="false" />
          </button>
          <span class="pager-dots" data-next aria-hidden="true">${list.map((_, k) => `<i${k === i ? ' class="on"' : ""}></i>`).join("")}</span>
        </span>
      </div>
      <button class="tile-chip" data-next type="button" aria-label="Next balance, ${i + 1} of ${N}">
        <span>${i + 1}/${N}</span>
      </button>
    </div>
  </div>`).join("") + `
  <button class="flex-rail" data-next type="button" aria-label="Next balance">
    <img src="assets/icon-arrow-down-brand.svg" width="20" height="20" alt="" draggable="false" />
    <span class="rail-count" id="railCount">1/${N}</span>
  </button>`;
  cards = [...flexTile.querySelectorAll(".pcard")];
  railCount = document.getElementById("railCount");
}
buildCards(widgetPurses("short"));

let page = 0;
let step = 0; // prism: unbounded turn count, so 3 → 1 keeps turning forward instead of rewinding
let busy = false;
let used = false; // member has interacted → stop auto-advance

const mod = (n) => ((n % N) + N) % N;
const reflow = (el) => void el.offsetWidth;
function layout() {
  cards.forEach((c, i) => (c.dataset.depth = mod(i - page)));
  // Side rail sits outside the flipper, so its counter is updated separately (setTextViewText).
  railCount.textContent = `${page + 1}/${N}`;
  // Right caret: the static "1 of 4" outside the flipper. Android: setTextViewText() in the same
  // partiallyUpdateAppWidget() call as showNext().
  if (v4Count) v4Count.textContent = `${page + 1} of ${N}`;
  if (purseImg) {
    const src = purseIcons[page];
    // Page turn: the icon belongs to the page being peeled. It fades under the fold (styles.css), and
    // only swaps to the next purse's icon once it's hidden. Android: the same setImageViewResource(),
    // sent partway through instead of with showNext().
    clearTimeout(iconSwapTimer);
    if (flexTile.dataset.look === "v4-page" && flexTile.querySelector(".pcard.exit-up")) {
      const img = purseImg;
      iconSwapTimer = setTimeout(() => (img.src = src), PAGE_TURN_MS * 0.42);
    } else {
      purseImg.src = src;
    }
  }
  flexTile.classList.toggle("on-last", page === N - 1);
}
function withoutAnim(els, fn) {
  els.forEach((el) => el.classList.add("no-anim"));
  fn();
  els.forEach(reflow);
  els.forEach((el) => el.classList.remove("no-anim"));
}

/* Prism revolve: purses sit on the faces of an N-sided prism (N = number of purses).
   Neighbouring faces share their top/bottom edge; each step turns the prism 360/N degrees. */
const PRISM_MS = 650;
const isPrism = () => flexTile.dataset.mode === "flipper" && flexTile.dataset.flip === "prism";
function prismGeometry() {
  const h = flexTile.offsetHeight;                 // face height (88px)
  const angle = 360 / N;                           // 120° for 3 purses
  const apothem = h / (2 * Math.tan(Math.PI / N)); // axis → face distance
  return { angle, apothem };
}
function layoutPrism({ animate = true } = {}) {
  const { angle, apothem } = prismGeometry();
  cards.forEach((c, i) => (c.style.transform = `rotateX(${-i * angle}deg) translateZ(${apothem}px)`));
  flexTile.style.transition = animate ? "" : "none";
  // translateZ(-apothem) keeps the front face at its normal size when the prism is at rest
  flexTile.style.transform = `perspective(700px) translateZ(${-apothem}px) rotateX(${step * angle}deg)`;
  layout();
}
function clearPrism() {
  cards.forEach((c) => (c.style.transform = ""));
  flexTile.style.transform = "";
  flexTile.style.transition = "";
}

function go(dir) {
  if (busy) return;
  busy = true;
  if (isPrism()) {
    // dir can be more than one face (e.g. -2 = turn back over two faces in one motion)
    const faces = Math.abs(dir);
    const ms = PRISM_MS + (faces - 1) * 300;
    step += dir;
    page = mod(step);
    layoutPrism(); // resets the inline transition, so set the duration after it
    flexTile.style.transitionDuration = `${ms}ms`;
    setTimeout(() => {
      flexTile.style.transitionDuration = "";
      busy = false;
    }, ms);
    return;
  }
  const mode = flexTile.dataset.mode;
  const front = cards[page];
  const incoming = cards[mod(page + dir)];

  if (dir > 0) {
    // Next: the front card leaves upward; the next one comes in (flipper) / moves forward (stack).
    front.classList.add("exit-up");
    page = mod(page + 1);
    layout();
    const outMs = flexTile.dataset.look === "v4-page" ? PAGE_TURN_MS : DURATION;
    setTimeout(() => {
      // Departed card re-joins the back of the deck, out of sight.
      withoutAnim([front], () => { front.classList.remove("exit-up"); front.style.opacity = "0"; });
      // Restore next frame; the timer is a fallback for background tabs, where frames don't run
      const restore = () => (front.style.opacity = "");
      requestAnimationFrame(restore);
      setTimeout(restore, 50);
      busy = false;
    }, outMs);
  } else {
    // Previous: the last card comes back down onto the top.
    withoutAnim([incoming], () => incoming.classList.add("enter-top"));
    page = mod(page - 1);
    layout();
    requestAnimationFrame(() => incoming.classList.remove("enter-top"));
    setTimeout(() => (busy = false), DURATION);
  }
  if (mode === "flipper" && dir < 0) front.dataset.depth = "1"; // exits downward
}

function markUsed() {
  used = true;
  stopAuto();
}
// Widget → Flex Card list. Android: the item's fill-in intent carries source=widget.
const openFlex = () => openApp("flex", flexTile, { source: "widget" });
function userGo(dir) {
  markUsed();
  go(dir);
}

// Hint taps (arrow or dots) → next purse. On Android: setOnClickFillInIntent → showNext().
flexTile.addEventListener("click", (e) => {
  if (e.target.closest("[data-prev]")) { e.stopPropagation(); return userGo(-1); }
  const hint = e.target.closest("[data-next]");
  if (!hint) return;
  e.stopPropagation();
  // Prism: on the last purse the arrow points up, so it turns the prism the other way,
  // back over the earlier faces to the first purse, instead of continuing forward.
  if (isPrism() && page === N - 1 && hint.classList.contains("tile-next")) return userGo(-(N - 1));
  userGo(1);
});


// Swipe. Only StackView supports it, so flipper mode treats any press as a tap.
let drag = null;
/* Prism tap zones: widgets only get taps, so direction comes from WHERE you tap.
   Top half → previous purse, bottom half → next purse, purse icon → open the app.
   On Android: three child views inside each flipper item, each with its own
   setOnClickFillInIntent (extras: prev / next / open). */
function prismZone(e) {
  if (e.target.closest(".tile-icon")) return "icon";
  const r = flexTile.getBoundingClientRect();
  return e.clientY < r.top + r.height / 2 ? "top" : "bottom";
}
const PRESS = ["press-top", "press-bottom", "press-icon"];

flexTile.addEventListener("pointerdown", (e) => {
  if (e.target.closest("[data-next], [data-prev]") || busy) return;
  drag = { y: e.clientY, dy: 0, id: e.pointerId, zone: isPrism() ? prismZone(e) : null };
  if (drag.zone) flexTile.classList.add(`press-${drag.zone}`);
  try { flexTile.setPointerCapture(e.pointerId); } catch {}
});
flexTile.addEventListener("pointermove", (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  drag.dy = e.clientY - drag.y;
  if (flexTile.dataset.mode !== "stack") return;
  const front = cards[page];
  const dy = drag.dy < 0 ? drag.dy : drag.dy * 0.25; // resist pulling the deck down
  front.classList.add("dragging");
  front.style.transform = `translateY(${dy}px) rotate(${dy / 40}deg)`;
  front.style.opacity = String(Math.max(0.3, 1 + Math.min(0, dy) / 140));
});
function endDrag(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const { dy, zone } = drag;
  drag = null;
  flexTile.classList.remove(...PRESS);
  if (zone) {
    if (Math.abs(dy) > 12) return pulseNextControl();
    if (zone === "icon") return openFlex();
    return userGo(zone === "top" ? -1 : 1);
  }
  if (flexTile.dataset.mode === "stack") {
    // Undo the drag styling. Only StackView sets it — in prism mode the inline
    // transform is the face's position on the prism and must be left alone.
    const front = cards[page];
    front.classList.remove("dragging");
    front.style.transform = "";
    front.style.opacity = "";
  }
  if (Math.abs(dy) < 6) return openFlex(); // a tap, not a swipe
  if (flexTile.dataset.mode !== "stack") {
    // On a real widget nothing would happen here. No text: pulse the tap target instead.
    if (Math.abs(dy) > 12) pulseNextControl();
    return;
  }
  if (dy < -24) userGo(1);
  else if (dy > 24) userGo(-1);
}
// Swipes do nothing on a widget: pulse the control that does go to the next balance (› on Right caret)
function pulseNextControl() {
  flexTile.classList.remove("hint-pulse");
  reflow(flexTile);
  flexTile.classList.add("hint-pulse");
}
flexTile.addEventListener("dragstart", (e) => e.preventDefault());
flexTile.addEventListener("animationend", () => flexTile.classList.remove("hint-pulse"));
flexTile.addEventListener("pointerup", endDrag);
flexTile.addEventListener("pointercancel", endDrag);

// Trackpad / mouse wheel stands in for a swipe (StackView only)
let wheelLock = false;
flexTile.addEventListener("wheel", (e) => {
  if (flexTile.dataset.mode !== "stack") return;
  e.preventDefault();
  if (wheelLock || Math.abs(e.deltaY) < 8) return;
  wheelLock = true;
  userGo(e.deltaY > 0 ? 1 : -1);
  setTimeout(() => (wheelLock = false), DURATION + 50);
}, { passive: false });

flexTile.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); userGo(1); }
  if (e.key === "ArrowUp") { e.preventDefault(); userGo(-1); }
  if (e.key === "Enter") openFlex();
});

/* ---------- Auto-advance ----------
   Flipper: android:flipInterval (you choose), stopped with stopFlipping() after the first tap.
   StackView: android:autoAdvanceViewId — the launcher decides the timing. */
let autoTimer = null;
function stopAuto() { clearInterval(autoTimer); autoTimer = null; }
function startAuto() {
  stopAuto();
  if (!phone.hasAttribute("data-auto") || used || phone.dataset.answer !== "pager") return;
  const ms = flexTile.dataset.mode === "stack" ? 8000 : 5000;
  autoTimer = setInterval(() => {
    if (phone.classList.contains("app-open") || phone.classList.contains("sheet-open") || drag) return;
    go(1);
  }, ms);
}

/* ---------- Side-panel controls ---------- */
const hintInputs = [...document.querySelectorAll("[data-hint]")];
const modeInputs = [...document.querySelectorAll('input[name="mode"]')];
const autoNote = document.getElementById("autoNote");
const flipInputs = [...document.querySelectorAll('input[name="flip"]')];
const flipOptions = document.getElementById("flipOptions");
const ctlInputs = [...document.querySelectorAll('input[name="ctl"]')];
const ctlOptions = document.getElementById("ctlOptions");
const ctlNote = document.getElementById("ctlNote");

function setMode(mode) {
  modeInputs.forEach((r) => (r.checked = r.value === mode));
  const ctlNow = ctlInputs.find((r) => r.checked).value;
  // Look = one of the v4 tiles (flipper only); "" = the earlier pager controls
  const look = mode === "flipper" && flipInputs.find((r) => r.checked).value !== "prism"
    && V4_LOOKS.includes(ctlNow) ? ctlNow : "";
  if (look !== (flexTile.dataset.look || "")) {
    flexTile.dataset.look = look;
    page = 0;
    step = 0;
    buildCards(widgetPurses(document.querySelector('input[name="names"]:checked').value), { look });
  }
  withoutAnim(cards, () => {
    cards.forEach((c) => { c.classList.remove("exit-up", "enter-top"); c.style.cssText = ""; });
    flexTile.dataset.mode = mode;
    flexTile.dataset.flip = flipInputs.find((r) => r.checked).value;
    flexTile.dataset.ctl = ctlInputs.find((r) => r.checked).value;
    clearPrism();
    step = page;
    if (isPrism()) layoutPrism({ animate: false });
    else layout();
  });
  if (isPrism()) requestAnimationFrame(() => (flexTile.style.transition = ""));
  flipOptions.classList.toggle("is-inactive", mode !== "flipper");
  // The next control applies to the flipper's slide / fade / pop / rise. Prism has its own tap zones.
  ctlOptions.classList.toggle("is-inactive", mode !== "flipper" || isPrism());
  ctlNote.textContent = mode !== "flipper" ? "· picking one switches to AdapterViewFlipper"
    : isPrism() ? "· Prism uses tap zones instead; picking one switches to Vertical slide" : "";
  busy = false;
  // Side rail: its counter sits outside the flipper and can't follow auto-flips, so no auto-advance.
  const autoInput = hintInputs.find((i) => i.dataset.hint === "auto");
  const railOn = mode === "flipper" && !isPrism() && flexTile.dataset.ctl === "rail";
  // Caption: no next control, so the flipper always auto-advances
  const captionOn = mode === "flipper" && !isPrism() && flexTile.dataset.ctl === "caption";
  const stepOn = !!flexTile.dataset.look; // v4 looks: no auto-advance
  autoInput.disabled = railOn || captionOn || stepOn;
  if (railOn || stepOn) autoInput.checked = false;
  if (captionOn) autoInput.checked = true;
  autoNote.textContent = railOn ? "· off with the side rail" : stepOn ? "· off with the flip control" : captionOn ? "· always on (no next control)"
    : mode === "stack" ? "· launcher timing" : "· every 5s";
  applyHints();
  // The flipper always shows its dots (they replace the icon + arrow column), so the toggle only applies to StackView.
  const dotsInput = hintInputs.find((i) => i.dataset.hint === "dots");
  dotsInput.disabled = mode === "flipper";
  document.getElementById("dotsNote").textContent = mode === "flipper" ? "· always on for the flipper" : "";
  startAuto();
}
function applyHints() {
  hintInputs.forEach((inp) => phone.toggleAttribute(`data-${inp.dataset.hint}`, inp.checked));
  startAuto();
}
function setHints(list) {
  hintInputs.forEach((inp) => (inp.checked = list.includes(inp.dataset.hint)));
  applyHints();
}
modeInputs.forEach((r) => r.addEventListener("change", () => setMode(r.value)));
// Picking a flipper animation switches to the flipper (the options stay readable and clickable in StackView).
flipInputs.forEach((r) => r.addEventListener("change", () => setMode("flipper")));
function setCtl(value) {
  ctlInputs.forEach((r) => (r.checked = r.value === value));
  if (isPrism()) flipInputs.forEach((r) => (r.checked = r.value === "slide"));
  setMode("flipper");
}
ctlInputs.forEach((r) => r.addEventListener("change", () => setCtl(r.value)));
function setFlip(value) { flipInputs.forEach((r) => (r.checked = r.value === value)); }
hintInputs.forEach((inp) => inp.addEventListener("change", applyHints));
document.getElementById("hintRecommended").addEventListener("click", () => { setFlip("slide"); setCtl("v4-right"); setHints([]); });
document.getElementById("hintFigma").addEventListener("click", () => { setFlip("slide"); setCtl("dots"); setHints([]); });

/* Widget 1 = flippable purse tile ("pager"). Widget 2 = static, tap-only link tile ("no"). */
const answerInputs = [...document.querySelectorAll('input[name="answer"]')];
const widgetInputs = [...document.querySelectorAll('input[name="widget"]')];
const nameInputs = [...document.querySelectorAll('input[name="names"]')];
const notes = document.querySelector(".notes");
let w2Version = answerInputs.find((r) => r.checked)?.value || "no";
function setAnswer(value) {
  if (value !== "pager") {
    w2Version = value;
    answerInputs.forEach((r) => (r.checked = r.value === value));
  }
  widgetInputs.forEach((r) => (r.checked = r.value === (value === "pager" ? "1" : "2")));
  phone.dataset.answer = value;
  notes.dataset.answer = value;
  if (value === "pager") startAuto(); else stopAuto();
}
answerInputs.forEach((r) => r.addEventListener("change", () => setAnswer(r.value)));
widgetInputs.forEach((r) => r.addEventListener("change", () => setAnswer(r.value === "1" ? "pager" : w2Version)));
// Touching any Widget 1 option switches to Widget 1
document.querySelectorAll("#modeControls, #hintControls, #namesControls").forEach((f) =>
  f.addEventListener("change", () => { if (phone.dataset.answer !== "pager") setAnswer("pager"); }));
document.querySelectorAll("#hintRecommended, #hintFigma").forEach((b) => b.addEventListener("click", () => setAnswer("pager")));

nameInputs.forEach((r) => r.addEventListener("change", () => {
  page = 0;
  step = 0;
  buildCards(widgetPurses(r.value), { look: flexTile.dataset.look || "" });
  setMode(flexTile.dataset.mode);
}));
const flexLinkTile = document.getElementById("flexLinkTile");
flexLinkTile.addEventListener("click", () => openApp("flex", flexLinkTile, { source: "widget" }));


setMode("flipper");
applyHints();
setAnswer(widgetInputs.find((r) => r.checked).value === "1" ? "pager" : w2Version);

/* Android engineering notes: hidden by default; the toggle shows them (remembered on this device) */
const androidToggle = document.getElementById("androidToggle");
const setAndroidNotes = (on) => {
  androidToggle.checked = on;
  notes.classList.toggle("show-android", on);
  try { localStorage.setItem("molina-flexcard:android-notes", on ? "1" : "0"); } catch {}
};
androidToggle.addEventListener("change", () => setAndroidNotes(androidToggle.checked));
setAndroidNotes((() => { try { return localStorage.getItem("molina-flexcard:android-notes") === "1"; } catch { return false; } })());

/* ---------- Member Services: call sheet ---------- */
const openSheet = () => phone.classList.add("sheet-open");
const closeSheet = () => phone.classList.remove("sheet-open");
callTile.addEventListener("click", openSheet);
document.getElementById("scrim").addEventListener("click", closeSheet);
document.getElementById("sheetCancel").addEventListener("click", closeSheet);
document.getElementById("sheetCall").addEventListener("click", () => {
  closeSheet();
  toast("Calling Member Services…");
});

/* ---------- Clock ----------
   Status bar shows the real time, Android style (12-hour, no AM/PM: "3:42"), and keeps ticking. */
const clockEl = document.getElementById("clock");
function tickClock() { clockEl.textContent = timeNow().replace(/\s?[AP]M$/, ""); }
tickClock();
setInterval(tickClock, 5000);

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

/* ---------- Back / home ---------- */
function goHome() {
  closeSheet();
  closeApp();
}
document.getElementById("gestureBar").addEventListener("click", goHome);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") goHome();
});
