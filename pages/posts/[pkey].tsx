import { loadPost, loadPostList, Post } from "../../logic/post";
import { RequestContext } from "../../logic/request_context";
import { GetEdgePropsParams } from "../../logic/types";
import React from "react";
import { PageBody } from "../../components/page_body";
import { TopBar } from "../../components/top_bar";
import { DateFormatter } from "../../components/date_formatter";
import * as marked from "marked";
import { PostPropIcon } from "../../components/post_prop_icon";
const { default: Link } = require("flareact/link");

function renderMarkdown_blueboat(source: string): string {
  const str = TextUtil.Markdown.renderToHtml(source, {
    disable_sanitization: true,
  });
  try {
    const html = TextUtil.DOM.HTML.parse(str, {
      fragment: true,
    });
    const addClassForTag = (tag: string, classToAdd: string) => {
      html.queryWithFilter({
        type: "tag",
        tag,
      }, node => {
        const data = node.get();
        if (data.type === "element") {
          const klass = data.attrs.find(x => x.name == "class");
          if (klass) {
            klass.value = classToAdd + " " + klass.value;
          } else {
            data.attrs.push({ name: "class", value: classToAdd });
          }
          node.update(data);
        }
        return true;
      })
    }
    addClassForTag("ul", "list-disc");
    addClassForTag("ol", "list-decimal");
    return new TextDecoder().decode(html.serialize());
  } catch (e) {
    console.log("html transform failed: " + e.stack);
    return str + "\n<!-- html transform failed -->";
  }
}

export async function getEdgeProps(params: GetEdgePropsParams) {
  const ctx = RequestContext.get(params.event.request);
  const identity = ctx.getIdentity();
  const shortKey = params.params.pkey;
  const post = shortKey ? await loadPost({
    ctx,
    showPrivate: !!identity,
    shortKey,
  }) : null;

  if (!post) throw new Response("post not found", {
    status: 404,
  });

  const source = post.body;
  if (!identity) post.body = ""; // Markdown source is private

  return {
    props: {
      post,
      rendered: APP_RUNTIME === "blueboat" ? renderMarkdown_blueboat(source) : marked.marked.parse(source),
      isAdmin: !!identity,
    },
  }
}

export default function PostByKey({ post, rendered, isAdmin }: { post: Post, rendered: string, isAdmin: boolean }) {
  return <PageBody title={post.title}>
    <TopBar title={post.title} selected=""
      secondary={<div className="opacity-60 text-sm flex flex-row gap-2 items-center">
        <DateFormatter dateMs={post.createdAt} />
        <PostPropIcon post={post} className="w-4 h-4" />
      </div>}
    />
    <div className="flex flex-col gap-2">
      <div className="post-body" dangerouslySetInnerHTML={{ __html: rendered }}></div>
      {isAdmin && <div className="opacity-60 pt-8 flex flex-col gap-2 text-sm">
        <div className="flex flex-row"><a href={`/api/v1/content/load?id=${encodeURIComponent(post.id)}`} className="underline" target="_blank">Source</a></div>
        <div className="flex flex-row"><Link href="/write" as={`/write?id=${encodeURIComponent(post.id)}`}><a className="underline">Edit</a></Link></div>
      </div>}
    </div>
  </PageBody>
}