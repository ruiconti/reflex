import "./style.css";

import { React } from "./core/micro-react";
import { ReactDOM } from "./core/micro-react-dom";
import App from "./App";

/*
  Temporary hack until I find out a way to dynamically re-issue JSX's createElement
  TODO [P-1]: Re-render without having to rely on re-parsing and re-executing JSX code
 */
export const render = () => {
  document.querySelector("#app")?.firstChild?.remove();
  ReactDOM.render(<App />, document.querySelector("#app"));
};

render();
