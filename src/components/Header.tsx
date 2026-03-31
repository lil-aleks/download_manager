import { Component, JSXElement } from "solid-js";

const Header: Component<{ title: string, children?: JSXElement }> = (
  props
) => {
  return (
    <div class="w-full flex flex-row gap-2  justify-between">
      <div data-tauri-drag-region class="flex flex-row items-center gap-1 w-full">
        <img src="src/assets/logo.png" class="w-6"/>
        <h1 class="text-xl font-bold">{props.title}</h1>
      </div>
      <div class="flex flex-row gap-2 content-center items-center">
        {props.children}
      </div>
    </div>
  );
};

export default Header;