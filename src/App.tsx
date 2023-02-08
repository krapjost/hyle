import "uno.css";
import "@unocss/reset/tailwind.css";

import type { Component } from "solid-js";
import { lazy } from "solid-js";
import { Router, Routes, Route } from "@solidjs/router";

const Main = lazy(() => import("./components/Main"));
const Auth = lazy(() => import("./components/Auth"));
const NotFound = lazy(() => import("./components/NotFound"));

const App: Component = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" component={Main} />
        <Route path="/login" component={Auth} />
        <Route path="/*" component={NotFound} />
      </Routes>
    </Router>
  );
};

export default App;
