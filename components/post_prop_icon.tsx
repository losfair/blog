import React from "react";
import { Post } from "../logic/post";
import { EyeOffIcon, LockIcon } from "./icon";

export function PostPropIcon({ post, className }: { post: Post, className: string }) {
  return !post.isPublic ? <LockIcon className={className} /> : !post.isListed ? <EyeOffIcon className={className} /> : null;
}