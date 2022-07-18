import { requestGithubLogin } from "../../../../logic/auth";
import { generateSetCookieString } from "../../../../logic/cookie";

export default async ({ request }: { request: Request }) => {
  const state = crypto.randomUUID();
  return new Response(null, {
    status: 302,
    headers: {
      "set-cookie": generateSetCookieString("gh_login_state", state, 600),
      location: await requestGithubLogin("/", state),
    }
  })
};
