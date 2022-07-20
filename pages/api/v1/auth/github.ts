import { cookieTTLSecs, processGithubGrant } from "../../../../logic/auth";
import { generateSetCookieString } from "../../../../logic/cookie";
import { RequestContext } from "../../../../logic/request_context";
import { mkJsonResponse } from "../../../../logic/util";

export default async ({ request }: { request: Request }) => {
  if (request.method != "GET") throw new Response("invalid method");

  const ctx = RequestContext.get(request);
  const code = ctx.parsedUrl.searchParams.get("code") || "";
  const state = ctx.parsedUrl.searchParams.get("state") || "";

  const stateCookie = ctx.cookies["gh_login_state"];
  if (!stateCookie || state !== stateCookie) return mkJsonResponse({
    error: "invalid state"
  }, 403);

  const result = await processGithubGrant(code);
  if (typeof result === "number") return mkJsonResponse({
    error: "invalid code"
  }, result);

  return new Response(null, {
    status: 302,
    headers: [
      ["location", "/"],
      //["set-cookie", generateClearCookieString("gh_login_state")], // multi-value set-cookie is broken
      ["set-cookie", generateSetCookieString("app_token", result.jwt, cookieTTLSecs * 1000)],
    ]
  })
};
