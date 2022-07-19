import { requestGithubLogin } from "../../../logic/auth";
import { generateSetCookieString } from "../../../logic/cookie";
import { RequestContext } from "../../../logic/request_context";

export default async ({ request }: { request: Request }) => {
  const state = crypto.randomUUID();
  const ctx = RequestContext.get(request);
  return new Response(null, {
    status: 302,
    headers: {
      "set-cookie": generateSetCookieString("gh_login_state", state, 600 * 1000),
      location: await requestGithubLogin(`${ctx.parsedUrl.origin}/api/v1/auth/github`, state),
    }
  })
};
