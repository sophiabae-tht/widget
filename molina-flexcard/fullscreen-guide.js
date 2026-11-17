/* Full screen on phones: the "Use it full screen" sheet, ported from tht-demo-studio
   (src/components/FullscreenPrompt.tsx + src/shell/fullscreen.ts).
   iPhone: Safari can't hide its bars for a website, so it explains Add to Home Screen.
   Android: installing it as an app (Chrome's own prompt when it has one ready), which opens full
   screen with the design's status bar; "Full screen for now" uses Chrome's full screen instead.
   Not shown on desktop or iPad (the Full screen button goes straight to full screen there),
   once it's running from the home screen, or inside another page (the home page's card previews).
   The mobile-view link (?full) on an iPhone or Android phone also gets the studio's frosted "Full screen"
   pill near the bottom of the screen (LockScreen's FullscreenPrompt): tapping it opens the sheet. Gone
   once full screen, and under any app the prototype opens. A prototype can move it with
   --fsg-pill-bottom on .phone (e.g. above its dock).
   Self-contained (its own styles) so each prototype folder can include the same file. */
(() => {
  const ua = navigator.userAgent;
  const isIPhone = /iPhone|iPod/.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isStandalone = () =>
    matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches || navigator.standalone === true;
  const appName = () => document.querySelector('meta[name="apple-mobile-web-app-title"]')?.content || "this prototype";

  // Chrome offers to install a page with a manifest in a banner of its own; hold it back and keep its
  // prompt for the sheet's "Install app".
  let installPrompt = null;
  addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installPrompt = e; });
  addEventListener("appinstalled", () => { installPrompt = null; });

  const SHARE = '<svg class="fsg-inline" width="20" height="20" viewBox="0 0 24 24" fill="none" role="img" aria-label="Share"><path d="M12 3V14.25M12 3L8.25 6.75M12 3L15.75 6.75M8.25 9.75H6.75C6.336 9.75 6 10.086 6 10.5V20.25C6 20.664 6.336 21 6.75 21H17.25C17.664 21 18 20.664 18 20.25V10.5C18 10.086 17.664 9.75 17.25 9.75H15.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const MORE = '<svg class="fsg-inline" width="20" height="20" viewBox="0 0 20 20" role="img" aria-label="More"><path fill="currentColor" d="M10 6.667c.917 0 1.667-.75 1.667-1.667S10.917 3.333 10 3.333 8.333 4.083 8.333 5s.75 1.667 1.667 1.667Zm0 1.666c-.917 0-1.667.75-1.667 1.667s.75 1.667 1.667 1.667 1.667-.75 1.667-1.667S10.917 8.333 10 8.333Zm0 5c-.917 0-1.667.75-1.667 1.667s.75 1.667 1.667 1.667 1.667-.75 1.667-1.667-.75-1.667-1.667-1.667Z"/></svg>';
  const step = (n, html) => `<li><span class="fsg-num">${n}</span><span>${html}</span></li>`;

  const CSS = `
    .fsg { position: absolute; inset: 0; z-index: 90; display: flex; flex-direction: column; justify-content: flex-end; font-family: "General Sans", system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
    .fsg-backdrop { position: absolute; inset: 0; border: 0; padding: 0; background: #15173880; cursor: default; animation: fsg-fade 200ms ease-out both; }
    .fsg-sheet { position: relative; display: flex; flex-direction: column; gap: 16px; padding: 24px 16px 40px; border-radius: 16px 16px 0 0; background: #f9f9fb; color: #1f2247; animation: fsg-up 300ms cubic-bezier(0.2, 0, 0.2, 1) both; }
    .fsg.is-closing .fsg-backdrop { animation: fsg-fade 200ms ease-in reverse both; }
    .fsg.is-closing .fsg-sheet { animation: fsg-down 300ms cubic-bezier(0.2, 0, 0.2, 1) both; }
    .fsg-title { margin: 0; padding: 0 8px; font-weight: 600; font-size: 20px; line-height: 28px; outline: none; }
    .fsg-intro { margin: 0; padding: 0 8px; font-weight: 500; font-size: 16px; line-height: 24px; color: #565a86; }
    .fsg-steps { display: flex; flex-direction: column; gap: 12px; margin: 0; padding: 16px; list-style: none; border-radius: 16px; background: #fff; box-shadow: 0 2px 8px #0c0f410d; }
    .fsg-steps li { display: flex; align-items: flex-start; gap: 12px; font-weight: 500; font-size: 16px; line-height: 24px; }
    .fsg-steps b { font-weight: 600; }
    .fsg-num { flex: none; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: #4754eb1a; color: #4754eb; font-weight: 600; font-size: 14px; line-height: 20px; }
    .fsg-inline { display: inline-block; vertical-align: -4px; color: #4754eb; }
    .fsg-btn { display: flex; align-items: center; justify-content: center; width: 100%; padding: 12px 16px; border: 0; border-radius: 12px; background: #4754eb; color: #fff; font: 600 16px/24px "General Sans", system-ui, sans-serif; cursor: pointer; }
    .fsg-btn:active { background-image: linear-gradient(#ffffff33, #ffffff33); }
    .fsg-btn--link { margin-top: -8px; background: none; color: #565a86; text-decoration: underline; text-underline-position: from-font; }
    .fsg-btn--link:active { background: #0c0f411a; }
    .fsg-pill { position: absolute; z-index: 20; left: 50%; bottom: var(--fsg-pill-bottom, 48px); display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 8px 16px; border: 0; border-radius: 999px; background: #ffffff29; -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); color: #fff; font: 600 14px/20px "General Sans", system-ui, sans-serif; white-space: nowrap; transform: translateX(-50%); cursor: pointer; transition: background-color 120ms ease-out; -webkit-tap-highlight-color: transparent; animation: fsg-fade 300ms ease-out 400ms both; }
    .fsg-pill:active { background: #ffffff47; }
    @media (hover: hover) { .fsg-pill:hover { background: #ffffff47; } }
    .fsg-pill svg { display: block; flex: none; }
    html:not(.full) .fsg-pill, .fsg-pill.is-hidden { display: none; }
    @keyframes fsg-fade { from { opacity: 0; } }
    @keyframes fsg-up { from { transform: translateY(100%); } }
    @keyframes fsg-down { to { transform: translateY(100%); } }
    @media (prefers-reduced-motion: reduce) { .fsg-backdrop, .fsg-sheet { animation-duration: 1ms !important; } }`;
  let styled = false;

  function open(host, platform) {
    if (!styled) { const s = document.createElement("style"); s.textContent = CSS; document.head.append(s); styled = true; }
    host.querySelector(".fsg")?.remove();
    const oneTap = platform === "android" && installPrompt !== null;
    const el = document.createElement("div");
    el.className = "fsg";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "fsgTitle");
    el.innerHTML = `
      <button class="fsg-backdrop" type="button" aria-label="Close" data-fsg-close></button>
      <div class="fsg-sheet">
        <h2 class="fsg-title" id="fsgTitle" tabindex="-1">Use it full screen</h2>
        ${platform === "ios" ? `
          <p class="fsg-intro">Safari can’t hide its bars for websites. Add this to your Home Screen and open it from there to get the whole screen.</p>
          <ol class="fsg-steps">
            ${step(1, `Tap ${SHARE} <b>Share</b> in Safari (on newer iPhones, tap <b>•••</b> first).`)}
            ${step(2, "Choose <b>Add to Home Screen</b>, then <b>Add</b>.")}
            ${step(3, `Open <b>${appName()}</b> from your Home Screen.`)}
          </ol>
          <button class="fsg-btn" type="button" data-fsg-close>Got it</button>` : `
          <p class="fsg-intro">Chrome’s bars take up room in a browser tab. Install this as an app and open it from your home screen to get the whole screen.</p>
          ${oneTap ? "" : `<ol class="fsg-steps">
            ${step(1, `Tap ${MORE} <b>More</b> in Chrome.`)}
            ${step(2, "Choose <b>Add to Home screen</b>, then <b>Install</b>.")}
            ${step(3, `Open <b>${appName()}</b> from your home screen.`)}
          </ol>`}
          <button class="fsg-btn" type="button" ${oneTap ? "data-fsg-install" : "data-fsg-close"}>${oneTap ? "Install app" : "Got it"}</button>
          <button class="fsg-btn fsg-btn--link" type="button" data-fsg-now>Full screen for now</button>`}
      </div>`;
    let closing = false;
    const close = () => {
      if (closing) return;
      closing = true;
      removeEventListener("keydown", onKey);
      el.classList.add("is-closing");
      setTimeout(() => el.remove(), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 300);
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    addEventListener("keydown", onKey);
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-fsg-close]")) return close();
      if (e.target.closest("[data-fsg-install]")) {
        const p = installPrompt;
        installPrompt = null;
        Promise.resolve(p?.prompt()).catch(() => {}).finally(close);
        return;
      }
      if (e.target.closest("[data-fsg-now]")) {
        // Inside this tap, so Chrome allows it
        document.documentElement.requestFullscreen?.({ navigationUI: "hide" }).catch(() => {});
        close();
      }
    });
    host.append(el);
    el.querySelector(".fsg-title").focus({ preventScroll: true });
  }

  const platformHere = () => (isStandalone() || window.parent !== window ? null : isIPhone ? "ios" : isAndroid ? "android" : null);

  /** Shows the sheet over `host` on an iPhone or Android phone; returns false (nothing shown) anywhere else. */
  window.fullscreenGuide = (host) => {
    const platform = platformHere();
    if (!platform) return false;
    open(host, platform);
    return true;
  };

  // The "Full screen" pill (studio FullscreenPrompt, variant "pill"), on phones only
  const FULLSCREEN_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8.25 3.75H3.75V8.25M15.75 3.75H20.25V8.25M20.25 15.75V20.25H15.75M8.25 20.25H3.75V15.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const phone = document.querySelector(".phone");
  if (phone && platformHere()) {
    if (!styled) { const st = document.createElement("style"); st.textContent = CSS; document.head.append(st); styled = true; }
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "fsg-pill";
    pill.innerHTML = `${FULLSCREEN_ICON}Full screen`;
    pill.addEventListener("click", () => window.fullscreenGuide(phone));
    phone.append(pill);
    // Android's "Full screen for now", or installed and reopened: nothing left to offer
    const sync = () => pill.classList.toggle("is-hidden", !!document.fullscreenElement || !platformHere());
    document.addEventListener("fullscreenchange", sync);
    matchMedia("(display-mode: standalone), (display-mode: fullscreen)").addEventListener?.("change", sync);
    sync();
  }
})();
