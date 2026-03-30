/* @refresh reload */
import { render } from "solid-js/web";
import SettingsApp from "./app/Settings";
import DownloadApp from "./app/Download";
import "./App.css";

const App = () => {
  const location = window.location.hash;
  if (location === "#settings") {
    return (
      <SettingsApp/>
    )
  } else if (location === "#download") {
    return (
      <DownloadApp/>
    )
  } else {
    return (
      <div>
        <h1 class="text-5xl">Please open an issue on <a href="https://github.com/lil-aleks/download_manager/issues" target="_blank">Github</a> because you shouldn't be here.</h1>
      </div>
    )
  }
}

render(() => <App/>, document.getElementById("root") as HTMLElement);
