// Vercel Routing Middleware: puts a shared team password on the home page only.
// Exploration pages (/explorations/<slug>/) and their assets stay public.
//
// The password lives in the Vercel project's environment variable SITE_PASSWORD
// (Project → Settings → Environment Variables). Any username is accepted.
// If SITE_PASSWORD is not set, the home page stays locked.

export const config = {
  matcher: ["/", "/index.html"],
};

const REALM = "Thrive widget explorations";

export default function middleware(request) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) {
    return new Response("Home page password is not configured.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const given = passwordFrom(request.headers.get("authorization"));
  if (given === null || !safeEqual(given, expected)) {
    return new Response("Password required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // Let the request through to the static page (same signal as next() from @vercel/functions).
  return new Response(null, { headers: { "x-middleware-next": "1" } });
}

// Reads the password from a "Basic base64(user:password)" header, or null.
function passwordFrom(header) {
  if (!header || !header.startsWith("Basic ")) return null;
  try {
    const bytes = Uint8Array.from(atob(header.slice(6).trim()), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const i = decoded.indexOf(":");
    return i === -1 ? null : decoded.slice(i + 1);
  } catch {
    return null;
  }
}

// Compares without exiting early, so response time doesn't hint at how much matched.
function safeEqual(a, b) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}
