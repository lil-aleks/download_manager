import { Component, JSXElement } from "solid-js";

const AppWindow: Component<{ children?: JSXElement }> = (
  props
) => {
  return (
    <div class="w-dvw h-dvh overflow-hidden flex flex-col justify-between p-2">
      {props.children}
    </div>
  );
};

export default AppWindow;