import { Mysql } from "blueboat-types/src/mysql";
import * as cookie from "cookie";
import { Identity } from "./auth";

const sym = Symbol("RequestContext");

export class RequestContext {
  cookies: Record<string, string>;
  parsedUrl: URL;
  private identity: Identity | null | undefined;

  private constructor(private request: Request) {
    this.cookies = cookie.parse(request.headers.get("cookie") || "");
    this.parsedUrl = new URL(request.url);
    this.identity = undefined;
  }

  static get(request: Request): RequestContext {
    const req = request as any;
    if (!req[sym]) req[sym] = new RequestContext(request);
    return req[sym];
  }

  getIdentity(): Identity | null {
    if (this.identity !== undefined) {
      return this.identity;
    }

    const token = this.cookies["app_token"];
    if (!token) return null;

    try {
      const { header, claims } = NativeCrypto.JWT.decode(token, {
        type: "base64Secret",
        data: App.env.jwtSecretKey,
      }, {
        leeway: 60,
        algorithms: ["HS256"],
      });
      this.identity = claims as Identity;
    } catch (e) {
      this.identity = null;
    }
    return this.identity;
  }

  mustGetIdentity(): Identity {
    const identity = this.getIdentity();
    if (!identity) throw new Response("unauthorized", {
      status: 401,
    });
    return identity;
  }

  getDatabase(): Mysql {
    if(this.request.headers.get("x-blueboat-live") === "1") return App.mysql.production;
    return App.mysql.development;
  }
}
