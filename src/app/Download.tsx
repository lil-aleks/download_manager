import { Component, createSignal } from "solid-js";
import AppWindow from "../components/AppWindow";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { DefaultButton, IconButton } from "../components/Buttons";
import { EyeIcon, TrashIcon } from "../assets/Icons";
import { DefaultInput } from "../components/Inputs";

type DownloadedFileIn = {
  id: number,
  display_name: string,
  archive: boolean
}

type DownloadedFileOut = {
  id: number,
  display_name: string,
  action: Action
}

type Action =
  | { action: "delete"; after: number }
  | { action: "ignore" }
  | { action: "extract"; to: string }
  | { action: "move"; to: string };

const App: Component = () => {

  let fileNameInput;

  const [file, setFile] = createSignal<DownloadedFileIn>();
  const [warning, setWarning] = createSignal<string>("");

  return (
    <AppWindow>
      <Header title="New Download">
        {/* TODO: Buttons in header here */}
        <IconButton class="bg-zinc-500/30" svgIcon={<EyeIcon class="w-5 h-5 fill-zinc-500 "/> as Element} />
        <IconButton class="bg-red-500/30" svgIcon={<TrashIcon class="w-5 h-5 stroke-red-500"/> as Element} />
      </Header>

      <DefaultInput ref={fileNameInput} value={file()?.display_name} />

      <p class="text-xs h-0 -translate-y-2.5 text-red-400/60 px-2">{warning()}</p>

      <div class="flex flex-row justify-between items-center px-2 py-1 gap-6 w-full h-10 bg-blue-300/30 rounded-xl">
        <h1 class="font-semibold text-gray-800">Delete in:</h1>
        <div class="flex flex-row justify-between gap-3 items-center flex-1 h-full *:min-w-13">
          <DefaultButton>10m</DefaultButton>
          <DefaultButton>30m</DefaultButton>
          <DefaultButton>1h</DefaultButton>
          <DefaultButton>2h</DefaultButton>
          <DefaultButton>6h</DefaultButton>
        </div>
      </div>

      <div class="flex flex-row justify-between items-center gap-4 w-full">
        <DefaultButton class="flex-1">Move</DefaultButton>
        <DefaultButton disabled class="flex-1">Extract</DefaultButton>
      </div>

      <Footer />
    </AppWindow>
  )
}

export default App;