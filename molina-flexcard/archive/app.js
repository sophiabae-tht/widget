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
// Flex Card purses (Figma 2663:16237 / 2664:16248 / 2664:16318). One purse per row, never summed.
const FLEX_PURSES = [
  // stepLabel: the stepper tile already says "Flex Card Balance" on its overview, so don't repeat it
  { line1: "Flex Card", line2: "balance",  amount: "$515.05", icon: "icon-currency-circle-dollar.svg", stepLabel: "Total balance" },
  { line1: "Health",    line2: "rewards",  amount: "$375.00", icon: "icon-gift.svg" },
  { line1: "Prepaid",   line2: "benefits", amount: "$143.05", icon: "icon-currency-dollar.svg" }, // Design Library CurrencyDollar 16px
];
// Purses as named on the Nations portal (Core App Experience, Figma 6287:23451)
const C = "../assets/carehub/";
const NATIONS_PURSES = [
  { name: "2026 Health Screening Rewards",    amount: "$375.00", icon: "icon-heartbeat.svg" },
  { name: "Over the Counter, Food & Produce", amount: "$143.00", icon: "icon-fork-knife.svg" },
  { name: "Post Discharge Incentives",        amount: "$50.00",  icon: "icon-hospital.svg" },
  { name: "Health Risk Assessment Rewards",   amount: "$25.00",  icon: "icon-list-checks.svg" },
];
let careHubNoteSeen = false; // Android: a SharedPreferences flag, set by "Got it"
// How the Flex card page tells widget users it lives in Care hub: "line" | "note" | "none"
let orient = "line";

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
  { name: "Benefits pro", desc: "Check your Flex Card balance and shop eligible items", img: "app-benefits-pro.png" },
  { name: "CVS Caremark", desc: "Access prescriptions, compare prices, find pharmacies in one app", img: "app-cvs.png" },
  { name: "Teladoc", desc: "Connect with doctors, therapists, and health professionals virtually", img: "app-teladoc.png" },
  { name: "Maven Clinic", desc: "24/7 fertility, pregnancy, parenting &amp; menopause support", img: "app-maven.png" },
];
const RESOURCES = [
  ["Aetna Better Health of OK", "Find out more about what is available to you through your Aetna Oklahoma health plan"],
  ["Member Handbook", "Learn about your health care benefits"],
  ["Member Portal", "Find care, manage benefits, handle claims, get quotes, and find forms through Aetna’s Member Portal"],
  ["SoonerQuit Program", "Need support in quitting tobacco? Connect with a team that can support your tobacco cessation journey"],
  ["OK WIC / SNAP", "Pregnant, Breastfeeding or Post-Partum? Find out if you are eligible for WIC benefits"],
  ["HeadStart", "Do you have children 5 years old or younger? You may be eligible for support in their health and education"],
  ["Oklahoma 211", "Find out what social service resources are available to you through Oklahoma 211"],
  ["Krames Online", "Have questions about your healthcare. Find answers through Krames Online’s digital library"],
  ["KidsHealth", "Have children? Get advice on your child’s health, behavior, and growth through KidsHealth"],
  ["HRS Link", "Complete your Health Risk Screen here"],
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
  // Flex card (Figma 6287:23451): purse name + available balance only, named as on the Nations
  // portal. Opened from the widget → one-time note that this page always lives in Care hub.
  // Opened from Care hub itself → no note.
  flex: {
    title: "Flex card",
    core: true,
    html: ({ source } = {}) => `
      ${pageHeader("Flex card", "View your available balance for each benefit.")}
      ${source === "widget" && orient === "line" ? `
      <p class="ch-orient"><img src="${C}nav-bookmark.svg" width="16" height="16" alt="" />You can always find this in Care hub</p>` : ""}
      ${source === "widget" && orient === "note" && !careHubNoteSeen ? `
      <div class="ch-pad"><div class="app-note" id="careHubNote">
        <p class="app-note-title">Your balances always live in Care hub</p>
        <p class="app-note-text">Find them anytime in Care hub › Flex card. The widget is a shortcut to this page.</p>
        <button class="app-note-btn" data-dismiss-note type="button">Got it</button>
      </div></div>` : ""}
      ${NATIONS_PURSES.map((p) => `
      <div class="ch-pad"><div class="ch-perk">
        <span class="ch-circle ch-circle--32"><img src="${C}${p.icon}" width="20" height="20" alt="" /></span>
        <div class="ch-perk-text">
          <p class="ch-perk-name">${p.name}</p>
          <p class="ch-perk-amount">${p.amount}</p>
          <p class="ch-perk-label">Available balance</p>
        </div>
      </div></div>`).join("")}
      <p class="ch-updated">Updated today, 9:30 AM</p>`,
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
          <span class="ch-nav-foot"><b>2 new balances</b><span>Updated today, 9:30 AM</span></span>
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
      <div class="ch-resources">
        ${RESOURCES.map(([t, d]) => `
        <div class="ch-resource">
          <span><span class="ch-resource-title">${t}</span><span class="ch-resource-desc">${d}</span></span>
          <img src="${C}icon-arrow-square-out.svg" width="20" height="20" alt="" />
        </div>`).join("")}
      </div>`,
  },
};

/* ---------- App launch: expand from the tapped element ---------- */
let launchRect = null;

function insetFor(el) {
  const p = phone.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const k = phone.offsetWidth / p.width; // screen px → phone px (the frame may be scaled to fit)
  return `inset(${(r.top - p.top) * k}px ${(p.right - r.right) * k}px ${(p.bottom - r.bottom) * k}px ${(r.left - p.left) * k}px round 16px)`;
}

/* Fit the 360×800 frame: desktop → to the window height (phone left, settings right);
   mobile → to the screen width (phone on top, settings below). */
// Side by side whenever the scaled phone + a readable settings column (320px) fit;
// otherwise stack them (phone on top). Decided by real space, not a fixed breakpoint.
function fitDevice() {
  const root = document.documentElement;
  const sideScale = Math.min(1, (window.innerHeight - 48) / 800);
  const fitsSideBySide = window.innerWidth >= 360 * sideScale + 40 + 320 + 48;
  root.classList.toggle("stacked", !fitsSideBySide);
  const s = fitsSideBySide ? sideScale : Math.min(1, (window.innerWidth - 32) / 360);
  root.style.setProperty("--s", s.toFixed(4));
}
window.addEventListener("resize", fitDevice);
fitDevice();

// Side by side: scrolling anywhere outside the phone scrolls the settings column,
// so the phone stays fixed and the text is always reachable.
const notesPanel = document.querySelector(".notes");
document.querySelector(".stage").addEventListener("wheel", (e) => {
  if (document.documentElement.classList.contains("stacked")) return;
  if (e.target.closest(".notes") || e.target.closest("#phone")) return;
  notesPanel.scrollBy({ top: e.deltaY });
}, { passive: true });

let appStack = []; // in-app navigation, so Back from Flex Card returns to Care Hub
function renderApp() {
  const { key, opts } = appStack[appStack.length - 1];
  const dest = DESTINATIONS[key];
  appTitle.textContent = dest.title;
  appScreen.classList.toggle("app-screen--core", !!dest.core);
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

  launchRect = insetFor(fromEl);
  appScreen.style.transition = "none";
  appScreen.style.clipPath = launchRect;
  appScreen.getBoundingClientRect(); // commit start frame
  appScreen.style.transition = "";
  phone.classList.add("app-open");
  appScreen.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    appScreen.style.clipPath = "inset(0 round 32px)";
  });
}

function closeApp() {
  if (!phone.classList.contains("app-open")) return;
  appScreen.style.clipPath = launchRect || "inset(40% 10% 40% 10% round 16px)";
  phone.classList.remove("app-open");
  appScreen.setAttribute("aria-hidden", "true");
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
appBody.addEventListener("click", (e) => {
  const link = e.target.closest("[data-goto]");
  if (link) { appStack.push({ key: link.dataset.goto, opts: { source: "carehub" } }); renderApp(); return; }
  if (e.target.closest("[data-call]")) { phone.classList.add("sheet-open"); return; }
  if (e.target.closest("[data-dismiss-note]")) {
    careHubNoteSeen = true;
    const note = document.getElementById("careHubNote");
    note.classList.add("is-leaving");
    setTimeout(() => note.remove(), 200);
  }
});

/* ---------- Flex Card purses ----------
   Content + icons from Figma 2663:16237 / 2664:16248 / 2664:16318.
   One purse per card — never summed (per the flexCard/purseCard note in Figma). */
let N = FLEX_PURSES.length;
const DURATION = 450;

// Each card is one collection item: label, icon AND hint (arrow / dots) are drawn inside it,
// so they stay correct even when the launcher advances the widget on its own.
// Purse labels on the widget: "short" = the Figma widget frames (3 purses, 2-line labels),
// "portal" = the Nations portal names from the Flex card page (4 purses, name clamped to 2 lines).
const widgetPurses = (names) => names === "portal"
  ? NATIONS_PURSES.map((p) => ({ name: p.name, amount: p.amount, icon: `../assets/carehub/${p.icon}` }))
  : FLEX_PURSES.map((p) => ({ ...p, icon: `../assets/${p.icon}` }));
let cards = [];
let railCount = null;
// Stepper tile (Figma 2691:18061): an overview card ("Flex Card / Balance / 4 balances"), then
// one card per purse. A static ⌃/⌄ stepper sits outside the flipper.
const stepperCard = (p, i) => `
  <div class="pcard" data-i="${i}" aria-label="${p.overview ? "Overview" : `${i} of ${N - 1}`}">
    <div class="pcard-body stp">
      <div class="stp-top">
        <span class="stp-label">${p.overview ? "Flex Card<br>Balance" : (p.name || p.stepLabel || `${p.line1} ${p.line2}`)}</span>
        <span class="tile-icon"><img src="${p.overview ? "../assets/icon-cardholder.svg" : p.icon}" width="16" height="16" alt="" draggable="false" /></span>
      </div>
      <span class="tile-line tile-line--strong stp-value">${p.overview ? `${p.count} balances` : p.amount}</span>
    </div>
  </div>`;
function buildCards(list, { stepper = false } = {}) {
  if (stepper) {
    const items = [{ overview: true, count: list.length }, ...list];
    N = items.length;
    // Icon sits outside the flipper too, so it stays put and cross-fades to each purse's icon.
    // Android: a second ViewFlipper of icons with fade in/out animators, sent the same
    // showNext()/showPrevious() in the same partiallyUpdateAppWidget() call.
    flexTile.innerHTML = items.map(stepperCard).join("") + `
  <span class="tile-icon stp-icon" aria-hidden="true">${items.map((p, i) =>
    `<img src="${p.overview ? "../assets/icon-cardholder.svg" : p.icon}" width="16" height="16" alt="" draggable="false" data-i="${i}" />`).join("")}</span>
  <span class="flex-stepper">
    <button class="stp-btn" data-prev type="button" aria-label="Previous balance"><img src="../assets/icon-caret-up-16.svg" width="16" height="16" alt="" draggable="false" /></button>
    <button class="stp-btn" data-next type="button" aria-label="Next balance"><img src="../assets/icon-caret-down-16.svg" width="16" height="16" alt="" draggable="false" /></button>
  </span>
  <span hidden id="railCount"></span>`;
    cards = [...flexTile.querySelectorAll(".pcard")];
    railCount = document.getElementById("railCount");
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
            <img src="../assets/icon-arrow-down-white.svg" width="20" height="20" alt="" draggable="false" />
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
    <img src="../assets/icon-arrow-down-brand.svg" width="20" height="20" alt="" draggable="false" />
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
  flexTile.querySelectorAll(".stp-icon img").forEach((img) => img.classList.toggle("on", +img.dataset.i === page));
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
    setTimeout(() => {
      // Departed card re-joins the back of the deck, out of sight.
      withoutAnim([front], () => { front.classList.remove("exit-up"); front.style.opacity = "0"; });
      requestAnimationFrame(() => (front.style.opacity = ""));
      busy = false;
    }, DURATION);
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

const CTL_TIP = {
  stepper: "Widgets can't swipe. Use the up and down arrows",
  caption: "Widgets can't swipe. Balances change every 5 seconds",
  dots: "Tap the dots for the next balance",
  button: "Tap the arrow button for the next balance",
  chip: "Tap 1/3 for the next balance",
  rail: "Tap the strip on the right for the next balance",
};

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
    if (Math.abs(dy) > 12) return toast("Widgets can't swipe. Tap the top or bottom half");
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
    // On a real widget nothing would happen here. Explain it, and point at the tap target.
    if (Math.abs(dy) > 12) {
      toast(`Widgets can't swipe. ${CTL_TIP[flexTile.dataset.ctl] || CTL_TIP.dots}`);
      flexTile.classList.remove("hint-pulse");
      reflow(flexTile);
      flexTile.classList.add("hint-pulse");
    }
    return;
  }
  if (dy < -24) userGo(1);
  else if (dy > 24) userGo(-1);
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
  const stepperOn = mode === "flipper" && flipInputs.find((r) => r.checked).value !== "prism"
    && ctlInputs.find((r) => r.checked).value === "stepper";
  if (stepperOn !== (flexTile.dataset.stepper === "1")) {
    flexTile.dataset.stepper = stepperOn ? "1" : "";
    page = 0;
    step = 0;
    buildCards(widgetPurses(document.querySelector('input[name="names"]:checked').value), { stepper: stepperOn });
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
  const stepOn = flexTile.dataset.stepper === "1";
  autoInput.disabled = railOn || captionOn || stepOn;
  if (railOn || stepOn) autoInput.checked = false;
  if (captionOn) autoInput.checked = true;
  autoNote.textContent = railOn ? "· off with the side rail" : stepOn ? "· off with the stepper" : captionOn ? "· always on (no next control)"
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
document.getElementById("hintRecommended").addEventListener("click", () => { setFlip("slide"); setCtl("stepper"); setHints([]); });
document.getElementById("hintFigma").addEventListener("click", () => { setFlip("slide"); setCtl("dots"); setHints([]); });

/* Question 1: "No" swaps the purse pager for a plain link tile; "Yes" keeps it. */
const answerInputs = [...document.querySelectorAll('input[name="answer"]')];
const nameInputs = [...document.querySelectorAll('input[name="names"]')];
const notes = document.querySelector(".notes");
function setAnswer(value) {
  answerInputs.forEach((r) => (r.checked = r.value === value));
  phone.dataset.answer = value;
  notes.dataset.answer = value;
  if (value === "pager") startAuto(); else stopAuto();
}
answerInputs.forEach((r) => r.addEventListener("change", () => setAnswer(r.value)));
// Touching any "Yes" option switches back to Yes
document.querySelectorAll("#modeControls, #hintControls, #namesControls").forEach((f) =>
  f.addEventListener("change", () => { if (phone.dataset.answer !== "pager") setAnswer("pager"); }));
document.querySelectorAll("#hintRecommended, #hintFigma").forEach((b) => b.addEventListener("click", () => setAnswer("pager")));

/* ---------- "Yes": separate Flex Card widget ----------
   Android: ListView rows from a RemoteViewsService, one per purse (full Nations name + balance). */
const fcList = document.getElementById("fcList");
fcList.innerHTML = NATIONS_PURSES.map((p, i) => `
  <li><button class="fc-row" type="button" data-purse="${i}">
    <span class="fc-name">${p.name}</span>
    <span class="fc-amount">${p.amount}</span>
  </button></li>`).join("");
fcList.addEventListener("click", (e) => {
  const row = e.target.closest(".fc-row");
  if (row) openApp("flex", row, { source: "widget" });
});
const fcSeeAll = document.getElementById("fcSeeAll");
fcSeeAll.addEventListener("click", () => openApp("flex", fcSeeAll.closest(".fc-widget"), { source: "widget" }));
nameInputs.forEach((r) => r.addEventListener("change", () => {
  page = 0;
  step = 0;
  buildCards(widgetPurses(r.value), { stepper: flexTile.dataset.stepper === "1" });
  setMode(flexTile.dataset.mode);
}));
const flexLinkTile = document.getElementById("flexLinkTile");
flexLinkTile.addEventListener("click", () => openApp("flex", flexLinkTile, { source: "widget" }));

document.querySelectorAll('input[name="orient"]').forEach((r) => r.addEventListener("change", () => (orient = r.value)));

setMode("flipper");
applyHints();
setAnswer(answerInputs.find((r) => r.checked).value);

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
document.getElementById("reset").addEventListener("click", () => {
  goHome();
  page = 0;
  used = false;
  careHubNoteSeen = false;
  setMode(flexTile.dataset.mode);
});
