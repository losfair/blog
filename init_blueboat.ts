const { handleRequest } = require("flareact/src/worker");

Router.any("/", async req => {
  try {
    const res = await handleRequest({
      request: req,
    }, (require as any).context("./pages/", true, /\.(js|jsx|ts|tsx)$/), async () => {
      // static or 404
      const url = new URL(req.url);
      const staticPrefix = "/_flareact/static/";
      if (url.pathname.startsWith(staticPrefix)) {
        const path = url.pathname.substring(staticPrefix.length);
        const file = Package["_flareact/static/" + path];
        if (file !== undefined) {
          let segs = path.split(".");
          let ext = segs[segs.length - 1];
          let contentType = Dataset.Mime.guessByExt(ext) || "application/octet-stream";
          return new Response(file, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=2592000",
            }
          });
        }
      }

      return new Response("not found", {
        status: 404,
      });
    });
    return res;
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
});


// Polyfill CF worker api
(global as any).caches = {
  default: {
    async match(): Promise<unknown> {
      return null;
    },

    async put(): Promise<void> {

    }
  }
}
