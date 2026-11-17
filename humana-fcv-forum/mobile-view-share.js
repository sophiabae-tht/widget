/* "Copy link": a Share dialog after tht-demo-studio's (src/studio/pages/ShareDialog.tsx), for two links:
   the mobile view (just the phone, filling the screen) or the project page (the phone with its notes).
   It opens on the choice of the two; picking one surfaces its link: for the mobile view only, its QR code to open it on a phone
   (black on white, 4-module quiet zone, error correction "Q", so it scans off a screen or a projector),
   then the link in a read-only field, and Copy link and Open side by side.
   window.shareMobileView({ mobile, project }) opens it (on the mobile view). The QR library (qrcode 1.5.4, MIT, bundled as qrcode.min.js)
   loads the first time it's needed. Self-contained (its own styles) so each prototype folder can
   include the same file. */
(() => {
  const QR = { type: "svg", errorCorrectionLevel: "Q", margin: 4, color: { dark: "#000000", light: "#ffffff" } };
  const here = document.currentScript?.src || location.href;
  let qrLib = null;
  const loadQr = () => (qrLib ??= new Promise((resolve, reject) => {
    if (window.QRCode) return resolve(window.QRCode);
    const s = document.createElement("script");
    s.src = new URL("qrcode.min.js", here).href;
    s.onload = () => resolve(window.QRCode);
    s.onerror = () => { qrLib = null; reject(new Error("QR library didn't load")); };
    document.head.append(s);
  }));

  const COPY = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15.75 15.75H20.25V3.75H8.25V8.25M3.75 8.25H15.75V20.25H3.75V8.25Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const OPEN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.25 9V3.75H15M13.5 10.5L20.25 3.75M17.25 13.5V19.5C17.25 19.914 16.914 20.25 16.5 20.25H4.5C4.086 20.25 3.75 19.914 3.75 19.5V7.5C3.75 7.086 4.086 6.75 4.5 6.75H10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CLOSE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18.75 5.25L5.25 18.75M18.75 18.75L5.25 5.25" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const CSS = `
    .mvs { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 24px; font-family: "General Sans", system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
    .mvs-backdrop { position: absolute; inset: 0; border: 0; padding: 0; background: #15173880; cursor: default; animation: mvs-fade 200ms ease-out both; }
    .mvs-card { position: relative; display: grid; gap: 24px; width: min(360px, 100%); max-height: 100%; overflow: auto; padding: 24px; border-radius: 20px; background: #fff; color: #1f2247; box-shadow: 0 24px 60px #0c0f4140; animation: mvs-in 240ms cubic-bezier(0.2, 0, 0, 1) both; }
    .mvs.is-closing .mvs-backdrop { animation: mvs-fade 160ms ease-in reverse both; }
    .mvs.is-closing .mvs-card { animation: mvs-in 160ms ease-in reverse both; }
    .mvs-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .mvs-title { margin: 0; font-weight: 600; font-size: 20px; line-height: 28px; outline: none; }
    .mvs-sub { margin: 4px 0 0; font-weight: 500; font-size: 14px; line-height: 20px; color: #565a86; }
    .mvs-close { flex: none; display: grid; place-items: center; width: 36px; height: 36px; margin: -6px -6px 0 0; padding: 0; border: 0; border-radius: 50%; background: none; color: #565a86; cursor: pointer; }
    .mvs-close:hover { background: #0c0f410d; }
    .mvs-switch { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .mvs-switch button { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 12px; border: 1px solid #e3e6eb; border-radius: 12px; background: #fff; color: #1f2247; text-align: left; font: 600 14px/20px "General Sans", system-ui, sans-serif; cursor: pointer; transition: border-color 0.15s, background-color 0.15s; }
    .mvs-switch button small { font-weight: 500; font-size: 12px; line-height: 16px; color: #696d9b; }
    .mvs-switch button:hover { border-color: #4754eb66; }
    .mvs-switch button[aria-checked="true"] { border-color: #4754eb; background: #4754eb0d; color: #4754eb; box-shadow: inset 0 0 0 1px #4754eb; }
    .mvs-switch button:focus-visible { outline: 2px solid #4754eb; outline-offset: 2px; }
    .mvs-section[hidden] { display: none; }
    .mvs-reveal { animation: mvs-reveal 220ms cubic-bezier(0.2, 0, 0, 1) both; }
    @keyframes mvs-reveal { from { opacity: 0; transform: translateY(4px); } }
    .mvs-qr { justify-self: center; width: 200px; height: 200px; padding: 8px; border: 1px solid #e3e6eb; border-radius: 12px; background: #fff; }
    .mvs-qr svg { display: block; width: 100%; height: 100%; }
    .mvs-qr:empty { background: #f6f7f9; }
    .mvs-qr[hidden] { display: none; }
    .mvs-section { display: grid; gap: 8px; }
    .mvs-label { font-weight: 600; font-size: 13px; line-height: 18px; color: #565a86; }
    .mvs-field { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #e3e6eb; border-radius: 10px; background: #f9f9fb; color: #1f2247; font: 500 14px/20px "General Sans", system-ui, sans-serif; text-overflow: ellipsis; }
    .mvs-field:focus { outline: 2px solid #4754eb; outline-offset: -1px; }
    .mvs-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .mvs-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 12px; border: 1px solid #4754eb26; border-radius: 10px; background: #fff; color: #4754eb; font: 600 14px/20px "General Sans", system-ui, sans-serif; text-decoration: none; white-space: nowrap; cursor: pointer; }
    .mvs-btn svg { flex: none; }
    .mvs-btn:hover { background: #4754eb0d; }
    .mvs-btn--primary { border-color: #4754eb; background: #4754eb; color: #fff; }
    .mvs-btn--primary:hover { background: #3a47d6; }
    .mvs-btn:focus-visible, .mvs-close:focus-visible { outline: 2px solid #4754eb; outline-offset: 2px; }
    @keyframes mvs-fade { from { opacity: 0; } }
    @keyframes mvs-in { from { opacity: 0; transform: translateY(8px) scale(0.98); } }
    @media (prefers-reduced-motion: reduce) { .mvs-backdrop, .mvs-card { animation-duration: 1ms !important; } }`;
  let styled = false;

  const LINKS = [
    { key: "mobile", tab: "Mobile view", desc: "Just the prototype, full screen", open: "Open mobile view", qr: true },
    { key: "project", tab: "Project page", desc: "The prototype with its notes", open: "Open project page" },
  ];

  window.shareMobileView = (links) => {
    if (typeof links === "string") links = { mobile: links };
    const shown = LINKS.filter((l) => links[l.key]);
    if (!styled) { const s = document.createElement("style"); s.textContent = CSS; document.head.append(s); styled = true; }
    document.querySelector(".mvs")?.remove();
    const back = document.activeElement;
    const el = document.createElement("div");
    el.className = "mvs";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "mvsTitle");
    el.innerHTML = `
      <button class="mvs-backdrop" type="button" aria-label="Close" tabindex="-1" data-mvs-close></button>
      <div class="mvs-card">
        <div class="mvs-head">
          <div>
            <h2 class="mvs-title" id="mvsTitle" tabindex="-1">Share</h2>
            <p class="mvs-sub"></p>
          </div>
          <button class="mvs-close" type="button" aria-label="Close" data-mvs-close>${CLOSE}</button>
        </div>
        ${shown.length > 1 ? `<div class="mvs-switch" role="radiogroup" aria-label="Link to">${shown.map((l) => `<button type="button" role="radio" aria-checked="false" data-mvs-pick="${l.key}">${l.tab}<small>${l.desc}</small></button>`).join("")}</div>` : ""}
        <div class="mvs-qr" role="img"></div>
        <div class="mvs-section">
          <label class="mvs-label" for="mvsLink">Link</label>
          <input class="mvs-field" id="mvsLink" type="text" readonly />
          <div class="mvs-pair">
            <button class="mvs-btn mvs-btn--primary" type="button" data-mvs-copy>${COPY}<span>Copy link</span></button>
            <a class="mvs-btn" target="_blank" rel="noopener">${OPEN}<span></span></a>
          </div>
        </div>
      </div>`;
    const field = el.querySelector(".mvs-field");
    field.addEventListener("focus", () => field.select());
    const qr = el.querySelector(".mvs-qr");
    const openLink = el.querySelector("a.mvs-btn");
    let url = "";
    let showing = 0;
    const show = (key) => {
      const l = shown.find((x) => x.key === key) || shown[0];
      url = links[l.key];
      const n = ++showing;
      el.querySelectorAll("[data-mvs-pick]").forEach((b) => b.setAttribute("aria-checked", b.dataset.mvsPick === l.key));
      const section = el.querySelector(".mvs-section");
      section.hidden = false;
      el.querySelector(".mvs-sub").textContent = l.qr ? "Scan it with your phone’s camera, or copy the link." : "Copy the link, or open it.";
      [qr, section].forEach((x) => { x.classList.remove("mvs-reveal"); void x.offsetWidth; x.classList.add("mvs-reveal"); });
      field.value = url;
      openLink.href = url;
      openLink.querySelector("span").textContent = l.open;
      el.querySelector("[data-mvs-copy] span").textContent = "Copy link";
      qr.hidden = !l.qr;
      if (!l.qr) return;
      qr.setAttribute("aria-label", `QR code for the ${l.tab.toLowerCase()} link`);
      // The SVG comes from the QR library, built from our own URL
      loadQr()
        .then((QRCode) => QRCode.toString(links[l.key], QR))
        .then((svg) => { if (n === showing) qr.innerHTML = svg; })
        .catch(() => { qr.hidden = true; });
    };
    // Two links: nothing surfaces until one is picked. One: straight to it.
    if (shown.length > 1) {
      el.querySelector(".mvs-sub").textContent = "What do you want to share?";
      qr.hidden = true;
      el.querySelector(".mvs-section").hidden = true;
    } else show(shown[0].key);

    let closing = false;
    const close = () => {
      if (closing) return;
      closing = true;
      removeEventListener("keydown", onKey);
      el.classList.add("is-closing");
      setTimeout(() => el.remove(), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 160);
      back?.focus?.({ preventScroll: true });
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    addEventListener("keydown", onKey);
    let copiedTimer = null;
    el.addEventListener("click", async (e) => {
      if (e.target.closest("[data-mvs-close]")) return close();
      const pick = e.target.closest("[data-mvs-pick]");
      if (pick) return show(pick.dataset.mvsPick);
      const copy = e.target.closest("[data-mvs-copy]");
      if (copy) {
        const label = copy.querySelector("span");
        try {
          await navigator.clipboard.writeText(url);
          label.textContent = "Copied";
        } catch {
          // No clipboard (an insecure page, or permission denied): select the link to copy by hand
          field.focus();
          label.textContent = "Select and copy";
        }
        clearTimeout(copiedTimer);
        copiedTimer = setTimeout(() => (label.textContent = "Copy link"), 2000);
      }
    });
    document.body.append(el);
    el.querySelector(".mvs-title").focus({ preventScroll: true });
  };
})();
