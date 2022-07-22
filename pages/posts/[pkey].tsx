import { loadPost, Post } from "../../logic/post";
import { RequestContext } from "../../logic/request_context";
import { GetEdgePropsParams } from "../../logic/types";
import React, { useEffect, useRef } from "react";
import { PageBody } from "../../components/page_body";
import { TopBar } from "../../components/top_bar";
import { DateFormatter } from "../../components/date_formatter";
import * as marked from "marked";
import { PostPropIcon } from "../../components/post_prop_icon";
const { default: Link } = require("flareact/link");

const classForTag: Record<string, string> = {
  ul: "list-disc",
  ol: "list-decimal",
  a: "underline text-black dark:text-white dark:hover:opacity-60",
  h1: "text-xl font-bold",
  h2: "text-lg font-semibold",
  h3: "font-semibold",
  p: "text-zinc-800 dark:text-zinc-300",
  li: "text-zinc-800 dark:text-zinc-300",
};

function renderMarkdown_blueboat(source: string): string {
  const str = TextUtil.Markdown.renderToHtml(source, {
    disable_sanitization: true,
    enable_strikethrough: true,
    enable_tables: true,
  });
  try {
    const html = TextUtil.DOM.HTML.parse(str, {
      fragment: true,
    });
    const postprocessDocument = () => {
      html.queryWithFilter({
        type: "true",
      }, node => {
        const data = node.get();
        if (data.type === "element") {
          let changed = false;

          if (data.name === "a") {
            if (!data.attrs.find(x => x.name === "target")) {
              data.attrs.push({
                name: "target",
                value: "_blank",
              });
              changed = true;
            }
          }

          const classToAdd = classForTag[data.name];
          if (classToAdd) {
            const klass = data.attrs.find(x => x.name == "class");
            if (klass) {
              klass.value = classToAdd + " " + klass.value;
            } else {
              data.attrs.push({ name: "class", value: classToAdd });
            }
            changed = true;
          }

          if (changed) node.update(data);
        }
        return true;
      })
    }
    postprocessDocument();
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
  post.body = "";

  return {
    props: {
      post,
      rendered: APP_RUNTIME === "blueboat" ? renderMarkdown_blueboat(source) : marked.marked.parse(source),
      transformHtmlAtFrontend: APP_RUNTIME !== "blueboat",
      isAdmin: !!identity,
    },
  }
}

export default function PostByKey({ post, rendered, isAdmin, transformHtmlAtFrontend }: { post: Post, rendered: string, isAdmin: boolean, transformHtmlAtFrontend: boolean }) {
  const postBodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!transformHtmlAtFrontend) return;

    const postBody = postBodyRef.current!;
    for (const [tag, classList] of Object.entries(classForTag)) {
      const elements = postBody.getElementsByTagName(tag)
      for (const el of elements) {
        el.className += " " + classList;
      }
    }
  }, []);
  return <PageBody title={post.title}>
    <TopBar title={post.title} selected={post.shortKey === "about" ? "about" : ""}
      secondary={<div className="opacity-60 text-sm flex flex-row gap-2 items-center">
        <DateFormatter dateMs={post.createdAt} />
        {isAdmin && <PostPropIcon post={post} className="w-4 h-4" />}
      </div>}
    />
    <div className="flex flex-col gap-2">
      <div className="post-body" ref={postBodyRef} dangerouslySetInnerHTML={{ __html: rendered }}></div>
      {isAdmin && <div className="opacity-60 pt-8 flex flex-col gap-2 text-sm">
        <div className="flex flex-row"><a href={`/api/v1/content/load?id=${encodeURIComponent(post.id)}`} className="underline" target="_blank">Source</a></div>
        <div className="flex flex-row"><Link href="/write" as={`/write?id=${encodeURIComponent(post.id)}`} prefetch={false}><a className="underline">Edit</a></Link></div>
      </div>}
    </div>
  </PageBody>
}