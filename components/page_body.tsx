import React from "react";
const { default: Head } = require("flareact/head");

export function PageBody({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <article className="container mx-auto px-4 max-w-screen-sm">
        {children}
        <div className="flex flex-col gap-2 text-xs pt-12 font-mono opacity-60">
          <div className="flex flex-row items-center">
            <p>&copy; 2022 Heyang Zhou</p>
            <div className="grow"></div>
          </div>
          <div className="flex flex-row items-center">
            <p>Powered by <a className="underline" target="_blank" href="https://github.com/losfair/blueboat">Blueboat</a></p>
            <div className="grow"></div>
          </div>
        </div>
      </article>
    </>
  )
}
