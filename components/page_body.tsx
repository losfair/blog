import React, { useCallback, useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./icon";
const { default: Head } = require("flareact/head");

const colorBootstrapScript = `
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}
`;

function ColorModeSwitch() {
  const [colorMode, setColorMode] = useState(undefined as "light" | "dark" | undefined);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) setColorMode("dark");
    else setColorMode("light");
  }, []);


  const changeColorMode = useCallback((mode: "light" | "dark") => {
    setColorMode(mode);
    localStorage.theme = mode;
    if (mode === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, []);

  const changeToDark = useCallback(() => changeColorMode("dark"), [changeColorMode]);
  const changeToLight = useCallback(() => changeColorMode("light"), [changeColorMode]);

  return (
    colorMode ? <div className="flex flex-row items-center gap-2">
      <button onClick={changeToLight}><SunIcon className={`w-6 h-6 ${colorMode === "light" ? "" : "opacity-20"}`} /></button>
      <button onClick={changeToDark}><MoonIcon className={`w-6 h-6 ${colorMode === "dark" ? "" : "opacity-20"}`} /></button>
      <div className="grow"></div>
    </div> : null
  )
}

export function PageBody({ title, children, cn }: { title: string, children: React.ReactNode, cn: string | undefined }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <script>{colorBootstrapScript}</script>
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
          {!!cn && <div className="flex flex-row items-center">
            <p><a className="underline" target="_blank" href="https://beian.miit.gov.cn/">{cn}</a></p>
            <div className="grow"></div>
          </div>}
        </div>
        <div className="pt-8">
          <ColorModeSwitch />
        </div>
      </article>
    </>
  )
}
