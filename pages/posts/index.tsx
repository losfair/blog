import { loadPostList, Post } from "../../logic/post";
import { RequestContext } from "../../logic/request_context";
import { GetEdgePropsParams } from "../../logic/types";
import React from "react";
import { PageBody } from "../../components/page_body";
import { TopBar } from "../../components/top_bar";
import { DateFormatter } from "../../components/date_formatter";
import { PostPropIcon } from "../../components/post_prop_icon";
import { chinaSiteIcpBeian } from "../../logic/util";
const { default: Link } = require("flareact/link");

export async function getEdgeProps(params: GetEdgePropsParams) {
  const ctx = RequestContext.get(params.event.request);
  const identity = ctx.getIdentity();

  const posts = await loadPostList({
    ctx,
    showPrivate: !!identity,
    offset: 0,
    limit: 1000,
  })

  return {
    props: {
      posts,
      isAdmin: !!identity,
      cn: chinaSiteIcpBeian(params.event.request),
    },
  }
}

export default function Posts({ posts, isAdmin, cn }: { posts: Post[], isAdmin: boolean, cn: string | undefined }) {
  return <PageBody title="Thoughts" cn={cn}>
    <TopBar title="Thoughts" selected="posts" isChinaSite={!!cn}
      secondary={isAdmin ? <div className="opacity-60">
        <Link href="/write"><a className="underline">Write</a></Link>
      </div> : undefined}
    />
    <div className="flex flex-col gap-2">
      {posts.map(p => {
        return <div key={p.id} className="flex flex-row items-center gap-1">
          <h2 className="autohyphens"><Link href="/posts/[pkey]" as={`/posts/${p.shortKey}`} prefetch={false}><a>{p.title}</a></Link></h2>
          <div className="grow"></div>
          <div className="text-sm opacity-60 flex flex-row items-center gap-2 shrink-0">
            <PostPropIcon post={p} className="w-4 h-4" />
            <p><DateFormatter dateMs={p.createdAt} /></p>
          </div>
        </div>
      })}
    </div>
  </PageBody>
}