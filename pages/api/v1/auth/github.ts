import { cookieTTLSecs, processGithubGrant } from "../../../../logic/auth";
import { generateClearCookieString, generateSetCookieString } from "../../../../logic/cookie";
import { RequestContext } from "../../../../logic/request_context";

export default async ({ request }: { request: Request }) => {
  if (request.method != "GET") throw new Response("invalid method");

  const ctx = RequestContext.get(request);
  const code = ctx.parsedUrl.searchParams.get("code") || "";
  const state = ctx.parsedUrl.searchParams.get("state") || "";

  const stateCookie = ctx.cookies["gh_login_state"];
  if (!stateCookie || state !== stateCookie) return {
    error: "invalid state",
  }

  const result = await processGithubGrant(code);
  if (typeof result === "number") return {
    error: "invalid code",
  };

  return new Response(null, {
    status: 302,
    headers: [
      ["location", "/"],
      ["set-cookie", generateClearCookieString("gh_login_state")],
      ["set-cookie", generateSetCookieString("app_token", result.jwt, cookieTTLSecs * 1000)],
    ]
  })
};
