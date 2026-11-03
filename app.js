// Widget interaction prototype — v2/link (Android Large 360×800)
const phone = document.getElementById("phone");
const appScreen = document.getElementById("appScreen");
const appTitle = document.getElementById("appTitle");
const appBody = document.getElementById("appBody");
const flexTile = document.getElementById("flexTile");
const callTile = document.getElementById("callTile");
const toastEl = document.getElementById("toast");

// Destinations the widget deep-links into
const DESTINATIONS = {
  benefits: {
    title: "Your benefits",
    html: `
      <div class="app-hero"><h3>Make the most of your plan</h3><p>Here's what your Molina plan covers this year.</p></div>
      <div class="app-row"><span>Dental cleanings</span><span>2 / year</span></div>
      <div class="app-row"><span>Vision exam</span><span>Covered</span></div>
      <div class="app-row"><span>Rides to appointments</span><span>24 left</span></div>
      <div class="app-row"><span>Over-the-counter items</span><span>$50 / qtr</span></div>`,
  },
  flex: {
    title: "Flex Card",
    html: `
      <div class="app-hero"><h3>$515.05 available</h3><p>Use your Flex Card on groceries, OTC items and more.</p></div>
      <div class="app-row"><span>CVS Pharmacy</span><span>&minus;$18.40</span></div>
      <div class="app-row"><span>Walgreens</span><span>&minus;$7.15</span></div>
      <div class="app-row"><span>Next reload · Jan 1</span><span>+$150.00</span></div>`,
  },
  home: {
    title: "Molina Healthcare",
    html: `
      <div class="app-hero"><h3>Welcome back</h3><p>Everything about your plan, in one place.</p></div>
      <div class="app-row"><span>Flex Card</span><span>$515.05</span></div>
      <div class="app-row"><span>Find a doctor</span><span>→</span></div>
      <div class="app-row"><span>ID card</span><span>→</span></div>`,
  },
};

/* ---------- App launch: expand from the tapped element ---------- */
let launchRect = null;

function insetFor(el) {
  const p = phone.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return `inset(${r.top - p.top}px ${p.right - r.right}px ${p.bottom - r.bottom}px ${r.left - p.left}px round 16px)`;
}

function openApp(key, fromEl) {
  const dest = DESTINATIONS[key];
  if (!dest) return;
  appTitle.textContent = dest.title;
  appBody.innerHTML = dest.html;

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
document.getElementById("appBack").addEventListener("click", closeApp);

/* ---------- Flex Card purses ----------
   Content + icons from Figma 2663:16237 / 2664:16248 / 2664:16318.
   One purse per card — never summed (per the flexCard/purseCard note in Figma). */
const FLEX_PURSES = [
  { line1: "Flex Card", line2: "balance",  amount: "$515.05", icon: "icon-currency-circle-dollar.svg" },
  { line1: "Health",    line2: "rewards",  amount: "$375.00", icon: "icon-gift.svg" },
  { line1: "Prepaid",   line2: "benefits", amount: "$143.00", icon: "icon-cardholder.svg" },
];
const N = FLEX_PURSES.length;
const DURATION = 450;

// Each card is one collection item: label, icon AND hint (arrow / dots) are drawn inside it,
// so they stay correct even when the launcher advances the widget on its own.
flexTile.innerHTML = FLEX_PURSES.map((p, i) => `
  <div class="pcard${i === N - 1 ? " is-last" : ""}" data-i="${i}" aria-label="${i + 1} of ${N}">
    <div class="pcard-body">
      <div class="page-text">
        <span class="tile-line">${p.line1}</span>
        <span class="tile-line">${p.line2}</span>
        <span class="tile-line tile-line--strong">${p.amount}</span>
      </div>
      <div class="tile-side">
        <span class="tile-icon"><img src="assets/${p.icon}" width="16" height="16" alt="" draggable="false" /></span>
        <span class="tile-hint">
          <button class="tile-next" data-next type="button" aria-label="Next purse">
            <img src="assets/icon-arrow-down.svg" width="16" height="16" alt="" draggable="false" />
          </button>
          <span class="pager-dots" data-next aria-hidden="true">${FLEX_PURSES.map((_, k) => `<i${k === i ? ' class="on"' : ""}></i>`).join("")}</span>
        </span>
      </div>
    </div>
  </div>`).join("");
const cards = [...flexTile.querySelectorAll(".pcard")];

let page = 0;
let step = 0; // prism: unbounded turn count, so 3 → 1 keeps turning forward instead of rewinding
let busy = false;
let used = false; // member has interacted → stop auto-advance

const mod = (n) => ((n % N) + N) % N;
const reflow = (el) => void el.offsetWidth;
function layout() {
  cards.forEach((c, i) => (c.dataset.depth = mod(i - page)));
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
    step += dir;
    page = mod(step);
    layoutPrism();
    setTimeout(() => (busy = false), PRISM_MS);
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
function userGo(dir) {
  markUsed();
  go(dir);
}

// Hint taps (arrow or dots) → next purse. On Android: setOnClickFillInIntent → showNext().
flexTile.addEventListener("click", (e) => {
  if (e.target.closest("[data-next]")) { e.stopPropagation(); userGo(1); }
});

// Swipe. Only StackView supports it, so flipper mode treats any press as a tap.
let drag = null;
flexTile.addEventListener("pointerdown", (e) => {
  if (e.target.closest("[data-next]") || busy) return;
  drag = { y: e.clientY, dy: 0, id: e.pointerId };
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
  const { dy } = drag;
  drag = null;
  if (flexTile.dataset.mode === "stack") {
    // Undo the drag styling. Only StackView sets it — in prism mode the inline
    // transform is the face's position on the prism and must be left alone.
    const front = cards[page];
    front.classList.remove("dragging");
    front.style.transform = "";
    front.style.opacity = "";
  }
  if (Math.abs(dy) < 6) return openApp("flex", flexTile); // a tap, not a swipe
  if (flexTile.dataset.mode !== "stack") {
    // On a real widget nothing would happen here. Explain it, and point at the tap target.
    if (Math.abs(dy) > 12) {
      toast("Flipper can't swipe. Tap the arrow, or switch to StackView");
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
  if (e.key === "Enter") openApp("flex", flexTile);
});

/* ---------- Auto-advance ----------
   Flipper: android:flipInterval (you choose), stopped with stopFlipping() after the first tap.
   StackView: android:autoAdvanceViewId — the launcher decides the timing. */
let autoTimer = null;
function stopAuto() { clearInterval(autoTimer); autoTimer = null; }
function startAuto() {
  stopAuto();
  if (!phone.hasAttribute("data-auto") || used) return;
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

function setMode(mode) {
  modeInputs.forEach((r) => (r.checked = r.value === mode));
  withoutAnim(cards, () => {
    cards.forEach((c) => { c.classList.remove("exit-up", "enter-top"); c.style.cssText = ""; });
    flexTile.dataset.mode = mode;
    flexTile.dataset.flip = flipInputs.find((r) => r.checked).value;
    clearPrism();
    step = page;
    if (isPrism()) layoutPrism({ animate: false });
    else layout();
  });
  if (isPrism()) requestAnimationFrame(() => (flexTile.style.transition = ""));
  flipOptions.classList.toggle("is-disabled", mode !== "flipper");
  flipInputs.forEach((r) => (r.disabled = mode !== "flipper"));
  busy = false;
  autoNote.textContent = mode === "stack" ? "(the launcher sets the timing)" : "(flipInterval, 5s)";
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
flipInputs.forEach((r) => r.addEventListener("change", () => setMode(flexTile.dataset.mode)));
hintInputs.forEach((inp) => inp.addEventListener("change", applyHints));
document.getElementById("hintRecommended").addEventListener("click", () => { setMode("stack"); setHints(["dots"]); });
document.getElementById("hintFigma").addEventListener("click", () => { setMode("flipper"); setHints([]); });

setMode("stack");

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
  setMode(flexTile.dataset.mode);
});
