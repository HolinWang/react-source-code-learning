import React from "./core/React";

const App = <div id="app">hello-mini-react</div>;

/**
 * JSX语法会被转换为React.createElement()函数调用
 * React.createElement("div", { id: "app" }, "hello-mini-react");
 */
function renderApp() {
  return (
    <div id="parent">
      <div id="child">hello jsx</div>
    </div>
  );
}

console.log(renderApp);

export default App;