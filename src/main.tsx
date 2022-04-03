import "./style.css";

import { React } from "./core/react";
import { ReactDOM } from "./core/react-dom";
import App from "./App";

document.querySelector("#app")?.firstChild?.remove();
ReactDOM.render(<App />, document.querySelector("#app"));
