export function mkJsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

export function chinaSiteIcpBeian(request: Request): string | undefined {
  if ("App" in globalThis && App.env.icpBeian && request.headers.get("x-cn-site")) {
    return App.env.icpBeian;
  }

  return undefined;
}
