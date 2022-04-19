import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.scss";

import App from "./App";
import Error404 from "./Error404";

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="" element={<App />}></Route>
      <Route path="*" element={<Error404 />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById("root"),
);
