// Vercel Routing Middleware: two password walls.
//   Home page (/): the shared team password.
//   Experimental archives (/molina-flexcard/archive/, /humana-fcv-forum/archive/, linked from each
//   prototype's notes): a second wall with its own sign-in. Signing in to the home page does NOT open
//   the archives; signing in to one archive opens both archives.
// Exploration pages (/<slug>/) and their assets stay public.
//
// Visitors without a valid sign-in cookie for that wall see a password screen. Submitting the right
// password sets that wall's cookie for 30 days and goes back to the page that asked. Each cookie is
// derived from its password and wall, so changing a password signs everyone out of that wall.
//
// Passwords live in the Vercel project's environment variables (Project → Settings → Environment
// Variables): SITE_PASSWORD for the home page, ARCHIVE_PASSWORD for the archives (if ARCHIVE_PASSWORD
// isn't set, the archives use SITE_PASSWORD, still behind their own sign-in). If no password is set,
// the page stays locked.

export const config = {
  matcher: [
    "/", "/index.html",
    "/molina-flexcard/archive", "/molina-flexcard/archive/:path*",
    "/humana-fcv-forum/archive", "/humana-fcv-forum/archive/:path*",
  ],
};

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const WALLS = {
  home: { cookie: "home_auth", label: "widget-home-v1", title: "Widget Explorations", password: () => process.env.SITE_PASSWORD },
  archive: {
    cookie: "archive_auth", label: "widget-archive-v1", title: "Experimental archive",
    password: () => process.env.ARCHIVE_PASSWORD || process.env.SITE_PASSWORD,
  },
};

export default async function middleware(request) {
  // The protected page that was asked for (the matcher only lets protected paths through), to come back to
  const here = new URL(request.url).pathname;
  const wall = WALLS[/\/archive(\/|$)/.test(here) ? "archive" : "home"];
  const { cookie: COOKIE, title } = wall;

  const password = wall.password();
  if (!password) return page({ message: `The ${title.toLowerCase()} password isn’t set up yet.`, status: 503, form: false, title });

  const token = await tokenFor(password, wall.label);

  if (request.method === "POST") {
    let given = "";
    try { given = String((await request.formData()).get("password") ?? ""); } catch {}
    if (!safeEqual(given, password)) return page({ message: "That password isn’t right. Try again.", status: 401, action: here, title });
    return new Response(null, {
      status: 303,
      headers: {
        Location: here,
        "Set-Cookie": `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        "Cache-Control": "no-store",
      },
    });
  }

  if (!safeEqual(readCookie(request, COOKIE) ?? "", token)) return page({ status: 401, action: here, title });

  // Signed in: let the request through to the static home page (same signal as next() from @vercel/functions).
  return new Response(null, { headers: { "x-middleware-next": "1" } });
}

// HMAC of the wall's label, keyed by its password. Proves the visitor knew the password without storing
// it, and a home-page cookie never matches the archive wall (different label), even with the same password.
async function tokenFor(password, label) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(label)));
  return [...sig].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readCookie(request, name) {
  for (const part of (request.headers.get("cookie") || "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

// Compares without exiting early, so response time doesn't hint at how much matched.
function safeEqual(a, b) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

const attr = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function page({ message = "", status = 401, form = true, action = "/", title = "Widget Explorations" }) {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Sign in · ${title}</title>
  <link rel="preconnect" href="https://api.fontshare.com" />
  <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap" />
  <style>
    :root { --bg: #f6f7f9; --card: #fff; --ink: #14161a; --muted: #5f6672; --line: #e3e6eb; --brand: #1f5eff; --error: #c62f3c; }
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px;
      background: var(--bg); color: var(--ink);
      font: 400 15px/1.5 "General Sans", system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased;
    }
    .panel { width: 100%; max-width: 360px; padding: 32px; border: 1px solid var(--line); border-radius: 16px; background: var(--card); }
    .logo { display: block; height: 24px; width: auto; margin-bottom: 24px; }
    h1 { margin: 0 0 4px; font-size: 22px; font-weight: 600; letter-spacing: -.01em; }
    p { margin: 0; color: var(--muted); font-size: 14px; }
    form { display: grid; gap: 12px; margin-top: 24px; }
    label { font-size: 13px; font-weight: 500; }
    input {
      width: 100%; padding: 12px 14px; border: 1px solid var(--line); border-radius: 10px;
      font: inherit; color: inherit; background: var(--card);
    }
    input:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px rgba(31, 94, 255, .15); }
    input[aria-invalid="true"] { border-color: var(--error); }
    .error { color: var(--error); font-size: 13px; }
    button {
      margin-top: 4px; padding: 12px 14px; border: 0; border-radius: 10px; cursor: pointer;
      background: var(--brand); color: #fff; font-family: inherit; font-size: 15px; font-weight: 500; line-height: 1.2;
    }
    button:hover { filter: brightness(1.05); }
  </style>
</head>
<body>
  <main class="panel">
    <img class="logo" src="/assets/thrive-logo.svg" alt="Thrive Mobile" />
    <h1>${title}</h1>
    <p>${title === "Widget Explorations" ? "Enter the team password to continue." : "This area has its own password. Enter it to continue."}</p>
    ${form ? `<form method="post" action="${attr(action)}">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required autofocus${message ? ` aria-invalid="true" aria-describedby="error"` : ""} />
      ${message ? `<span class="error" id="error" role="alert">${message}</span>` : ""}
      <button type="submit">Continue</button>
    </form>` : `<p class="error" role="alert" style="margin-top:16px">${message}</p>`}
  </main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
