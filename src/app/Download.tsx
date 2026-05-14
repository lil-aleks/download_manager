import { Component, createSignal } from "solid-js";
import AppWindow from "../components/AppWindow";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { DefaultButton, IconButton } from "../components/Buttons";
import { EyeIcon, TrashIcon } from "../assets/Icons";
import { DefaultInput } from "../components/Inputs";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

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

  listen<DownloadedFileIn>("file_added", (event) => {
    const file = event.payload;
    setFile(file);
  });

  function performAction(action: Action) {
    if (!file()) {
      setWarning("There is no new file.");
      return;
    }

    if (!fileNameInput!.value) {
      setWarning("Filename can not be empty! Original name: " + file()?.display_name);
      return;
    }

    const arg: DownloadedFileOut = {
      id: file()?.id!,
      display_name: fileNameInput!.value!,
      action: action
    }
    invoke("perform_action", arg);
  }

  async function selectFolder(then: (folder: string) => void) {
    const folder = await open({ directory: true, multiple: false });
    if (folder) {
      then(folder);
    }
  }

  return (
    <AppWindow>
      <Header title="New Download">
        <IconButton onClick={() => performAction({action: "ignore"})} class="bg-zinc-500/30" svgIcon={<EyeIcon class="w-5 h-5 fill-zinc-500 "/> as Element} />
        <IconButton onClick={() => performAction({action: "delete", after: 0})} class="bg-red-500/30" svgIcon={<TrashIcon class="w-5 h-5 stroke-red-500"/> as Element} />
      </Header>

      <DefaultInput ref={fileNameInput} value={file()?.display_name} />

      <p class="text-xs h-0 -translate-y-2.5 text-red-400 px-2">{warning()}</p>

      <div class="flex flex-row justify-between items-center px-2 py-1 gap-6 w-full h-10 border border-zinc-400/30 shadow-inner rounded-xl">
        <h1 class="font-semibold text-gray-800 select-none text-shadow-md">Delete in:</h1>
        <div class="flex flex-row justify-between gap-3 items-center flex-1 h-full *:min-w-13">
          {/* Maybe create a setting for customizable options. */}
          <DefaultButton onClick={() => performAction({action: "delete", after: 10})}>10m</DefaultButton>
          <DefaultButton onClick={() => performAction({action: "delete", after: 30})}>30m</DefaultButton>
          <DefaultButton onClick={() => performAction({action: "delete", after: 60})}>1h</DefaultButton>
          <DefaultButton onClick={() => performAction({action: "delete", after: 120})}>2h</DefaultButton>
          <DefaultButton onClick={() => performAction({action: "delete", after: 360})}>6h</DefaultButton>
        </div>
      </div>

      <div class="flex flex-row justify-between items-center gap-4 w-full">
        <DefaultButton onClick={() => selectFolder((folder) => performAction({action: "move", to: folder}))} class="flex-1">Move</DefaultButton>
        <DefaultButton onClick={() => selectFolder((folder) => performAction({action: "extract", to: folder}))} disabled={fileNameInput!.value.endsWith(".zip") ? false : true} class="flex-1">Extract</DefaultButton>
      </div>

      <Footer />
    </AppWindow>
  )
}

export default App;