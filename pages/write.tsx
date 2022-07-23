import React, { useCallback, useEffect, useRef, useState } from "react";
import { PageBody } from "../components/page_body";
import { TopBar } from "../components/top_bar";
import { Identity } from "../logic/auth";
import { loadPost, Post } from "../logic/post";
import { RequestContext } from "../logic/request_context";
import { GetEdgePropsParams } from "../logic/types";
import type { UpdateRequest } from "./api/v1/content/update";
const { useRouter } = require("flareact/router");

export async function getEdgeProps(params: GetEdgePropsParams) {
  const ctx = RequestContext.get(params.event.request);
  const identity = ctx.mustGetIdentity();

  const id = params.query["id"] || undefined;
  const post = id ? await loadPost({
    ctx,
    showPrivate: true,
    id,
  }) : null;
  return {
    props: {
      post,
      identity,
    },
  };
}

export default function Write({ post, identity }: { post: Post | null, identity: Identity }) {
  const slugRef = useRef<HTMLInputElement>(null);
  const mdUrlRef = useRef<HTMLInputElement>(null);
  const isPublicRef = useRef<HTMLInputElement>(null);
  const isListedRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    slugRef.current!.value = post?.shortKey || "";
    isPublicRef.current!.checked = post?.isPublic || false;
    isListedRef.current!.checked = post?.isListed || false;
  }, []);

  const submit = useCallback(async () => {
    let title: string | undefined = undefined;
    let body: string | undefined = undefined;
    const mdUrl = mdUrlRef.current!.value;
    if (mdUrl) {
      const mdFetch = await fetch(mdUrl);
      if (mdFetch.status !== 200) {
        const error = await mdFetch.text();
        alert(`Failed to load markdown: ${error}`);
        return;
      }
      const content = await mdFetch.text();
      const contentHasTitle = content.startsWith("# ");
      title = (contentHasTitle ? content.substring(2).split("\n")[0].trim() : "") || new Date().toUTCString();
      body = contentHasTitle ? content.substring(content.indexOf("\n") + 1) : content
    }

    const req: UpdateRequest = {
      id: post?.id,
      shortKey: slugRef.current!.value || undefined,
      title,
      body,
      isPublic: isPublicRef.current!.checked,
      isListed: isListedRef.current!.checked,
    };
    const updateFetch = await fetch(`/api/v1/content/update`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(req),
    });
    if (updateFetch.status !== 200) {
      const error = await updateFetch.text();
      alert(`Failed to update post: ${error}`);
      return;
    }
    const { id }: { id: string } = await updateFetch.json();
    router.push(`/posts/[pkey]`, `/posts/${req.shortKey || (post ? post.shortKey : id)}`);
  }, []);

  const doDelete = useCallback(async () => {
    const yes = confirm("Delete this post? This action is not reversible.");
    if (!yes) return;
    const req: UpdateRequest = {
      id: post?.id,
      delete: true,
    };
    const deleteFetch = await fetch(`/api/v1/content/update`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(req),
    });
    if (deleteFetch.status !== 200) {
      const error = await deleteFetch.text();
      alert(`Failed to delete post: ${error}`);
      return;
    }
    router.push(`/posts`);
  }, []);

  return (
    <PageBody title="Write" cn={undefined}>
      <TopBar title="Write" selected="" isChinaSite={false}
      />
      <div>
        {!!post && <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">ID</label>
          <p>{post.id}</p>
        </div>}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Author</label>
          <p>{post?.author || `gh:${identity.ghId}`}</p>
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Slug</label>
          <input type="text" ref={slugRef} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div>
        {!!post && <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Title</label>
          <p><a href={`/api/v1/content/load?id=${encodeURIComponent(post.id)}`} className="underline" target="_blank">{post.title}</a></p>
        </div>}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Markdown URL</label>
          <input type="text" ref={mdUrlRef} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
        </div>
        {!!post && <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Created at</label>
          <p>{new Date(post.createdAt).toISOString()}</p>
        </div>}
        <div className="flex items-start mb-3">
          <div className="flex items-center h-5">
            <input type="checkbox" ref={isPublicRef} className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
          </div>
          <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-400">Public</label>
        </div>
        <div className="flex items-start mb-6">
          <div className="flex items-center h-5">
            <input type="checkbox" ref={isListedRef} className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
          </div>
          <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-400">Listed</label>
        </div>
        <div className="flex flex-row items-center gap-4">
          <button onClick={submit} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
          {!!post && <button onClick={doDelete} className="text-red-600 text-sm">Delete</button>}
        </div>
      </div>
    </PageBody>
  )
}
