import Document, { Html, Head, Main, FlareactScript } from "flareact/document";

class MyDocument extends Document {
  static async getEdgeProps(ctx) {
    const props = await Document.getEdgeProps(ctx);
    return { ...props };
  }

  render() {
    return (
      <Html lang="en">
        <Head />
        <body className="bg-white dark:bg-zinc-900 text-black dark:text-zinc-100">
          <Main />
          <FlareactScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;