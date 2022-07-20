import { RequestContext } from "./request_context"

export interface Post {
  id: string,
  shortKey: string,
  author: string,
  title: string,
  body: string,
  isPublic: boolean,
  isListed: boolean,
  createdAt: number,
}

function mockPostList(): Post[] {
  return [
    {
      id: "13e07d7a-f3e9-4553-988f-1134cbdb0b85",
      shortKey: "test-key-2",
      author: "gh:583231",
      title: "Test Post 2 with a very very very very looooooooooooong title",
      body: "This is the content of Test Post 2. \n\n<div id=\"test-id\">test div</div>",
      isPublic: true,
      isListed: true,
      createdAt: new Date("2022-05-10").getTime(),
    },
    {
      id: "39884df1-6bd7-4add-973e-d3c860b533e8",
      shortKey: "test-key-1",
      author: "gh:583231",
      title: "Test Post 1 中文",
      body: "This is the content of Test Post 1. Some 中文/Chinese text.\n\nAnd another paragraph.\n\n- Item 1\n- Item 2\n\n",
      isPublic: false,
      isListed: true,
      createdAt: new Date("2021-10-22").getTime(),
    },
    {
      id: "ebd255d1-d035-4bbf-9533-168c42dd84d9",
      shortKey: "about",
      author: "gh:583231",
      title: "About",
      body: "This is the about page.",
      isPublic: true,
      isListed: false,
      createdAt: new Date("2021-10-22").getTime(),
    },
  ];
}

export async function loadPostList(opts: {
  ctx: RequestContext,
  showPrivate: boolean,
  offset: number,
  limit: number,
}): Promise<Post[]> {
  if (APP_RUNTIME !== "blueboat") return mockPostList().filter(x => opts.showPrivate || (x.isPublic && x.isListed)).map(x => {
    x.body = "";
    return x;
  });

  const db = opts.ctx.getDatabase();
  const rows = await db.exec(`
SELECT id, short_key, author, title, cast(is_public as signed integer), cast(is_listed as signed integer), unix_timestamp(inserted_at)
FROM post
${opts.showPrivate ? "" : "WHERE is_public = 1 and is_listed = 1"}
ORDER BY inserted_at DESC LIMIT :offset, :limit
  `, {
    offset: ["i", opts.offset],
    limit: ["i", opts.limit],
  }, "ssssiii");
  return rows.map(([id, shortKey, author, title, isPublic, isListed, createdAt]) => ({
    id: id!,
    shortKey: shortKey!,
    author: author!,
    title: title!,
    body: "",
    isPublic: isPublic === 1,
    isListed: isListed == 1,
    createdAt: createdAt! * 1000,
  }));
}

export async function loadPost(opts: {
  ctx: RequestContext,
  showPrivate: boolean,
  id?: string,
  shortKey?: string,
}): Promise<Post | null> {
  if (!((opts.id && !opts.shortKey) || (!opts.id && opts.shortKey))) {
    throw new Error("Either id or shortKey must be specified");
  }

  if (APP_RUNTIME !== "blueboat") return mockPostList().find(x => (opts.showPrivate || x.isPublic) && (opts.id ? x.id === opts.id : x.shortKey === opts.shortKey)) || null;

  const db = opts.ctx.getDatabase();
  const rows = await db.exec(`
SELECT id, short_key, author, title, body, cast(is_public as signed integer), cast(is_listed as signed integer), unix_timestamp(inserted_at)
FROM post
WHERE ${opts.id ? "id = :id" : "short_key = :short_key"}
${opts.showPrivate ? "" : " and is_public = 1"}
  `, {
    short_key: ["s", opts.shortKey || ""],
    id: ["s", opts.id || ""],
  }, "sssssiii");
  if (!rows.length) return null;
  return rows.map(([id, short_key, author, title, body, isPublic, isListed, createdAt]) => ({
    id: id!,
    shortKey: short_key!,
    author: author!,
    title: title!,
    body: body!,
    isPublic: isPublic === 1,
    isListed: isListed === 1,
    createdAt: createdAt! * 1000,
  }))[0];
}
