import { Component } from "solid-js";
import Header from "../components/Header";
import AppWindow from "../components/AppWindow";

const App: Component = () => {
  return (
    <AppWindow>
      <Header title="Settings">
        {/* TODO: Buttons in header here */}
      </Header>
    </AppWindow>
  )
}

export default App;