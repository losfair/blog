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
  const [postState, setPostState] = useState(post);
  const slugRef = useRef<HTMLInputElement>(null);
  const gistIdRef = useRef<HTMLInputElement>(null);
  const isPublicRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    slugRef.current!.value = post?.shortKey || "";
    isPublicRef.current!.checked = post?.isPublic || false;
  }, []);

  const submit = useCallback(async () => {
    let title: string | undefined = undefined;
    let body: string | undefined = undefined;
    const gistId = gistIdRef.current!.value;
    if (gistId) {
      const gistFetch = await fetch(`https://api.github.com/gists/${encodeURIComponent(gistIdRef.current!.value)}`);
      if (gistFetch.status !== 200) {
        const error = await gistFetch.text();
        alert(`Failed to load gist: ${error}`);
        return;
      }
      const gistJson = await gistFetch.json();
      const firstFile = Object.values(gistJson.files)[0] as any;
      body = firstFile.content as string;
      title = (body.startsWith("# ") ? body.substring(2).split("\n")[0] : "") || firstFile.filename;
    }

    const req: UpdateRequest = {
      id: post?.id,
      shortKey: slugRef.current!.value || undefined,
      title,
      body,
      isPublic: isPublicRef.current!.checked,
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
    router.push(`/posts/[pkey]`, `/posts/${id}`);
  }, []);

  return (
    <PageBody title="Write">
      <TopBar title="Write" selected=""
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
          <input type="text" ref={slugRef} value={post?.shortKey || ""} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div>
        {!!post && <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Title</label>
          <p><a href={`/api/v1/content/load?id=${encodeURIComponent(post.id)}`} className="underline" target="_blank">{post.title}</a></p>
        </div>}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Gist ID</label>
          <input type="text" ref={gistIdRef} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
        </div>
        {!!post && <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Created at</label>
          <p>{new Date(post.createdAt).toISOString()}</p>
        </div>}
        <div className="flex items-start mb-6">
          <div className="flex items-center h-5">
            <input type="checkbox" ref={isPublicRef} className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
          </div>
          <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-400">Public</label>
        </div>
        <button onClick={submit} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
      </div>
    </PageBody>
  )
}
