import React from "react";
import { PageBody } from "../components/page_body";
import { TopBar } from "../components/top_bar";
import { GetEdgePropsParams } from "../logic/types";
import { chinaSiteIcpBeian } from "../logic/util";
import * as pkeyPage from "./posts/[pkey]";

export async function getEdgeProps(params: GetEdgePropsParams) {
  let pageProps: any;
  let cn = chinaSiteIcpBeian(params.event.request);

  try {
    pageProps = await pkeyPage.getEdgeProps({
      ...params,
      params: {
        pkey: cn ? "about-cn" : "about",
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
      cn,
    }
  }
}

export default function Index({ page, cn }: { page: any, cn: string | undefined }) {
  if (!page) return (
    <PageBody title="About" cn={cn}>
      <TopBar title="About" selected="about" isChinaSite={!!cn}
      />
      <p>Create a post with slug "about" and it will be displayed on this page.</p>
    </PageBody>
  )
  return <pkeyPage.default {...page} />
}
