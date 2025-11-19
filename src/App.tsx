import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import "./App.css";
import { Component, createSignal, onCleanup, Show } from "solid-js";

export type Downloaded = {
  location: string;
  display_name: string;
};

function App() {
  const [file, setFile] = createSignal<Downloaded>();
  const [optionsShown, setOptionsShown] = createSignal<boolean>(false);

  const chooseFolder = async () => {
    const folder = await open({ directory: true, multiple: false });
    if (folder) {
      setFile();
      await invoke("move_file", { folder: folder });
    }
  };

  const ignoreFile = async () => {
    await invoke("ignore_file");
  };

  const deleteFile = async () => {
    await invoke("delete_file");
  };

  const openDelayOptions = async () => {
    setOptionsShown(await invoke("open_delay_options"));
  };

  const closeDelayOptions = async () => {
    setOptionsShown(await invoke("close_delay_options"));
  };

  const dowloadListener = listen<Downloaded>("file_added", (event) => {
    const file = event.payload;
    setFile(file);
  });

  onCleanup(async () => {
    const unlisten = async () => {
      await dowloadListener;
    };
    unlisten();
  });

  return (
    <div class=" w-full h-full flex flex-col p-3 justify-between select-none">
      <div class="w-full flex flex-row gap-2 justify-between">
        <h1 data-tauri-drag-region class=" text-fg text-xl font-bold">
          New File Downloaded
        </h1>
        <div class="flex flex-row gap-2 content-center items-center">
          <button
            onClick={ignoreFile}
            class="bg-gray-btn hover:bg-gray-btn-dark text-fg-dark px-2 rounded-md hover:scale-102 active:scale-98 transition cursor-pointer"
          >
            Irgnore
          </button>
          <button
            onClick={deleteFile}
            class="bg-red-btn hover:bg-red-btn-dark text-fg-dark px-2 rounded-md hover:scale-102 active:scale-98 transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
      <div class="bg-bg-dark p-2 rounded-xl">
        <p class=" text-fg-dark  select-text">
          {file()?.display_name || "No file detected"}
        </p>
      </div>
      <div class=" w-full flex flex-row justify-between gap-6">
        <Show
          when={!optionsShown()}
          fallback={
            <button
              onClick={closeDelayOptions}
              class="bg-blue-btn hover:bg-blue-btn-dark w-5 cursor-pointer hover:scale-102 active:scale-98 transition py-2 rounded-xl grow text-fg"
            >
              Close
            </button>
          }
        >
          <button
            onClick={openDelayOptions}
            class="bg-blue-btn hover:bg-blue-btn-dark w-5 cursor-pointer hover:scale-102 active:scale-98 transition py-2 rounded-xl grow text-fg"
          >
            Delete later
          </button>
        </Show>

        <button
          onClick={chooseFolder}
          class="bg-blue-btn cursor-pointer hover:bg-blue-btn-dark w-5 hover:scale-102 active:scale-98 transition py-2 rounded-xl grow text-fg"
        >
          Move now
        </button>
      </div>

      <Show when={optionsShown()}>
        <div class=" w-full flex flex-row p-2 bg-bg-dark rounded-xl max-h-3/5 justify-center gap-1">
          <OptionButton label="5 min" delay={300} />
          <OptionButton label="10 min" delay={600} />
          <OptionButton label="20 min" delay={1200} />
          <OptionButton label="30 min" delay={1800} />
          <OptionButton label="1 h" delay={3600} />
        </div>
      </Show>

      <div class="w-full flex flex-row justify-between text-sm text-fg-dark">
        <a href="https://github.com/lil-aleks/download_manager" target="_blank">
          github.com/lil-aleks/download_manager
        </a>
        <p>v1.0</p>
      </div>
    </div>
  );
}

const OptionButton: Component<{ label: string; delay: number }> = (props) => {
  const deleteLater = async () => {
    await invoke("delete_file_after", { delay: props.delay });
  };

  return (
    <button
      onClick={deleteLater}
      class="bg-gray-btn cursor-pointer w-20 hover:bg-gray-btn-dark hover:scale-102 active:scale-98 transition max-h-10 rounded-md text-fg"
    >
      {props.label}
    </button>
  );
};

export default App;
