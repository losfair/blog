import { RequestContext } from "./request_context";

const ghApp = ("ExternalService" in globalThis ? new ExternalService.GitHub.OAuthApp({
  clientId: App.env.githubClientId,
  clientSecret: App.env.githubClientSecret,
}) : null)!;

const allowedGhUsers: number[] = ("App" in globalThis ? App.env.allowedGhUsers.split(",").filter(x => x).map(parseInt) : null)!
const tokenTTLSecs = 86400 * 7;
export const cookieTTLSecs = tokenTTLSecs - 3600;

export interface Identity {
  exp: number;
  ghId: number;
  ghUsername: string;
}

export async function processGithubGrant(
  code: string,
): Promise<number | { jwt: string, identity: Identity }> {
  const tokenInfo = await ghApp.createToken({ code });
  const ghToken = tokenInfo.authentication.token;
  const octokit = new ExternalService.GitHub.Octokit({
    auth: ghToken,
    userAgent: "Blog @ Blueboat",
  });
  const user = await octokit.rest.users.getAuthenticated();
  if (
    allowedGhUsers.length &&
    allowedGhUsers.findIndex((x) => x === user.data.id) == -1
  ) {
    console.log(`user not allowed: ${user.data.id} ${user.data.login}`);
    return 403;
  }
  const identity: Identity = {
    exp: Math.floor(Date.now() / 1000) + tokenTTLSecs,
    ghId: user.data.id,
    ghUsername: user.data.login,
  };
  const jwt = NativeCrypto.JWT.encode({
    alg: "HS256",
  }, identity, {
    type: "base64Secret",
    data: App.env.jwtSecretKey,
  });
  console.log(`user signed in: ${user.data.id} ${user.data.login}`);
  return {
    jwt,
    identity,
  }
}

export async function requestGithubLogin(redirectUrl: string, state: string): Promise<string> {
  const urlInfo = ghApp.getWebFlowAuthorizationUrl({
    scopes: ["user:email"],
    redirectUrl,
  });
  return urlInfo.url;
}
