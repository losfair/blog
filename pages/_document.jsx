import Document, { Html, Head, Main, FlareactScript } from "flareact/document";

class MyDocument extends Document {
  static async getEdgeProps(ctx) {
    const props = await Document.getEdgeProps(ctx);
    return { ...props };
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <FlareactScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;