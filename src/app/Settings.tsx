import { Component } from "solid-js";
import Header from "../components/Header";
import AppWindow from "../components/AppWindow";
import { Toggle } from "../components/Buttons";
import Footer from "../components/Footer";

const App: Component = () => {
  return (
    <AppWindow>
      <Header title="Settings">
        {/* TODO: Buttons in header here */}
      </Header>
      <Toggle value/>
      <Footer/>
    </AppWindow>
  )
}

export default App;