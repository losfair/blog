import { RequestContext } from "./request_context"

export interface Post {
  id: string,
  shortKey: string,
  author: string,
  title: string,
  body: string,
  isPublic: boolean,
  createdAt: number,
}

export async function loadPostList(opts: {
  ctx: RequestContext,
  showPrivate: boolean,
  offset: number,
  limit: number,
}): Promise<Post[]> {
  const db = opts.ctx.getDatabase();
  const rows = await db.exec(`
SELECT id, short_key, author, title, cast(is_public as signed integer), unix_timestamp(inserted_at)
FROM post
WHERE
${opts.showPrivate ? "" : "is_public = 0"}
ORDER BY inserted_at DESC LIMIT :limit
  `, {
    limit: ["i", opts.limit],
  }, "ssssii");
  return rows.map(([id, shortKey, author, title, isPublic, createdAt]) => ({
    id: id!,
    shortKey: shortKey!,
    author: author!,
    title: title!,
    body: "",
    isPublic: isPublic === 1,
    createdAt: createdAt! * 1000,
  }));
}

export async function loadPostByShortKey(opts: {
  ctx: RequestContext,
  showPrivate: boolean,
  shortKey: string,
}): Promise<Post | null> {

  const db = opts.ctx.getDatabase();
  const rows = await db.exec(`
SELECT id, author, title, body, cast(is_public as signed integer), unix_timestamp(inserted_at)
FROM post
WHERE short_key = :shortKey
${opts.showPrivate ? "" : "is_public = 0"}
  `, {
    shortKey: ["s", opts.shortKey],
  }, "ssssii");
  if (!rows.length) return null;
  return rows.map(([id, author, title, body, isPublic, createdAt]) => ({
    id: id!,
    shortKey: opts.shortKey,
    author: author!,
    title: title!,
    body: body!,
    isPublic: isPublic === 1,
    createdAt: createdAt! * 1000,
  }))[0];
}