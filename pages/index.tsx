import React from "react";

export function getEdgeProps() {
  return {
    props: {
      runtime: APP_RUNTIME,
    }
  }
}

export default function Index({ runtime }: { runtime: string }) {
  return (
    <h1>
      You're running React on the Edge! Runtime is {runtime}.
    </h1>
  );
}
