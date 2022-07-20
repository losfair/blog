import { RequestContext } from "../../../../logic/request_context"
import { mkJsonResponse } from "../../../../logic/util";

export interface UpdateRequest {
  id?: string,
  shortKey?: string,
  title?: string,
  body?: string,
  isPublic?: boolean,
  isListed?: boolean,
  delete?: boolean,
}

const schema = "Validation" in globalThis ? new Validation.JTD.JTDStaticSchema<UpdateRequest>({
  optionalProperties: {
    id: {
      type: "string",
    },
    shortKey: {
      type: "string",
    },
    title: {
      type: "string",
    },
    body: {
      type: "string",
    },
    isPublic: {
      type: "boolean",
    },
    isListed: {
      type: "boolean",
    },
    delete: {
      type: "boolean",
    },
  }
}) : null;

const shortKeyRegex = /^[a-z0-9-]{1,50}$/;

export default async ({ request }: { request: Request }) => {
  const ctx = RequestContext.get(request);
  const identity = ctx.mustGetIdentity();
  const json: unknown = await request.json();
  if (!schema?.validate(json)) throw new Response("invalid request", { status: 400 });

  if (!isUndefinedOrNull(json.shortKey)) {
    if (!shortKeyRegex.test(json.shortKey)) return mkJsonResponse({ error: "invalid shortKey" }, 400);
  }

  const db = ctx.getDatabase();

  if (json.id) {
    if (json.delete) {
      await db.exec("DELETE FROM post WHERE id = :id", { id: ["s", json.id] }, "");
      return {};
    }

    // update
    const sets = [
      !isUndefinedOrNull(json.shortKey) ? "short_key = :short_key" : "",
      !isUndefinedOrNull(json.title) ? "title = :title" : "",
      !isUndefinedOrNull(json.body) ? "body = :body" : "",
      !isUndefinedOrNull(json.isPublic) ? "is_public = :is_public" : "",
      !isUndefinedOrNull(json.isListed) ? "is_listed = :is_listed" : "",
    ].filter(x => x).join(", ");
    if (!sets) return { id: json.id };

    await db.exec(`
UPDATE post SET ${sets} WHERE id = :id`, {
      id: ["s", json.id],
      short_key: ["s", json.shortKey || ""],
      title: ["s", json.title || ""],
      body: ["s", json.body || ""],
      is_public: ["i", json.isPublic ? 1 : 0],
      is_listed: ["i", json.isListed ? 1 : 0],
    }, "");

    return {
      id: json.id,
    }
  } else {
    if (!json.title) {
      return new Response("title is required", { status: 400 });
    }
    const id = crypto.randomUUID();
    const author = "gh:" + identity.ghId;
    await db.exec(`
INSERT INTO post (id, short_key, author, title, body, is_public, is_listed)
VALUES(:id, :short_key, :author, :title, :body, :is_public, :is_listed)`, {
      id: ["s", id],
      short_key: ["s", json.shortKey || id],
      author: ["s", author],
      title: ["s", json.title],
      body: ["s", json.body || ""],
      is_public: ["i", json.isPublic ? 1 : 0],
      is_listed: ["i", json.isListed ? 1 : 0],
    }, "");
    return {
      id,
    }
  }
}

function isUndefinedOrNull(value: unknown): value is undefined | null {
  return value === undefined || value === null;
}