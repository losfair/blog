import React from "react";
import { PageBody } from "../components/page_body";
import { TopBar } from "../components/top_bar";
import { GetEdgePropsParams } from "../logic/types";
import * as pkeyPage from "./posts/[pkey]";

export async function getEdgeProps(params: GetEdgePropsParams) {
  let pageProps: any;

  try {
    pageProps = await pkeyPage.getEdgeProps({
      ...params,
      params: {
        pkey: "about",
      },
    });
  } catch (e) {
    if (e instanceof Response && e.status === 404) {
      pageProps = { props: null };
    } else {
      throw e;
    }
  }

  return {
    props: {
      page: pageProps.props,
    }
  }
}

export default function Index({ page }: { page: any }) {
  if (!page) return (
    <PageBody title="About">
      <TopBar title="About" selected="about"
      />
      <p>Create a post with slug "about" and it will be displayed on this page.</p>
    </PageBody>
  )
  return <pkeyPage.default {...page} />
}
