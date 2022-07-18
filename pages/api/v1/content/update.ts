import { RequestContext } from "../../../../logic/request_context"

interface UpdateRequest {
  id?: string,
  shortKey?: string,
  title?: string,
  body?: string,
  isPublic?: boolean,
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
  }
}) : null;

export default async ({ request }: { request: Request }) => {
  const ctx = RequestContext.get(request);
  const identity = ctx.mustGetIdentity();
  const json: unknown = await request.json();
  if (!schema?.validate(json)) throw new Response("invalid request", { status: 400 });

  const db = ctx.getDatabase();

  if (json.id) {
    // update
    await db.exec(`
UPDATE post SET
${!isUndefinedOrNull(json.shortKey) ? "short_key = :shortKey" : ""}
${!isUndefinedOrNull(json.title) ? "title = :title" : ""}
${!isUndefinedOrNull(json.body) ? "body = :body" : ""}
${!isUndefinedOrNull(json.isPublic) ? "is_public = :isPublic" : ""}
WHERE id = :id`, {
      id: ["s", json.id],
      shortKey: ["s", json.shortKey || ""],
      title: ["s", json.title || ""],
      body: ["s", json.body || ""],
      isPublic: ["i", json.isPublic ? 1 : 0],
    }, "")
  } else {
    if (!json.title) {
      return new Response("title is required", { status: 400 });
    }
    const id = crypto.randomUUID();
    const author = "gh:" + identity.ghId;
    await db.exec(`
INSERT INTO post (id, short_key, author, title, body, is_public)
VALUES(:id, :shortKey, :author, :title, :body, :isPublic)`, {
      id: ["s", id],
      shortKey: ["s", json.shortKey || id],
      author: ["s", author],
      title: ["s", json.title],
      body: ["s", json.body || ""],
      isPublic: ["i", json.isPublic ? 1 : 0],
    }, "");
  }

  return {
    ok: true,
  }
}

function isUndefinedOrNull(value: unknown): value is undefined | null {
  return value === undefined || value === null;
}