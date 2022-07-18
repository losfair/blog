import { loadPostList, Post } from "../logic/post";
import { RequestContext } from "../logic/request_context";
import { GetEdgePropsParams } from "../logic/types";
import React from "react";

const PAGE_SIZE = 25;

export async function getEdgeProps(params: GetEdgePropsParams) {
  if (APP_RUNTIME !== "blueboat") {
    const posts: Post[] = [
      {
        id: "13e07d7a-f3e9-4553-988f-1134cbdb0b85",
        shortKey: "test-key-2",
        author: "gh:1",
        title: "Test Post 2",
        body: "",
        isPublic: true,
        createdAt: new Date("2022-05-10").getTime(),
      },
      {
        id: "39884df1-6bd7-4add-973e-d3c860b533e8",
        shortKey: "test-key-1",
        author: "gh:1",
        title: "Test Post 1",
        body: "",
        isPublic: true,
        createdAt: new Date("2021-10-22").getTime(),
      },
    ]
    return {
      props: {
        posts,
      }
    };
  }

  const ctx = RequestContext.get(params.event.request);
  const identity = ctx.getIdentity();
  const page = parseInt(params.query["page"] || "1");
  if (!Number.isSafeInteger(page) || page < 1 || page > 1000) {
    throw new Response("invalid page number", { status: 400 });
  }

  const posts = await loadPostList({
    ctx,
    showPrivate: !!identity,
    offset: (page - 1) * PAGE_SIZE,
    limit: PAGE_SIZE,
  })

  return {
    props: {
      posts,
    },
  }
}

export default function Posts({ posts }: { posts: Post[] }) {
  return <div>
    {posts.map(p => {
      return <div key={p.id}>
        <h2>{p.title}</h2>
      </div>
    })}
  </div>
}