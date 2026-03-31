import { Component } from "solid-js";
import AppWindow from "../components/AppWindow";
import Header from "../components/Header";

const App: Component = () => {
  return (
    <AppWindow>
      <Header title="New Download">
        {/* TODO: Buttons in header here */}
      </Header>
    </AppWindow>
  )
}

export default App;