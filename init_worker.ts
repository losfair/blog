const { handleEvent } = require("flareact");

addEventListener("fetch", (event: any) => {
  try {
    event.respondWith(
      handleEvent(event, (require as any).context("./pages/", true, /\.(js|jsx|ts|tsx)$/), false)
    );
  } catch (e) {
    if (false) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        })
      );
    }
    event.respondWith(new Response("Internal Error", { status: 500 }));
  }
});