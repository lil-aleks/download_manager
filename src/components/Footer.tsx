import { invoke } from "@tauri-apps/api/core";
import { Component, createEffect, createSignal } from "solid-js";

type FooterInfo = {
  link: string,
  version: string
}

const Footer: Component = () => {
  const [info, setInfo] = createSignal<FooterInfo>();

  createEffect(() => {
    invoke<FooterInfo>("get_footer_info").then((info) => setInfo(info));
  })

  return (
    <div class="w-full flex flex-row justify-between text-xs text-gray-400 px-1">
      <a href={info()?.link} target="_blank">{info()?.link.replace("https://", "")}</a>
      <p>{info()?.version}</p>
    </div>
  );
};

export default Footer;