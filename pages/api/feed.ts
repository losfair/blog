import { loadPostList } from "../../logic/post";
import { RequestContext } from "../../logic/request_context";

export default async ({ request }: { request: Request }) => {
  const template = new TextDecoder().decode(Package["feed.tera"]);
  const ctx = RequestContext.get(request);
  const posts = await loadPostList({
    ctx,
    showPrivate: false,
    offset: 0,
    limit: 100,
  })
  const origin = App.env.feedOrigin || ctx.parsedUrl.origin;
  
  const rendered = Template.render(template, {
    selfUrl: origin + "/api/feed",
    siteTitle: "Heyang Zhou",
    siteLink: origin,
    siteDescription: "My personal site",
    posts: posts.map(p => {
      return {
        ...p,
        utcDate: new Date(p.createdAt).toUTCString(),
      }
    }),
  });
  return new Response(rendered, {
    headers: {
      "content-type": "text/xml",
    },
  });
};
