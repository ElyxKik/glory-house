// Vercel may expose an internal URL to the server; compare the public Host.
export function sameOrigin(request: Request) {
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    const host = request.headers.get("host") ?? new URL(request.url).host;
    return origin.host === host && ["https:", "http:"].includes(origin.protocol);
  } catch { return false; }
}
