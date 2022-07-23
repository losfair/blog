import React from "react";
const { default: Link } = require("flareact/link");

export function TopBar({ title, selected, secondary, isChinaSite }: { title: string, selected: string, secondary?: React.ReactNode, isChinaSite: boolean }) {
  return (
    <div className="flex flex-col w-full pb-8 gap-3">
      <div className="flex flex-row">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="grow"></div>
      </div>
      <div className="flex flex-row text-sm">
        {secondary || null}
        <div className="grow"></div>
        <div className="flex flex-row gap-3">
          {!isChinaSite && <SelectableLink selectionKey="posts" selected={selected} href="/posts">Thoughts</SelectableLink>}
          <SelectableLink selectionKey="about" selected={selected} href="/">About</SelectableLink>
        </div>
      </div>
    </div>
  )
}

function SelectableLink({ selectionKey, selected, href, children }: { selectionKey: string, selected: string, href: string, children: React.ReactNode }) {
  return <Link href={href} prefetch={false}>
    <a className={`${selectionKey === selected ? "opacity-60" : "underline"}`}>{children}</a>
  </Link>
}