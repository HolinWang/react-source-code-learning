import React from "./core/React";

const App = <div id="app">hello-mini-react
  <RenderApp/>
</div>;

/**
 * JSX语法会被转换为React.createElement()函数调用
 * React.createElement("div", { id: "app" }, "hello-mini-react");
 */
function RenderApp() {
  return (
    <div id="parent">
      <div id="child">hello jsx</div>
      <div id="child1">hello jsx, this is Holin
        <ul>
          <li>look</li>
          <li>my</li>
          <li>eyes</li>
        </ul>

      </div>
    </div>
  );
}

console.log(RenderApp);

export default App;