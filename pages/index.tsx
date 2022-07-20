import React from "react";
import { DateFormatter } from "../components/date_formatter";
import { PageBody } from "../components/page_body";
import { TopBar } from "../components/top_bar";

export default function Index() {
  return <PageBody title="About">
    <TopBar title="About" selected="about" />
      <p>
        Hello world!
      </p>
  </PageBody>
}
