export function getEdgeProps() {
  return {
    props: {
      runtime: APP_RUNTIME,
    }
  }
}

export default function Index({ runtime }) {
  return (
    <h1>
      You're running React on the Edge! Runtime is {runtime}.
    </h1>
  );
}
