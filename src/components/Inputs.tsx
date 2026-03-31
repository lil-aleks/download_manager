import { Component, mergeProps } from "solid-js";

export const DefaultInput: Component<{ class?: string; value?: string; placeholder?: string; onChange?: (e: Event & {currentTarget: HTMLInputElement; target: HTMLInputElement;}) => void; }> = (
  props
) => {
  const merged = mergeProps({ value: "", placeholder: "", class: "" }, props);

  return (
    <input type="text" value={merged.value} onChange={merged.onChange} class={"rounded-xl bg-white px-2 py-1 border-blue-400/75 border-2 outline-0 text-black font-semibold transition " + merged.class}/>
  );
};