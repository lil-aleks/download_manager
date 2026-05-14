import { Component, createSignal, JSXElement, mergeProps } from "solid-js";

export const DefaultButton: Component<{ class?: string; disabled?: boolean; children?: JSXElement; onClick?: () => void }> = (
  props
) => {
  const merged = mergeProps({ disabled: false, class: "" }, props);

  return (
    <button disabled={merged.disabled} onClick={merged.onClick} class={"rounded-xl text-shadow-md bg-blue-400 px-3 py-1 shadow-md text-white tracking-wider font-semibold disabled:opacity-55 disabled:bg-gray-400 not-disabled:cursor-pointer not-disabled:hover:scale-102 not-disabled:active:scale-98 transition " + merged.class}>
      {merged.children}
    </button>
  );
};

export const Toggle: Component<{ class?: string; innerClass?: string; value: boolean; onChange?: (value: boolean) => void;}> = (
  props
) => {
  const merged = mergeProps({class: "", innerClass: "" }, props);

  const [enabled, setEnabled] = createSignal(false);
  
  return (
    <div
      class={
        "w-12 h-6 flex items-center shadow-md rounded-full p-1 cursor-pointer transition " +
        (enabled() ? "bg-blue-400 " : "bg-gray-400 ") + merged.class
      }
      onClick={() => {
        merged.onChange?.(!enabled());
        setEnabled(!enabled())
      }}
    >
      <div
        class={
          "w-4 h-4 bg-white rounded-full shadow-md transform transition " +
          (enabled() ? "translate-x-6 " : "translate-x-0 ") + merged.innerClass
        }
      />
    </div>
  )
}

export const IconButton: Component<{ class?: string; svgIcon: Element; onClick?: () => void}> = (
  props
) => {
  const merged = mergeProps({class: "bg-blue-400"}, props);
  return (
    <div onClick={merged.onClick} class={"p-1 rounded-lg hover:scale-105 shadow-md active:scale-95 transition " + merged.class}>
      {props.svgIcon}
    </div>
  )
}

