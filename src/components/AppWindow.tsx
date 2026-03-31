import { Component, JSXElement } from "solid-js";

const AppWindow: Component<{ children?: JSXElement }> = (
  props
) => {
  return (
    <div class="w-dvw h-dvh overflow-hidden bg-linear-to-br from-blue-400/40 to-35% to-transparent">
      {props.children}
    </div>
  );
};

export default AppWindow;