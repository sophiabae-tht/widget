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
// Purse detail page (tap a purse on the Healthy Spending Card page): when the balance resets or expires, how
// it's earned, and where it can be spent.
// PLACEHOLDER COPY: drafted for the 11/10 demo, not confirmed with Humana or Nations (carried over from the Molina prototype). Swap in the
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
  <div class="ch-page-header"><h2 class="ch-h2">${title}</h2>${body ? `<p class="ch-body">${body}</p>` : ""}</div>`;
const section = (title) => `<h3 class="ch-section">${title}</h3>`;

// Care hub (Figma 6283:1802) — work-in-progress mock
// Humana Care hub (Figma Core App Experience 3189:13169)
const CONTACTS = [
  { name: "Member Services", desc: "Call about your health plan", call: "member" },
  { name: "24/7 Nurse Line", desc: "Talk to a nurse day or night", call: "nurse" },
];
const APPS = [
  { name: "MyHumana", desc: "See your ID card, benefits, and doctors near you", img: "app-myhumana.png" },
  { name: "CenterWell Pharmacy", desc: "Refill prescriptions, get them delivered, and track your orders", img: "app-centerwell.png" },
];
// Resources: skeleton rows until Humana's real resource list is decided.
// Each entry = widths of the title bar and the description lines.
const RESOURCE_SKELETONS = [
  { title: "58%", lines: ["100%", "72%"] },
  { title: "42%", lines: ["84%"] },
  { title: "50%", lines: ["100%", "64%"] },
  { title: "36%", lines: ["90%", "48%"] },
];

/* ---------- Find a doctor (Widget 3) ----------
   The booking flow from tht-demo-studio's /gen-ui/appointment-scheduling demo (Figma "Example check-in
   flow – Gen UI"): pick a doctor → pick a time → confirm details → booked → done, as full check-in
   screens with the studio's look and motion (src/screens/*Screen.tsx there). The first screen is
   Client-Demos thriveGuideFlow08 (9205:36385), which the studio draws as its photo action card.
   "Powered by Humana Provider Directory" between the heading and its text is the DES-97 nod that Thrive
   orchestrates Humana's own data. */
const D = "assets/doctor/";
const K = "assets/checkin/";
// Progress through the booking: this flow starts from the widget, so the bar starts near empty
// (the studio's values assume a check-in came before it)
const STEP_PROGRESS = { findDoctor: 0.1, doctors: 0.3, times: 0.5, confirm: 0.7, booked: 0.9 };
// A library icon drawn as a mask, so it takes the text colour (studio LibraryIcon)
const icon = (name, size = "") => `<span class="ci-icon${size ? ` ci-icon--${size}` : ""}" style="--icon: url('${K}${name}.svg')" aria-hidden="true"></span>`;
const checkbox = (size = 20) => `<img class="ci-checkbox" src="${K}checkbox-selected.svg" width="${size}" height="${size}" alt="" />`;
// Library "appHeader": back arrow, "Need help?" (or Thrive Guide's Help pill), progress bar
const ciHeader = ({ progress, help = "link", background = true, back = true } = {}) => `
  <header class="ci-header${background ? " ci-header--bg" : ""}">
    <div class="ci-bar">
      ${back ? `<button class="ci-back" type="button" data-ci-back aria-label="Back"><span><img src="${K}arrow-left.svg" width="24" height="24" alt="" /></span></button>` : "<span></span>"}
      ${help === "pill" ? `<button class="ci-help-pill ci-tiny-bold" type="button" data-ci-help>Help</button>` : `<button class="ci-help ci-tiny-link" type="button" data-ci-help>Need help?</button>`}
    </div>
    ${progress === undefined ? "" : `<div class="ci-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress * 100)}"><span class="ci-fill" data-progress="${progress}"></span></div>`}
  </header>`;
// Library "pageHeader"
const ciPageHeader = (heading, body, id, extra = "") => `
  <div class="ci-page-header">
    <h1 class="ci-h4"${id ? ` id="${id}"` : ""}>${heading}</h1>
    ${extra}
    ${body ? `<p class="ci-small ci-weak">${body}</p>` : ""}
  </div>`;
// "Powered by Humana Provider Directory" lockup ([SB] Assets – Experimentations 2154:15164)
const poweredByDirectory = () => `
  <div class="ci-source">
    <span class="ci-source-label">Powered by</span>
    <span class="ci-source-brand">
      <img src="${D}logo-humana-13.svg" width="65.5394" height="13.5" alt="Humana" />
      <span class="ci-source-name">Provider Directory</span>
    </span>
  </div>`;
// Library "button" and "appFooter" (fill + raised when a list scrolls under it)
const ciButton = (label, attrs = "", { variant = "primary", iconName = "" } = {}) =>
  `<button class="ci-btn ci-btn--${variant}" type="button" ${attrs}>${iconName ? `<span class="ci-btn-icon">${icon(iconName, "20")}</span>` : ""}<span class="ci-btn-label">${label}</span></button>`;
const ciFooter = (buttons, { fill = false } = {}) => `<footer class="ci-footer${fill ? " ci-footer--fill" : ""}"><div class="ci-buttons">${buttons}</div></footer>`;

// The doctor picked is the one named through to the booking.
// PLACEHOLDER clinic addresses: Bellevue's is from Figma; Tusculum's is only the city.
const DOCTORS = [
  { name: "Dr. May Melyn Galbreath, APRN", practice: "CenterWell Bellevue", address: "7643 Hwy 70 S, Nashville, TN 37221",
    distance: "12.33 mi away", photo: "doctor-galbreath.jpg",
    tip: "Soonest opening for your Annual Wellness Visit, and your plan covers a ride there and back." },
  { name: "Dr. Eric Foley, APRN", practice: "CenterWell Tusculum", address: "Nashville, TN",
    distance: "17.77 mi away", photo: "doctor-foley.jpg" },
  { name: "Dr. Sabrina Tanis Finney, MD", practice: "CenterWell Tusculum", address: "Nashville, TN",
    distance: "17.77 mi away", photo: "doctor-finney.jpg" },
];
// John, as on the widget. PLACEHOLDER details (the studio's are Loretta's).
const MEMBER = [
  ["Legal name", "John Carter"],
  ["Email", "john.carter@gmail.com"],
  ["Phone number", "615-555-0147"],
  ["Sex", "Male"],
  ["Address", "4213 Old Hillsboro Rd, Leiper’s Fork, TN 37064"],
  ["Birthday", "March 12, 1958"],
];
// Openings over the next three days from today (the studio's: Today / Jun 11 / Jun 12)
const OPENINGS = [
  ["12:30 PM", "1:00 PM", "2:30 PM", "3:30 PM", "3:45 PM"],
  ["9:00 AM", "10:00 AM", "11:30 AM", "2:00 PM"],
  ["8:30 AM", "1:15 PM", "4:00 PM"],
];
const APPT_ACTIONS = [
  ["Add to calendar", "calendar-blank"],
  ["Modify", "clock-clockwise"],
  ["Directions", "navigation-arrow"],
  ["Get a free ride", "car"],
];
const dayAt = (i) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + i); return d; };
const fmtDay = (d, o) => d.toLocaleDateString("en-US", o);
const dayTab = (i) => (i === 0 ? "Today" : fmtDay(dayAt(i), { month: "short", day: "numeric" }));
const dayTitle = (i) => `${i === 0 ? "Today, " : ""}${fmtDay(dayAt(i), { weekday: "short", month: "short", day: "numeric" })}`;
// booking.doctor / booking.pick start empty: Next stays off until one is picked, as in the studio
const booking = { doctor: null, day: 0, pick: null };
const slotLabel = () => `${fmtDay(dayAt(booking.pick.day), { weekday: "long", month: "long", day: "numeric" })} at ${booking.pick.time}`;
const resetBooking = () => Object.assign(booking, { doctor: null, day: 0, pick: null });

const doctorCard = (d, i) => {
  const on = booking.doctor === i;
  return `
    <button class="ci-doc-btn" type="button" role="radio" aria-checked="${on}" data-ci-doctor="${i}" style="--i: ${i}">
      <span class="ci-doc${on ? " is-selected" : ""}">
        <span class="ci-doc-top">
          <img class="ci-doc-photo" src="${D}${d.photo}" width="68" height="68" alt="" />
          <span class="ci-doc-text">
            <span class="ci-small-bold ci-strong">${d.name}</span>
            <span class="ci-tiny ci-weak">${d.practice}</span>
            <span class="ci-doc-distance">${icon("map-pin", "16")}<span class="ci-tiny ci-underline ci-weak">${d.distance}</span></span>
          </span>
          <span class="ci-check">${on ? checkbox() : ""}</span>
        </span>
        ${d.tip ? `<span class="ci-tip-frame"><span class="ci-tip">${icon("sparkle", "16")}<span class="ci-tiny">${d.tip}</span></span></span>` : ""}
      </span>
    </button>`;
};
const dayTabs = () => OPENINGS.map((_, i) =>
  `<button class="ci-tab ci-small${i === booking.day ? " is-on" : ""}" type="button" role="tab" aria-selected="${i === booking.day}" data-ci-day="${i}">${dayTab(i)}</button>`).join("");
const timeChips = () => OPENINGS[booking.day].map((t) => {
  const on = booking.pick?.day === booking.day && booking.pick.time === t;
  return `<button class="ci-chip ci-small${on ? " is-on" : ""}" type="button" role="radio" aria-checked="${on}" data-ci-time="${t}">${t}${on ? checkbox(16) : ""}</button>`;
}).join("");

/* Find a doctor: picks update the screen in place (a re-render would replay its way in) */
const setNextEnabled = (on) => { const b = appBody.querySelector("[data-ci-next]"); if (b) b.disabled = !on; };
function pickDoctor(i) {
  booking.doctor = i;
  appBody.querySelectorAll("[data-ci-doctor]").forEach((btn) => {
    const on = Number(btn.dataset.ciDoctor) === i;
    btn.setAttribute("aria-checked", on);
    btn.querySelector(".ci-doc").classList.toggle("is-selected", on);
    btn.querySelector(".ci-check").innerHTML = on ? checkbox() : "";
  });
  setNextEnabled(true);
}
function showDay(i) {
  booking.day = i;
  appBody.querySelector(".ci-tabs").innerHTML = dayTabs();
  appBody.querySelector(".ci-day-title").textContent = dayTitle(i);
  appBody.querySelector(".ci-times").innerHTML = timeChips();
}
// End screen: the check-ins' Success Lottie (studio assets/lottie/success.json, lottie-web light build),
// played once to its held check (frames 0–239; 240+ is its way out). If it can't load, a static check.
let lottieLib = null;
const loadLottie = () => (lottieLib ??= new Promise((resolve, reject) => {
  const el = document.createElement("script");
  el.src = `${K}lottie_light.min.js`;
  el.onload = () => resolve(window.lottie);
  el.onerror = () => { lottieLib = null; reject(); };
  document.head.append(el);
}));
let successData = null;
const loadSuccess = () => (successData ??= fetch(`${K}success.json`).then((r) => r.json()).catch((e) => { successData = null; throw e; }));
let successAnim = null;
function playSuccess() {
  const host = appBody.querySelector("#ciSuccess");
  if (!host) return;
  successAnim?.destroy();
  successAnim = null;
  Promise.all([loadLottie(), loadSuccess()]).then(([lottie, data]) => {
    if (!host.isConnected) return;
    successAnim = lottie.loadAnimation({
      container: host, renderer: "svg", loop: false, autoplay: false,
      animationData: structuredClone(data), // lottie mutates its input
      rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
    });
    if (reduceMotion.matches) successAnim.goToAndStop(239, true);
    else successAnim.playSegments([0, 239], true);
  }).catch(() => {
    if (host.isConnected) host.outerHTML = `<span class="ci-success">${icon("check")}</span>`;
  });
}
// The progress bar eases from where the last screen left it (studio ProgressOverlay, 0.6s ease-in-out);
// from the widget it fills from empty.
let ciProgress = 0;
function enterCheckin() {
  const fill = appBody.querySelector(".ci-fill");
  if (!fill) return;
  const to = Number(fill.dataset.progress);
  const at = (v) => `translateX(${(Math.min(1, Math.max(0, v)) - 1) * 100}%)`;
  fill.style.transform = at(ciProgress);
  if (!reduceMotion.matches) {
    reflow(fill);
    fill.style.transition = "transform 600ms cubic-bezier(0.42, 0, 0.58, 1)";
  }
  fill.style.transform = at(to);
  ciProgress = to;
}

/* ---------- Thrive app Home tab, and the visit booked in Widget 3's flow ---------- */
let homeTab = 0;
const homeStatus = () => {
  const [title, caption] = homeTab === 0
    ? ["You’re all caught up", "You’ll get a new check-in each week."]
    : ["No completed check-ins yet", "Check-ins you finish show up here."];
  return `
    <span class="th-icon"><img src="assets/home/icon-list-checks.svg" width="24" height="24" alt="" /></span>
    <p class="th-title">${title}</p>
    <p class="th-caption">${caption}</p>`;
};
// Set when "Looks good, book it" is tapped; Care hub then shows it under Upcoming appointments.
let bookedVisit = null;
// Thrive Guide "badgeItem / appointment" (studio AppointmentBadge): counted from today
function visitStatus(date) {
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const days = Math.round((date - today) / 864e5);
  if (days < 0) return { label: "Past", tone: "neutral" };
  if (days === 0) return { label: "Today", tone: "warning" };
  if (days === 1) return { label: "Tomorrow", tone: "brand" };
  if (days < 7) return { label: `In ${days} days`, tone: "brand" };
  return { label: "Upcoming", tone: "brand" };
}
// Library "appointmentCard" (studio navigator AppointmentCard). Its buttons are shown but do nothing.
const visitCard = (v) => {
  const doc = DOCTORS[v.doctor];
  const st = visitStatus(v.date);
  return `
    <div class="ch-pad"><section class="ap-card" aria-label="Annual Wellness Visit, ${fmtDay(v.date, { weekday: "long", month: "long", day: "numeric" })} at ${v.time}">
      <span class="ap-badge ap-badge--${st.tone}">${st.label}</span>
      <div class="ap-heading">
        <p class="ap-when">${fmtDay(v.date, { weekday: "short", month: "short", day: "numeric" })} at ${v.time}</p>
        <p class="ap-title">Annual Wellness Visit</p>
        <p class="ap-note">With ${doc.name}</p>
      </div>
      <div class="ap-body">
        <p class="ap-where">${doc.practice}</p>
        <p class="ap-address">${doc.address}</p>
        <button class="ap-link" type="button">${icon("navigation-arrow", "16")}Directions</button>
      </div>
      <div class="ap-buttons">
        <button class="ap-btn ap-btn--primary" type="button">${icon("calendar-blank", "16")}<span>Add to calendar</span></button>
        <button class="ap-btn ap-btn--secondary" type="button">${icon("clock-clockwise", "16")}<span>Modify</span></button>
      </div>
    </section></div>`;
};

/* ---------- Perks and Account tabs ----------
   From tht-demo-studio's navigator Thrive app (branch navigator/voice, ThriveAppScreen PerksTab /
   AccountTab: Figma Core App Experience "perksR5" 4712:19381 and "account" 5513:15861). Offers and
   logos are the design's; an offer reacts to a tap but goes nowhere. Account is John's (PLACEHOLDER
   details, as on the booking flow); the phone number and email copy themselves. */
const PK = "assets/perks/";
const PERK_CATEGORIES = ["All", "Automotive", "Entertainment", "Finance", "Food", "Health"];
const PERKS = [
  { brand: "H&R Block", title: "Make tax filing easy", offer: "20% off tax software products", logo: "hr-block.svg", categories: ["Finance"] },
  { brand: "Pandora", title: "Music & podcasts", offer: "90 days free", logo: "pandora.png", categories: ["Entertainment"] },
  { brand: "Factor", title: "Fully-prepared food", offer: "$130 off across 6 boxes", logo: "factor.jpg", categories: ["Food", "Health"] },
  { brand: "Hulu", title: "TV & Movies you love", offer: "One month free", logo: "hulu.png", categories: ["Entertainment"] },
  { brand: "SiriusXM", title: "Ad free music, just for you", offer: "4 months free", logo: "siriusxm.png", categories: ["Entertainment"] },
  { brand: "Valvoline", title: "Automobile upkeep & support", offer: "$8 - $10 off", logo: "valvoline.png", categories: ["Automotive"] },
  { brand: "DoorDash", title: "Food delivery", offer: "30% off first order", logo: "doordash.png", categories: ["Food"] },
  { brand: "HelloFresh", title: "Meal kit", offer: "$125 off across 7 boxes", logo: "hellofresh.png", categories: ["Food", "Health"] },
  { brand: "Omaha Steaks", title: "Steaks, burger, & chicken", offer: "50% off (exclusions apply)", logo: "omaha-steaks.png", categories: ["Food"] },
  { brand: "Sam’s Club", title: "$19.99 membership", offer: "60% off original cost", logo: "sams-club.svg", categories: ["Food", "Health"] },
  { brand: "Discount Tire", title: "Best prices on tires", offer: "5% off", logo: "discount-tire.jpg", categories: ["Automotive"] },
  { brand: "Disney+", title: "Home of everything Disney", offer: "Bundle today to save", logo: "disney-plus.png", categories: ["Entertainment"] },
];
let perkCategory = "All";
const perkPills = () => PERK_CATEGORIES.map((c) =>
  `<button class="pk-pill${c === perkCategory ? " is-on" : ""}" type="button" role="tab" aria-selected="${c === perkCategory}" data-perk-cat="${c}">${c}</button>`).join("");
const perkCards = () => PERKS.filter((p) => perkCategory === "All" || p.categories.includes(perkCategory)).map((p) => `
  <div class="pk-card-frame">
    <button class="pk-card" type="button" data-perk>
      <span class="pk-logo"><img src="${PK}${p.logo}" alt="" /></span>
      <span class="pk-text">
        <span class="pk-brand">${p.brand}</span>
        <span class="pk-lines"><span class="pk-title">${p.title}</span><span class="pk-offer">${p.offer}</span></span>
      </span>
    </button>
  </div>`).join("");
const ACCOUNT = [
  { title: "Manage plan", rows: [
    { title: "My plan", detail: "Manage & view plan details", end: "caret" },
    { title: "Thrive wallet", detail: "Manage & view balance", end: "caret" },
    { title: "Data usage", detail: "Manage & view data", end: "caret" },
    { title: "Lifeline benefit", detail: "Manage Lifeline", end: "caret" },
  ] },
  { title: "Personal details", rows: [
    { title: "Name", detail: "John Carter", end: "caret" },
    { title: "Address", detail: "4213 Old Hillsboro Rd\nLeiper’s Fork, TN 37064", end: "caret" },
    { title: "Your phone number", detail: "+1 615-555-0147", end: "copy" },
    { title: "Email address", detail: "john.carter@gmail.com", end: "copy" },
  ] },
  { title: "Thrive settings", rows: [
    { title: "Check-in time", detail: "Mondays, 9:30 AM", end: "caret" },
    { title: "Important contacts", detail: "Humana Member Services · 24/7 Nurse Line", end: "caret" },
    { title: "Location sharing", detail: "On for ER visits", end: "caret" },
  ] },
  { title: "Notices", rows: [
    { title: "Terms & conditions", end: "out" },
    { title: "Privacy policy", end: "out" },
  ] },
];
const ACCOUNT_END = { caret: "caret-right", copy: "copy", out: "arrow-square-out" };

const DESTINATIONS = {
  // Widget 1: today's hand-off. The widget opens the MyHumana app, which asks the member to sign in first.
  myhumana: {
    title: "MyHumana",
    variant: "myhumana",
    // Mocked after the MyHumana app's welcome screen: sky line art, the MyHumana mark, "Your health plan in
    // your pocket", password / Face ID sign-in, and the home-under-a-dome illustration at the foot.
    // The art is drawn here in the app's line-art style (not Humana's own files). Signing in isn't part of the demo.
    html: () => `
      <div class="mh">
        <svg class="mh-sky" viewBox="0 0 360 100" width="360" height="100" aria-hidden="true">
          <g fill="none" stroke="#3d4b63" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="50" cy="54" r="18" fill="#f6d24a" />
            ${Array.from({ length: 14 }, (_, i) => { // short wavy rays
              const t = (i / 14) * Math.PI * 2 - 0.2, r1 = 23, r2 = i % 2 ? 30 : 33, w = i % 2 ? 1.6 : -1.6;
              const P = (r, o = 0) => [50 + Math.cos(t) * r - Math.sin(t) * o, 54 + Math.sin(t) * r + Math.cos(t) * o].map((n) => n.toFixed(1)).join(" ");
              return `<path d="M${P(r1)} Q${P((r1 + r2) / 2, w)} ${P(r2)}" />`; }).join("")}
            <path d="M54 72 a5 5 0 0 1 8 -4 a6 6 0 0 1 11 1 a4 4 0 0 1 2 6 h-21 a3 3 0 0 1 0 -3z" fill="#fff" />
            <path d="M78 75 h6 M80 72 h3" />
            <path d="M22 79 a3.5 3.5 0 0 1 6 -2 a4 4 0 0 1 7 1 a2 2 0 0 1 1 3 h-14 z" fill="#fff" />
            <path d="M151 65 a16 16 0 0 1 32 0 z" fill="#dfe8fb" /><line x1="141" y1="65" x2="190" y2="65" />
            <path d="M257 73 a12 12 0 0 1 21 -8 a19 19 0 0 1 36 3 a5 5 0 0 1 4 5 z" fill="#dfe8fb" /><line x1="246" y1="73" x2="347" y2="73" />
          </g>
        </svg>
        <img class="mh-brand" src="assets/myhumana-logo.svg" width="108" height="22.66" alt="MyHumana" />
        <h2 class="mh-title">Your health plan in your pocket</h2>
        <div class="mh-actions">
          <button class="mh-btn mh-btn--primary" type="button" data-signin>Sign in with password</button>
          <button class="mh-btn mh-btn--secondary" type="button" data-signin>
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6V4a2 2 0 0 1 2-2h2M14 2h2a2 2 0 0 1 2 2v2M18 14v2a2 2 0 0 1-2 2h-2M6 18H4a2 2 0 0 1-2-2v-2" /><path d="M7 7.5v1M13 7.5v1M10 8v3h-1M7.5 13.5q2.5 2 5 0" /></g></svg>
            Sign in with Face ID
          </button>
          <p class="mh-activate">Don’t have an account? <button class="mh-link" type="button" data-signin>Activate now</button></p>
        </div>
        <svg class="mh-home" viewBox="0 0 360 210" width="360" height="210" aria-hidden="true">
          <path d="M0 150 L360 186 V210 H0 Z" fill="#e2efd2" />
          <g stroke="#3d4b63" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M42 150 l4 -38 m12 40 l3 -40" fill="none" />
            <circle cx="44" cy="96" r="20" fill="#bfe0a3" /><circle cx="64" cy="92" r="21" fill="#a9d48b" />
            <path d="M108 176 a90 90 0 0 1 180 0 z" fill="#e6eefb" />
            <path d="M150 112 l48 -22 l48 22 z" fill="#25406b" />
            <rect x="214" y="82" width="10" height="16" fill="#25406b" />
            <rect x="156" y="112" width="84" height="56" fill="#f6d24a" />
            <path d="M174 110 l24 -18 l24 18" fill="none" />
            <circle cx="198" cy="104" r="7" fill="#fff" /><path d="M198 97 v14 M191 104 h14" fill="none" />
            <rect x="166" y="124" width="16" height="14" fill="#fff" /><path d="M174 124 v14 M166 131 h16" fill="none" />
            <rect x="214" y="124" width="16" height="14" fill="#fff" /><path d="M222 124 v14 M214 131 h16" fill="none" />
            <rect x="191" y="140" width="14" height="28" rx="2" fill="#5f8f2d" />
            <path d="M198 66 q-12 -12 -14 -4 q-3 10 14 20 q17 -10 14 -20 q-2 -8 -14 4 z" fill="#78a943" transform="translate(-11.9 -4) scale(1.06)" />
            <path d="M198 70 v10 M193 75 h10" stroke="#fff" stroke-width="2" fill="none" />
            <path d="M130 196 l3 -6 m4 6 l1 -7 M296 200 l2 -6 m5 7 l1 -6" fill="none" />
          </g>
        </svg>
      </div>`,
  },
  // Widget 3: "Schedule an appointment" lands here. Client-Demos thriveGuideFlow08 (9205:36385), drawn
  // as the studio's photo action card (ActionScreen "actionCard02"): Help pill, no header fill.
  findDoctor: {
    title: "Find a doctor",
    variant: "ci-card",
    html: () => `
      <div class="ci-screen">
        ${ciHeader({ progress: STEP_PROGRESS.findDoctor, help: "pill", background: false })}
        <main class="ci-card-area">
          <section class="ci-photo-card" aria-labelledby="ciFindHeading">
            <div class="ci-photo-frame">
              <img class="ci-photo" src="${D}find-doctor-photo.jpg" alt="A doctor going over results with a patient" />
              <span class="ci-photo-badge">${icon("stethoscope")}</span>
            </div>
            <h1 class="ci-h3 ci-photo-heading" id="ciFindHeading">Let’s find you a doctor close to home</h1>
            <p class="ci-photo-caption"><span class="ci-source-label">Covered by</span><img src="${D}logo-humana-13.svg" width="65.5394" height="13.5" alt="Humana" /></p>
            <p class="ci-photo-body ci-small ci-weak">Your yearly wellness visit is covered. Tell us what works and we’ll find a doctor nearby and book it.</p>
            <div class="ci-photo-cta">${ciButton("Find me a doctor", 'data-ci-next="doctors"', { iconName: "sparkle" })}</div>
          </section>
        </main>
        ${ciFooter(ciButton("Not right now", "data-ci-close", { variant: "link" }))}
      </div>`,
  },
  // Studio DoctorsScreen ("Pick your primary care doctor"): one to pick, then Next
  doctors: {
    title: "Pick your doctor",
    variant: "ci",
    html: () => `
      <div class="ci-screen">
        ${ciHeader({ progress: STEP_PROGRESS.doctors })}
        <main class="ci-main">
          ${ciPageHeader("Pick your primary care doctor", "Here are in-network doctors near Leiper’s Fork that are taking new patients.", "ciDocHeading", poweredByDirectory())}
          <div class="ci-doc-list" role="radiogroup" aria-labelledby="ciDocHeading">${DOCTORS.map(doctorCard).join("")}</div>
          <p class="ci-more"><span class="ci-small ci-underline">See more</span>${icon("caret-right", "16")}</p>
        </main>
        ${ciFooter(ciButton("Next", `data-ci-next="times"${booking.doctor === null ? " disabled" : ""}`), { fill: true })}
      </div>`,
  },
  // Studio TimesScreen ("What time works for you?"): day tabs, then that day's times. The calendar
  // button and "Something else…" are shown as in Figma but do nothing.
  times: {
    title: "Pick a time",
    variant: "ci",
    html: () => `
      <div class="ci-screen">
        ${ciHeader({ progress: STEP_PROGRESS.times })}
        <main class="ci-main">
          ${ciPageHeader("What time works for you?", "Tap a time below, or tell us what you’re looking for.")}
          <div class="ci-card-frame">
            <div class="ci-times-card">
              <div class="ci-tabs-row">
                <div class="ci-tabs" role="tablist" aria-label="Day">${dayTabs()}</div>
                <span class="ci-cal" aria-hidden="true">${icon("calendar-blank", "cal")}</span>
              </div>
              <p class="ci-day-title ci-upper" id="ciDay">${dayTitle(booking.day)}</p>
              <div class="ci-times" role="radiogroup" aria-labelledby="ciDay">${timeChips()}</div>
              <div class="ci-free" aria-hidden="true">
                <div class="ci-entry">
                  <span class="ci-entry-btn">${icon("pencil-simple", "20")}</span>
                  <span class="ci-entry-text ci-small">Something else…</span>
                  <span class="ci-entry-btn ci-entry-btn--brand">${icon("sparkle-fill", "20")}</span>
                </div>
                <p class="ci-entry-hint ci-tiny">Eg. “Saturday afternoons”</p>
              </div>
            </div>
          </div>
        </main>
        ${ciFooter(ciButton("Next", `data-ci-next="confirm"${booking.pick ? "" : " disabled"}`))}
      </div>`,
  },
  // Studio DetailsScreen ("Confirm your details")
  confirm: {
    title: "Confirm your details",
    variant: "ci",
    html: () => `
      <div class="ci-screen">
        ${ciHeader({ progress: STEP_PROGRESS.confirm })}
        <main class="ci-main">
          ${ciPageHeader("Confirm your details", "We’ll share these with the clinic to book your visit.")}
          <div class="ci-card-frame">
            <dl class="ci-details">${MEMBER.map(([k, v], i) => `${i ? '<span class="ci-line" aria-hidden="true"></span>' : ""}<div class="ci-item ci-small"><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
          </div>
        </main>
        ${ciFooter(ciButton("Looks good, book it", 'data-ci-next="booked"') + ciButton("Edit details", "data-ci-edit", { variant: "secondary" }), { fill: true })}
      </div>`,
  },
  // Studio AppointmentScreen ("You’re all set"): names the doctor and time picked. Its buttons only
  // mark themselves done (a second tap clears it).
  booked: {
    title: "You’re all set",
    variant: "ci",
    html: () => {
      const doc = DOCTORS[booking.doctor];
      return `
      <div class="ci-screen">
        ${ciHeader({ progress: STEP_PROGRESS.booked })}
        <main class="ci-main">
          ${ciPageHeader("You’re all set, John")}
          <div class="ci-card-frame">
            <section class="ci-appt" aria-label="Confirmed appointment">
              <span class="ci-badge-frame"><span class="ci-badge ci-badge--success ci-upper">Confirmed</span></span>
              <p class="ci-when ci-small-bold">${slotLabel()}</p>
              <div class="ci-appt-body ci-tiny">
                <p>Annual Wellness Visit with ${doc.name}</p>
                <p>${doc.practice}<br />${doc.address}</p>
              </div>
              <div class="ci-actions">${APPT_ACTIONS.map(([label, name]) =>
                `<button class="ci-action ci-tiny-bold" type="button" aria-pressed="false" data-ci-action>${icon(name, "16")}<span class="ci-action-label">${label}</span></button>`).join("")}</div>
            </section>
          </div>
        </main>
        ${ciFooter(ciButton("Next", 'data-ci-next="done"'))}
      </div>`;
    },
  },
  // Studio EndScreen (Figma "M1 - end"): the check-ins' Success Lottie over the gradient, the bar full,
  // no back arrow; plus the Humana preset's "Brought to you by Humana" above Done. Done goes back to the widget.
  done: {
    title: "See you there",
    variant: "ci-end",
    html: () => `
      <div class="ci-screen">
        <div class="ci-gradient" aria-hidden="true"><img class="ci-gradient-green" src="${K}gradient-green.svg" alt="" /><img class="ci-gradient-blue" src="${K}gradient-blue.svg" alt="" /></div>
        ${ciHeader({ progress: 1, background: false, back: false })}
        <div class="ci-message">
          <div class="ci-message-top"><div class="ci-success-anim" id="ciSuccess" role="img" aria-label="Booking complete"></div></div>
          <div class="ci-message-middle">
            <h1 class="ci-h4">See you at your visit</h1>
            <p class="ci-small ci-weak">We’ll send you a reminder the day before.</p>
          </div>
        </div>
        <div class="ci-client">
          <p class="ci-upper ci-weak">Brought to you by</p>
          <img src="${K}humana-logo.svg" width="100.669" height="20.736" alt="Humana" />
        </div>
        ${ciFooter(ciButton("Done", "data-ci-close"))}
      </div>`,
  },
  // Healthy Spending Card (Figma 2737:10925): purse name + available balance only, named as on the Nations
  // portal. No "lives in Care hub" copy: it opens with Care hub underneath, which shows where it lives.
  flex: {
    title: "Healthy Spending Card",
    core: true,
    html: () => `
      ${pageHeader("Healthy Spending Card", "View your available balance for each benefit.")}
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
  // One purse (tap a purse on the Healthy Spending Card page). A sub-page, laid out like the app's other detail
  // pages (Figma drafts/v2 references): perksDetailExpanded for the header (minus the brand eyebrow) and accordions, the
  // Thrive wallet's walletBalance card for the balance. No tab bar on sub-pages.
  // The balance always reads "Available balance" with the time it was fetched, so it can't be
  // mistaken for the purse's total (Molina feedback, 11/6). Copy is placeholder; see NATIONS_PURSES.
  purse: {
    title: "Healthy Spending Card",
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
      </div>`;
    },
  },
  // Care hub (Figma 6283:1802): tab root, so no back arrow
  // Home tab: Figma Core App Experience "homeMDM - None available" (5513:10984). Available / Completed
  // switch in place; there are no check-ins to show in this prototype.
  thrivehome: {
    title: "Home",
    core: true,
    root: true,
    tab: "home",
    html: () => `
      ${pageHeader("Hi John!")}
      <div class="th-divider"><span></span></div>
      ${section("Latest check-ins")}
      <div class="th-tabs" role="tablist" aria-label="Check-ins">${["Available", "Completed"].map((t, i) =>
        `<button class="th-tab${i === homeTab ? " is-on" : ""}" type="button" role="tab" aria-selected="${i === homeTab}" data-home-tab="${i}">${t}</button>`).join("")}</div>
      <div class="th-status">${homeStatus()}</div>`,
  },
  // Perks tab (navigator PerksTab): category pills narrow the offers
  perks: {
    title: "Perks",
    core: true,
    root: true,
    tab: "perks",
    html: () => `
      ${pageHeader("Perks", "Tap to redeem your exclusive offers.")}
      <div class="pk-pills" role="tablist" aria-label="Perk categories">${perkPills()}</div>
      <div class="pk-cards">${perkCards()}</div>
      <div class="pk-end"></div>`,
  },
  // Account tab (navigator AccountTab)
  account: {
    title: "Account",
    core: true,
    root: true,
    tab: "account",
    html: () => `
      ${pageHeader("Account")}
      <div class="ac">${ACCOUNT.map((g, gi) => `
        <section aria-labelledby="acGroup${gi}">
          <h3 class="ac-group" id="acGroup${gi}">${g.title}</h3>
          <ul class="ac-list">${g.rows.map((r) => `
            <li><button class="ac-row" type="button"${r.end === "copy" ? ` data-copy="${r.detail}" aria-label="${r.title}: ${r.detail}. Copy"` : ""}>
              <span class="ac-text"><span class="ac-title">${r.title}</span>${r.detail ? `<span class="ac-detail">${r.detail}</span>` : ""}</span>
              ${icon(ACCOUNT_END[r.end])}
            </button></li>`).join("")}</ul>
        </section>`).join("")}</div>`,
  },
  home: {
    title: "Care hub",
    core: true,
    root: true,
    html: () => `
      ${pageHeader("Care hub", "Easy access to all the tools and services your Humana plan offers.")}
      <div class="ch-member">
        <span class="ch-member-icon"><img src="${C}logo-humana-symbol.svg" width="17.6" height="22" alt="" /></span>
        <span><span class="ch-member-label">Humana member ID</span><span class="ch-member-id">W123456789</span></span>
      </div>
      ${bookedVisit ? `${section("Upcoming appointments")}${visitCard(bookedVisit)}` : ""}
      ${section("Your benefits")}
      <div class="ch-pad">
        <button class="ch-nav-card" data-goto="flex" type="button">
          <span class="ch-nav-main">
            <span class="ch-circle ch-circle--48"><img src="${C}icon-cardholder-24.svg" width="24" height="24" alt="" /></span>
            <span class="ch-nav-text"><span class="ch-nav-title">Healthy Spending Card</span><span class="ch-nav-body">Check your card’s balances</span></span>
            <img src="${C}icon-caret-right-20.svg" width="20" height="20" alt="" />
          </span>
          <span class="ch-nav-foot">Last updated at ${timeNow()}</span>
        </button>
      </div>
      <div class="ch-spacer"></div>
      ${section("Contacts")}
      <div class="ch-hscroll">
        ${CONTACTS.map((c) => `
        <button class="ch-contact" type="button"${c.call ? ` data-call="${c.call}"` : ""}>
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
            <img class="ch-app-logo" src="${C}${a.img}" width="64" height="64" alt="" />
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
  const radius = el.classList.contains("dock-app") ? r.w * 0.26 : 16; // a dock icon: its rounded-square corners
  return {
    transform: `translate(${r.x}px, ${r.y}px) scale(${k})`,
    clipPath: `inset(0px 0px ${Math.max(0, H - r.h / k)}px 0px round ${radius / k}px)`,
  };
}
// Full screen has square corners (the real screen supplies its own)
const screenRadius = () => (document.documentElement.classList.contains("full") ? 0 : 32);
const fullWindow = () => ({ transform: "translate(0px, 0px) scale(1)", clipPath: `inset(0px 0px 0px 0px round ${screenRadius()}px)` });
const appLayers = () => [...appScreen.children];
const homeLayers = () => [...phone.querySelectorAll(".widget-frame, .home-dots, .dock-app")];

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
  const full = fullWindow();
  launchAnims.push(appScreen.animate(opening ? [from, full] : [full, from], opts));
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
//   The notes keep their size: when they're taller than the window, their column scrolls.
// · Stacked: only when the window is too narrow for the notes beside the phone (phones, small
//   windows): phone on top, notes below, and the page scrolls.
const NOTES_MIN = 320;   // narrowest readable notes column
const notesPanel = document.querySelector(".notes");
// Full screen: the frame is scaled to the screen width, and its height is whatever the screen's shape
// gives (fills it edge to edge). If that's too short for the layout (landscape, desktop windows),
// keep the 360×800 frame and scale it to the window height instead.
const FULL_MIN_H = 560;
function fitDevice() {
  const root = document.documentElement;
  if (root.classList.contains("full")) {
    root.classList.remove("stacked");
    notesPanel.style.zoom = "";
    let s = window.innerWidth / 360;
    let h = window.innerHeight / s;
    if (h < FULL_MIN_H) { s = window.innerHeight / 800; h = 800; }
    root.style.setProperty("--s", s.toFixed(4));
    root.style.setProperty("--ph", `${h.toFixed(2)}px`);
    return;
  }
  root.style.removeProperty("--ph");
  const availH = window.innerHeight - 48;
  const sideScale = Math.min(1, availH / 800);
  const notesW = window.innerWidth - 48 - 40 - 360 * sideScale;
  notesPanel.style.zoom = "";
  if (notesW >= NOTES_MIN) {
    root.classList.remove("stacked");
    root.style.setProperty("--s", sideScale.toFixed(4));
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

/* The mobile view: the page with ?full (just the phone, filling the screen). On an iPhone or Android
   phone it offers the "Full screen" pill (fullscreen-guide.js) to add it to the home screen. */
const fullUrl = () => `${location.origin}${location.pathname}?full&widget=${phone.dataset.widget || "1"}`;
// The mobile view (?full, on the widget shown now) in a new tab
document.getElementById("openMobileView").addEventListener("click", () => window.open(fullUrl(), "_blank", "noopener"));
// Copy link: the Share dialog (mobile-view-share.js), for the mobile view (with its QR code, to open it
// on a phone) or this project page
const projectUrl = () => `${location.origin}${location.pathname}?widget=${phone.dataset.widget || "1"}`;
document.getElementById("shareMobileView").addEventListener("click", () => window.shareMobileView?.({ mobile: fullUrl(), project: projectUrl() }));
// Notes content changes height (widget switch, Android notes, Dropped open/closed) → re-fit
new ResizeObserver(queueFit).observe(notesPanel);
fitDevice();

let appStack = []; // in-app navigation, so Back from Healthy Spending Card returns to Care Hub
function renderApp() {
  const { key, opts } = appStack[appStack.length - 1];
  const dest = DESTINATIONS[key];
  appTitle.textContent = dest.title;
  appScreen.classList.toggle("app-screen--core", !!dest.core);
  appScreen.classList.toggle("app-screen--sub", !!dest.sub); // sub-page: no tab bar
  appScreen.dataset.variant = dest.variant || ""; // screens with their own look (MyHumana, find a doctor)
  appBack.hidden = !!dest.root && appStack.length === 1;
  // Bottom nav: the tab this page belongs to (Care hub's own pages under Care hub)
  document.querySelectorAll("#appNav [data-tab]").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === (dest.tab || "carehub")));
  appBody.innerHTML = dest.html(opts);
  appBody.scrollTop = 0;
  if (dest.variant?.startsWith("ci")) { enterCheckin(); playSuccess(); } // studio check-in screens: progress eases on
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

// Widget 1 is today's widget: its links hand off to the MyHumana app instead
document.querySelectorAll("[data-open]").forEach((el) => {
  el.addEventListener("click", () => openApp(phone.dataset.widget === "1" ? "myhumana" : el.dataset.open, el.closest(".card") || el));
});
// Dock: Thrive opens the Thrive app (its Home tab), MyHumana its sign-in, each growing out of its icon
document.getElementById("dockThrive").addEventListener("click", (e) => openApp("thrivehome", e.currentTarget));
document.getElementById("dockHumana").addEventListener("click", (e) => openApp("myhumana", e.currentTarget));
// Widget 3
// Before booking: "Schedule an appointment" starts the booking flow. Once booked: "View my appointment"
// opens Care hub, which lists the visit under Upcoming appointments.
document.getElementById("dynCard").addEventListener("click", (e) => {
  if (bookedVisit) { openApp("home", e.currentTarget); return; }
  resetBooking(); ciProgress = 0; loadLottie().catch(() => {}); loadSuccess().catch(() => {}); openApp("findDoctor", e.currentTarget);
});
const w3ChipLabel = document.getElementById("w3ChipLabel");
const w3Greeting = document.getElementById("w3Greeting");
const updateW3 = () => {
  w3Greeting.innerHTML = bookedVisit ? "<b>Hi John,</b> you’ve booked your annual wellness checkup!" : "<b>Hi John,</b> it’s time for your annual wellness checkup!";
  w3ChipLabel.textContent = bookedVisit ? "View my appointment" : "Schedule an appointment";
};
document.getElementById("w3Flex").addEventListener("click", (e) => openApp("flex", e.currentTarget, { source: "widget" }));
appBack.addEventListener("click", () => {
  if (appStack.length > 1) { appStack.pop(); renderApp(); }
  else closeApp();
});
// Bottom nav: Home, Perks, Care hub and Account switch tabs
const NAV_TABS = { home: "thrivehome", perks: "perks", carehub: "home", account: "account" };
document.getElementById("appNav").addEventListener("click", (e) => {
  const key = NAV_TABS[e.target.closest("[data-tab]")?.dataset.tab];
  if (key) { appStack = [{ key, opts: {} }]; renderApp(); }
});
document.getElementById("appHelp").addEventListener("click", () => openDialer("member"));
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
  showHandle(HANDLE_ARMED_MS); // the glow points at the handle, so it shows
  homePulse.classList.remove("show");
  reflow(homePulse);
  homePulse.classList.add("show");
}
const stopHomePulse = () => homePulse.classList.remove("show");
homePulse.addEventListener("animationend", (e) => { if (e.target === homePulse.lastElementChild) stopHomePulse(); });
appScreen.addEventListener("click", (e) => {
  const hit = e.target.closest("button, a, [data-goto], [data-call]");
  const tab = hit?.dataset.tab;
  if (!hit || (tab && !NAV_TABS[tab])) return pulseHome();
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
  // Home: Available / Completed
  const homeTabBtn = e.target.closest("[data-home-tab]");
  if (homeTabBtn) {
    homeTab = Number(homeTabBtn.dataset.homeTab);
    appBody.querySelectorAll("[data-home-tab]").forEach((b) => { const on = b === homeTabBtn; b.classList.toggle("is-on", on); b.setAttribute("aria-selected", on); });
    appBody.querySelector(".th-status").innerHTML = homeStatus();
    return;
  }
  // Perks: a pill narrows the offers (in place, so the pills keep their scroll); an offer goes nowhere
  const perkCat = e.target.closest("[data-perk-cat]");
  if (perkCat) {
    perkCategory = perkCat.dataset.perkCat;
    appBody.querySelectorAll("[data-perk-cat]").forEach((b) => { const on = b === perkCat; b.classList.toggle("is-on", on); b.setAttribute("aria-selected", on); });
    appBody.querySelector(".pk-cards").innerHTML = perkCards();
    return;
  }
  if (e.target.closest("[data-perk]")) return;
  // Account: the phone number and email copy themselves
  const copyRow = e.target.closest("[data-copy]");
  if (copyRow) {
    const text = copyRow.dataset.copy;
    navigator.clipboard?.writeText(text).catch(() => {});
    const detail = copyRow.querySelector(".ac-detail");
    detail.textContent = "Copied";
    setTimeout(() => { if (detail.isConnected) detail.textContent = text; }, 1500);
    return;
  }
  if (e.target.closest("[data-signin]")) { toast("Signing in isn’t part of this demo"); return; }
  // Find a doctor screens (studio check-in flow)
  if (e.target.closest("[data-ci-back]")) { appBack.click(); return; }
  if (e.target.closest("[data-ci-close]")) { closeApp(); return; }
  if (e.target.closest("[data-ci-help]")) { openDialer("member"); return; }
  if (e.target.closest("[data-ci-edit]")) { toast("Editing details isn’t part of this demo"); return; }
  const ciNext = e.target.closest("[data-ci-next]");
  if (ciNext) {
    if (ciNext.disabled) return;
    // "Looks good, book it": the visit is booked, so Care hub lists it from now on
    if (ciNext.dataset.ciNext === "booked") { bookedVisit = { doctor: booking.doctor, date: dayAt(booking.pick.day), time: booking.pick.time }; updateW3(); }
    appStack.push({ key: ciNext.dataset.ciNext, opts: {} }); renderApp();
    return;
  }
  const doctor = e.target.closest("[data-ci-doctor]");
  if (doctor) { pickDoctor(Number(doctor.dataset.ciDoctor)); return; }
  const day = e.target.closest("[data-ci-day]");
  if (day) { showDay(Number(day.dataset.ciDay)); return; }
  const time = e.target.closest("[data-ci-time]");
  if (time) { booking.pick = { day: booking.day, time: time.dataset.ciTime }; appBody.querySelector(".ci-times").innerHTML = timeChips(); setNextEnabled(true); return; }
  const apptAction = e.target.closest("[data-ci-action]");
  if (apptAction) { const on = apptAction.getAttribute("aria-pressed") !== "true"; apptAction.setAttribute("aria-pressed", on); apptAction.classList.toggle("is-on", on); return; }
  const acc = e.target.closest("[data-accordion]");
  if (acc) { toggleAccordion(acc); return; }
  const call = e.target.closest("[data-call]");
  if (call) { openDialer(call.dataset.call); return; }
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

/* ---------- Healthy Spending Card purses ----------
   Content + icons from Figma 2663:16237 / 2664:16248 / 2664:16318.
   One purse per card — never summed (per the flexCard/purseCard note in Figma). */
let N = NATIONS_PURSES.length;
const DURATION = 450;
const PAGE_TURN_MS = 700; // Page turn look (styles.css @keyframes v4-page-turn)

// Each card is one collection item: label, icon AND hint (arrow / dots) are drawn inside it,
// so they stay correct even when the launcher advances the widget on its own.
// Purse labels on the widget: "short" = the Figma widget frames (3 purses, 2-line labels),
// "portal" = the Nations portal names from the Healthy Spending Card page (4 purses, name clamped to 2 lines).
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
// Widget → Healthy Spending Card list. Android: the item's fill-in intent carries source=widget.
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
    if (phone.classList.contains("app-open") || phone.classList.contains("dialer-open") || drag) return;
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

/* Widget 1 = today's widget: static call tiles ("no"); its links open MyHumana.
   Widget 2 = flippable purse tile ("pager"). (Swapped from the Healthy Spending Card prototype.)
   Widget 3 = dynamic: a personal next-step card, a Healthy Spending Card tile and two call tiles
   (its own markup, .w3; data-widget="3").
   ?widget=1|2|3 in the address opens on that widget (the phone link uses it). */
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
  phone.dataset.answer = value;
  notes.dataset.answer = value;
  if (value === "pager") startAuto(); else stopAuto();
}
function setWidget(n) {
  if (!["1", "2", "3"].includes(n)) n = "1";
  phone.dataset.widget = n;
  notes.dataset.widget = n;
  widgetInputs.forEach((r) => (r.checked = r.value === n));
  setAnswer(n === "2" ? "pager" : w2Version);
  topLink.textContent = n === "3" ? "See benefits" : "See more";
  // Home page 2's restart only starts Widget 3 over, so it's off for Widgets 1 and 2
  const restart = document.getElementById("demoRestart");
  restart.disabled = n !== "3";
  restart.title = n === "3" ? "" : "Restart is for Widget 3";
}
const topLink = document.querySelector(".widget-top-bar .link");
// Switching widgets from the project page while the phone is in an app (or the dialer, or on home page
// 2): back to the home screen's first page, so the new widget is what shows. The app fades out rather
// than folding into the widget it opened from (that widget may not be on screen any more).
function backToWidget() {
  closeDemoMenu();
  if (phone.classList.contains("dialer-open")) closeDialer();
  if (phone.classList.contains("app-open")) {
    stopLaunch();
    launchFrom = null;
    appScreen.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduceMotion.matches ? 0 : 200, easing: "ease-out" });
    closeApp();
  }
  goToHomePage(0, { instant: true });
}
const showWidget = (n) => { setWidget(n); backToWidget(); };
answerInputs.forEach((r) => r.addEventListener("change", () => { w2Version = r.value; showWidget("1"); }));
widgetInputs.forEach((r) => r.addEventListener("change", () => showWidget(r.value)));
// Touching any flippable-tile option switches to a widget that has it (Widget 2)
const toPager = () => { if (phone.dataset.answer !== "pager") showWidget("2"); };
document.querySelectorAll("#modeControls, #hintControls, #namesControls").forEach((f) => f.addEventListener("change", toPager));
document.querySelectorAll("#hintRecommended, #hintFigma").forEach((b) => b.addEventListener("click", toPager));

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
setWidget(new URLSearchParams(location.search).get("widget") || widgetInputs.find((r) => r.checked).value);

/* Android engineering notes: hidden by default; the toggle shows them (remembered on this device) */
const androidToggle = document.getElementById("androidToggle");
const setAndroidNotes = (on) => {
  androidToggle.checked = on;
  notes.classList.toggle("show-android", on);
  try { localStorage.setItem("humana-fcv-forum:android-notes", on ? "1" : "0"); } catch {}
};
androidToggle.addEventListener("change", () => setAndroidNotes(androidToggle.checked));
setAndroidNotes((() => { try { return localStorage.getItem("humana-fcv-forum:android-notes") === "1"; } catch { return false; } })());

/* ---------- Calls: straight to the dialer (as in tht-demo-studio) ----------
   Call tiles and the call rows in the app open the Android dialer with that line filled in.
   Call → "Calling..." → connected (live timer) → End call → "Call ended" → back to where it started.
   PLACEHOLDER numbers (555): not real Humana lines. */
const CALLS = {
  member: { name: "Humana Member Services", number: "1-800-555-0142" },
  nurse: { name: "24/7 Nurse Line", number: "1-800-555-0150" },
};
const CALL_MS = { callingToConnected: 800, endedToClose: 800 }; // tht-demo-studio flow/motion.ts
const dialer = document.getElementById("dialer");
const dlStatus = document.getElementById("dlStatus");
const dlEnd = document.getElementById("dlEnd");
const dlFits = ["dlName", "dlCaller", "dlNumber"].map((id) => document.getElementById(id));
document.getElementById("dlKeypad").innerHTML = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"], ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"], ["#"], ["0", "+"], ["*"],
].map(([d, l]) => `<button class="dl-key" type="button" aria-label="${l ? `${d} ${l}` : d}">
  <span class="${d === "#" ? "t-android-headline" : "t-android-display"}">${d}</span>${l !== undefined ? `<span class="t-android-caption">${l}</span>` : ""}</button>`).join("");

// Android shrinks a long name a little to fit, then (here) ends it in "…"
function fitLine(el) {
  el.style.fontSize = "";
  const room = el.clientWidth, width = el.scrollWidth; // both include the side padding
  if (room > 0 && width > room) {
    const base = parseFloat(getComputedStyle(el).fontSize);
    el.style.fontSize = `${Math.max(base - 6, Math.floor(base * room / width))}px`;
  }
}
const fitDialer = () => dlFits.forEach((el) => el.offsetParent && fitLine(el));

let callTimers = [];
const clearCallTimers = () => { callTimers.forEach(clearTimeout); clearInterval(callTimers.tick); callTimers = []; };
function setCallState(state) {
  dialer.dataset.state = state;
  dlEnd.disabled = state === "ended";
  if (state === "calling") dlStatus.textContent = "Calling...";
  if (state === "ended") dlStatus.textContent = "Call ended";
  fitDialer();
}
function openDialer(kind = "member") {
  const line = CALLS[kind] || CALLS.member;
  clearCallTimers();
  dlFits[0].firstElementChild.textContent = line.name;
  dlFits[1].firstElementChild.textContent = line.name;
  dlFits[2].firstElementChild.textContent = line.number;
  dialer.setAttribute("aria-label", `Call ${line.name}`);
  phone.classList.add("dialer-open");
  dialer.setAttribute("aria-hidden", "false");
  setCallState("dial");
}
function closeDialer() {
  clearCallTimers();
  phone.classList.remove("dialer-open");
  dialer.setAttribute("aria-hidden", "true");
}
document.getElementById("dlCall").addEventListener("click", () => {
  setCallState("calling");
  callTimers.push(setTimeout(() => {
    setCallState("connected");
    const start = Date.now();
    const tick = () => {
      const s = Math.floor((Date.now() - start) / 1000);
      dlStatus.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    };
    tick();
    callTimers.tick = setInterval(tick, 250);
  }, CALL_MS.callingToConnected));
});
dlEnd.addEventListener("click", () => {
  clearCallTimers();
  setCallState("ended");
  callTimers.push(setTimeout(closeDialer, CALL_MS.endedToClose));
});
callTile.addEventListener("click", () => openDialer("member"));
document.getElementById("nurseTile").addEventListener("click", () => openDialer("nurse"));
document.getElementById("w3Member").addEventListener("click", () => openDialer("member"));
document.getElementById("w3Nurse").addEventListener("click", () => openDialer("nurse"));

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
  // Already on the home screen: Home goes back to the first page, as on Android
  const onHome = !phone.classList.contains("app-open") && !phone.classList.contains("dialer-open");
  closeDialer();
  closeApp();
  if (onHome) { closeDemoMenu(); goToHomePage(0); }
}
/* The gesture handle fades away when it isn't needed, as in an Android app in full screen (tht-demo-studio
   navigator/voice, GestureBar's ImmersiveBar): it shows as a screen opens (an app, the dialer, back home,
   the page loading), then fades. Touching or swiping the bar brings it back (it stays while the finger is
   down), as does a mouse over it, and the glow after a tap that goes nowhere. The bar works whether the
   handle shows or not. */
const HANDLE_ARRIVAL_MS = 1500; // showing, by itself, when a screen opens
const HANDLE_ARMED_MS = 2000;   // showing after a touch, a short swipe or the glow
const gestureBarEl = document.getElementById("gestureBar");
let handleTimer = 0;
function showHandle(ms) {
  gestureBarEl.classList.add("is-shown");
  clearTimeout(handleTimer);
  if (ms) handleTimer = setTimeout(() => gestureBarEl.classList.remove("is-shown"), ms);
}
gestureBarEl.addEventListener("pointerdown", () => showHandle(0));
gestureBarEl.addEventListener("pointerup", () => showHandle(HANDLE_ARMED_MS));
gestureBarEl.addEventListener("pointercancel", () => showHandle(HANDLE_ARMED_MS));
// A new screen: an app or the dialer opening or closing
{
  let was = "";
  const screenNow = () => ["app-open", "dialer-open"].filter((c) => phone.classList.contains(c)).join(" ");
  new MutationObserver(() => {
    const now = screenNow();
    if (now !== was) { was = now; showHandle(HANDLE_ARRIVAL_MS); }
  }).observe(phone, { attributes: true, attributeFilter: ["class"] });
  was = screenNow();
}
showHandle(HANDLE_ARRIVAL_MS);
document.getElementById("gestureBar").addEventListener("click", goHome);
/* Swipe up on the gesture bar: tht-demo-studio's (navigator/voice: src/shell/GestureBar.tsx, and App's
   'home' transition, src/flow/motion.ts T_HOME / HOME_EXIT), as Android does it. The open screen (the app,
   the dialer) follows the finger: rising, shrinking, its corners rounding, the home screen showing behind
   it. Let go far enough up, or flick, and it flies off up and away (shrinking to half, fading) as the home
   screen settles in from a slight zoom; short of that it springs back, and the glow at the handle hints the
   way. On the home screen a swipe up goes
   home as a tap does. A tap still goes home (the click above); the click after a swipe is swallowed.
   Mobile view on a real phone: a swipe that starts just above the bar is caught too (useCatchAbove). */
{
  const SWIPE_PX = 28;       // screen px up, when let go, that goes home
  const FLICK_PX = 12;       // a quick flick counts sooner: this far up…
  const FLICK_SPEED = 0.35;  // …moving at least this fast (px/ms) when let go
  const TAP_PX = 6;          // under this it was a tap
  const FULL_PX = 400;       // how far up (phone px) the screen shrinks as far as it does while following
  const CATCH_ABOVE_PX = 28; // mobile view: a swipe starting this far (phone px) above the bar is caught
  const CATCH_SLOP_PX = 8;   // …once it has moved this far (screen px) up, mostly upward
  const HOME_EASE = "cubic-bezier(0.2, 0, 0, 1)";
  const HOME_MS = 350;
  const bar = document.getElementById("gestureBar");
  const dialerLayer = document.getElementById("dialer");
  const openLayers = () => [
    phone.classList.contains("app-open") && appScreen,
    dialerLayer && phone.classList.contains("dialer-open") && dialerLayer,
  ].filter(Boolean);
  const phonePx = () => phone.offsetWidth / phone.getBoundingClientRect().width || 1; // screen px → phone px
  const PROPS = ["transformOrigin", "translate", "scale", "clipPath", "transition"];
  const clear = (el) => PROPS.forEach((k) => (el.style[k] = ""));
  let drag = null; // { id, y, dy, t, speed, layers }
  let swallowClick = false;

  // The gesture bar isn't inside the screen (it's the phone's), so it gets the same move, shrink and
  // turn-point as the screen: it rides along at the screen's bottom edge and flies off with it.
  const barOrigin = (layer) => `50% ${layer.offsetTop + layer.offsetHeight / 2 - bar.offsetTop}px`;
  function follow(layers, dy) {
    const d = Math.max(0, dy) * phonePx();
    const p = Math.min(1, d / FULL_PX);
    layers.forEach((el) => {
      el.style.transition = "none";
      el.style.transformOrigin = "50% 50%";
      el.style.translate = `0 ${-d * 0.6}px`;
      el.style.scale = String(1 - p * 0.3);
      el.style.clipPath = `inset(0 round ${Math.max(screenRadius(), p * 32)}px)`;
    });
    bar.style.transition = "none";
    bar.style.transformOrigin = barOrigin(layers[0]);
    bar.style.translate = `0 ${-d * 0.6}px`;
    bar.style.scale = String(1 - p * 0.3);
  }
  function springBack(layers) {
    bar.style.transition = `translate 200ms ${HOME_EASE}, scale 200ms ${HOME_EASE}`;
    bar.style.translate = bar.style.scale = "";
    setTimeout(() => { if (!drag) clear(bar); }, 220);
    layers.forEach((el) => {
      el.style.transition = `translate 200ms ${HOME_EASE}, scale 200ms ${HOME_EASE}, clip-path 200ms ${HOME_EASE}`;
      el.style.translate = el.style.scale = el.style.clipPath = "";
      setTimeout(() => { if (!drag) clear(el); }, 220);
    });
  }
  function flyHome(layers) {
    const ms = reduceMotion.matches ? 1 : HOME_MS;
    const up = `0 ${-0.3 * layers[0].offsetHeight}px`; // HOME_EXIT's y: -30% of the screen
    const anims = layers.map((el) => el.animate([
      { translate: el.style.translate || "0 0", scale: el.style.scale || "1", opacity: 1, clipPath: el.style.clipPath || `inset(0 round ${screenRadius()}px)` },
      { translate: up, scale: "0.5", opacity: 0, clipPath: "inset(0 round 32px)" },
    ], { duration: ms, easing: HOME_EASE, fill: "forwards" }));
    // The gesture bar flies off with it
    bar.style.transformOrigin = barOrigin(layers[0]);
    anims.push(bar.animate([
      { translate: bar.style.translate || "0 0", scale: bar.style.scale || "1", opacity: 1 },
      { translate: up, scale: "0.5", opacity: 0 },
    ], { duration: ms, easing: HOME_EASE, fill: "forwards" }));
    // The home screen settles in from a slight zoom underneath
    homeLayers().forEach((el) => el.animate([{ scale: "1.06" }, { scale: "1" }], { duration: ms, easing: HOME_EASE }));
    Promise.all(anims.map((a) => a.finished)).catch(() => {}).then(() => {
      launchFrom = null; // gone home already: no folding back into the widget
      goHome();
      layers.forEach(clear);
      clear(bar);
      anims.forEach((a) => a.cancel());
    });
  }

  function begin(id, y, fromY = y) {
    try { bar.setPointerCapture(id); } catch {}
    const layers = openLayers();
    // The home screen behind shows through as the screen lifts (the app's launch had faded it)
    if (layers.length) stopLaunch();
    drag = { id, y: fromY, dy: fromY - y, t: performance.now(), speed: 0, layers };
    if (layers.length) follow(layers, drag.dy);
  }
  function end(cancelled) {
    const d = drag;
    drag = null;
    if (!d) return;
    if (Math.abs(d.dy) >= TAP_PX) swallowClick = true;
    const flick = d.dy >= FLICK_PX && d.speed >= FLICK_SPEED && performance.now() - d.t < 100;
    if (!cancelled && (d.dy >= SWIPE_PX || flick)) {
      if (d.layers.length) flyHome(d.layers); else goHome();
      return;
    }
    if (d.layers.length) springBack(d.layers);
    // Tried, but not far enough: the glow at the handle hints the way (swipe up from here)
    if (!cancelled && Math.abs(d.dy) >= TAP_PX) pulseHome();
  }

  bar.addEventListener("pointerdown", (e) => { if (e.button === 0) begin(e.pointerId, e.clientY); });
  bar.addEventListener("pointermove", (e) => {
    const d = drag;
    if (!d || e.pointerId !== d.id) return;
    const now = performance.now();
    const dy = d.y - e.clientY;
    if (now > d.t) d.speed = 0.6 * ((dy - d.dy) / (now - d.t)) + 0.4 * d.speed; // upward speed, smoothed
    d.dy = dy;
    d.t = now;
    if (d.layers.length) follow(d.layers, dy);
  });
  bar.addEventListener("pointerup", (e) => { if (drag && e.pointerId === drag.id) end(false); });
  bar.addEventListener("pointercancel", () => end(true));
  bar.addEventListener("click", (e) => { if (swallowClick) { swallowClick = false; e.stopImmediatePropagation(); } }, true);

  // Mobile view: a swipe up that starts on the screen just above the bar is the bar's too. Taps there stay
  // the screen's; only once the finger has moved up, mostly upward, does the bar take it over.
  let down = null;
  document.addEventListener("pointerdown", (e) => {
    down = null;
    if (!document.documentElement.classList.contains("full") || !e.isPrimary || e.button !== 0 || bar.contains(e.target)) return;
    const r = bar.getBoundingClientRect();
    const k = r.height / bar.offsetHeight || 1;
    if (e.clientX < r.left || e.clientX > r.right || e.clientY >= r.top || e.clientY < r.top - CATCH_ABOVE_PX * k) return;
    down = { id: e.pointerId, x: e.clientX, y: e.clientY };
  }, true);
  document.addEventListener("pointermove", (e) => {
    if (!down || e.pointerId !== down.id) return;
    const up = down.y - e.clientY;
    if (up < CATCH_SLOP_PX || up < Math.abs(e.clientX - down.x)) return;
    const from = down.y;
    down = null;
    begin(e.pointerId, e.clientY, from);
  }, true);
  const forget = () => { down = null; };
  document.addEventListener("pointerup", forget, true);
  document.addEventListener("pointercancel", forget, true);
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") goHome();
});

/* ---------- The launcher's pages (tht-demo-studio navigator/voice HomePages) ----------
   Swipe sideways between them (native scrolling, snapping to a page); on desktop a mouse drag does it
   too. The dots show where you are and go to a page when tapped. */
const homePages = document.getElementById("homePages");
const homeDots = [...document.querySelectorAll("[data-home-page]")];
const homePageAt = () => Math.round(homePages.scrollLeft / homePages.clientWidth);
function goToHomePage(i, { instant = false } = {}) {
  homePages.scrollTo({ left: i * homePages.clientWidth, behavior: instant || reduceMotion.matches ? "instant" : "smooth" });
}
const showHomeDot = () => {
  const at = homePageAt();
  homeDots.forEach((d, i) => { d.classList.toggle("is-on", i === at); if (i === at) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
  if (at !== 1) closeDemoMenu();
};
homePages.addEventListener("scroll", showHomeDot, { passive: true });
homeDots.forEach((d) => d.addEventListener("click", () => goToHomePage(Number(d.dataset.homePage))));
// Mouse drag (touch scrolls natively): one page at most, whichever way it was pulled far enough
{
  let drag = null;
  let dragged = false;
  homePages.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag = { x: e.clientX, left: homePages.scrollLeft, base: homePageAt(), dx: 0 };
    dragged = false;
  });
  homePages.addEventListener("pointermove", (e) => {
    if (!drag) return;
    drag.dx = e.clientX - drag.x;
    if (!dragged && Math.abs(drag.dx) < 6) return;
    if (!dragged) { dragged = true; homePages.dataset.dragging = ""; homePages.setPointerCapture(e.pointerId); }
    homePages.scrollLeft = drag.left - drag.dx * (phone.offsetWidth / phone.getBoundingClientRect().width); // screen px → phone px
  });
  const endDrag = () => {
    if (!drag) return;
    const d = drag;
    drag = null;
    delete homePages.dataset.dragging;
    if (!dragged) return;
    const to = Math.abs(d.dx) > 40 ? d.base - Math.sign(d.dx) : d.base;
    goToHomePage(Math.min(homeDots.length - 1, Math.max(0, to)));
  };
  homePages.addEventListener("pointerup", endDrag);
  homePages.addEventListener("pointercancel", endDrag);
  // A drag isn't a tap on whatever it ended over
  homePages.addEventListener("click", (e) => { if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
}

/* ---------- Page 2: demo controls ----------
   The gear opens a menu of the three widgets (same as the Widget setting beside the phone); picking one
   switches to it and turns back to page 1 to show it. Restart starts Widget 3 over: nothing booked, so
   its chip reads "Schedule an appointment" again and Care hub has no Upcoming appointments. */
const demoWidgets = document.getElementById("demoWidgets");
const demoRestart = document.getElementById("demoRestart");
const demoMenu = document.getElementById("demoMenu");
function closeDemoMenu() {
  demoMenu.hidden = true;
  demoWidgets.setAttribute("aria-expanded", "false");
}
demoWidgets.addEventListener("click", () => {
  if (!demoMenu.hidden) { closeDemoMenu(); return; }
  demoMenu.querySelectorAll("[data-demo-widget]").forEach((b) => b.setAttribute("aria-checked", b.dataset.demoWidget === phone.dataset.widget));
  demoMenu.hidden = false;
  demoWidgets.setAttribute("aria-expanded", "true");
  demoMenu.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true });
});
demoMenu.addEventListener("click", (e) => {
  const item = e.target.closest("[data-demo-widget]");
  if (!item) return;
  setWidget(item.dataset.demoWidget);
  closeDemoMenu();
  goToHomePage(0);
});
document.addEventListener("pointerdown", (e) => { if (!demoMenu.hidden && !e.target.closest(".demo-widget")) closeDemoMenu(); });
demoRestart.addEventListener("click", () => {
  bookedVisit = null;
  resetBooking();
  ciProgress = 0;
  updateW3();
  setWidget("3");
  closeDemoMenu();
  demoRestart.classList.remove("is-spinning");
  void demoRestart.offsetWidth;
  demoRestart.classList.add("is-spinning");
  setTimeout(() => goToHomePage(0), reduceMotion.matches ? 0 : 450);
});
demoRestart.addEventListener("animationend", () => demoRestart.classList.remove("is-spinning"));

