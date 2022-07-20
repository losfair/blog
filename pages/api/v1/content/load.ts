import { loadPost } from "../../../../logic/post";
import { RequestContext } from "../../../../logic/request_context"
import { mkJsonResponse } from "../../../../logic/util";

export default async ({ request }: { request: Request }) => {
  const ctx = RequestContext.get(request);
  const identity = ctx.mustGetIdentity(); // require authentication
  const id = ctx.parsedUrl.searchParams.get("id");
  if (!id) return mkJsonResponse({
    error: "missing id",
  }, 400);

  if (request.method === "GET") {
    const post = await loadPost({
      ctx,
      showPrivate: true,
      id,
    });
    if (!post) return mkJsonResponse({
      error: "post not found",
    }, 404);

    if (request.headers.get("accept") === "application/json") {
      return post;
    } else {
      return new Response(post.body, {
        headers: {
          "content-type": "text/plain",
        },
      });
    }
  }

  return mkJsonResponse({
    error: "invalid method",
  }, 405);
}
