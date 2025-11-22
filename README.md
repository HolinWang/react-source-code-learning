# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    },
  ])
  ````

  ## Mini React（学习版） — API 概览 与 使用示例

  本仓库包含一个简化的 React 实现（基于 Fiber 思想的教学实现），用于学习与演示：如何把渲染拆分为小任务、如何通过时间切片调度渲染、以及如何在 Commit 阶段统一提交 DOM。

  运行开发服务器（在项目根目录）：

  ```bash
  npm install
  npm run dev
  ```

  在浏览器中打开：

  ```
  http://localhost:5173/
  ```

  ### 快速使用（最小示例）

  1. `src/main.jsx`（入口）：

  ```js
  import App from './App.jsx'
  import ReactDom from './core/ReactDom.js'

  ReactDom.createRoot(document.getElementById('root')).render(App)
  ```

  2. `src/App.jsx`（JSX 示例）：

  ```jsx
  const App = (
    <div id="parent">
      <div id="child">hello jsx</div>
    </div>
  );

  export default App;
  ```

  3. 你也可以直接使用 `createElement()`：

  ```js
  import React from './core/React.js';

  const node = React.createElement('div', { id: 'my' }, 'Hello');
  ```

  ### 导出 API（简要说明）

  - `React.createElement(type, props, ...children)` — 将 JSX / 参数转换为统一的虚拟节点（VNode）。
  - `ReactDom.createRoot(container).render(node)` — 把 VNode 渲染到指定容器（启动 Fiber 工作循环）。

  内部（教学用）模块（你可以在 `src/core/` 目录查看并学习实现细节）：
  - `src/core/React.js` — 主逻辑：render、performUnitOfWork、调度（workLoop）、commitRoot。
  - `src/core/ReactDom.js` — 提供 `createRoot` 封装，接入 UI 容器。
  - `src/core/domUtils.js` — 简化的 DOM 操作工具：createDom、updateProperties、appendDomToRootContainer（用于演示）。
  - `src/core/childrenUtils.js` — children 的规范化（扁平化、文本转 TEXT_ELEMENT）。
  - `src/core/fiberUtils.js` — commitWork 的实现（递归提交 fiber 到 DOM）。

  ### 行为说明（与真实 React 的差异）

  - 这是一个精简版实现，没有完整的 reconciliation（diff）逻辑：当前实现每次会创建新的 DOM（并在 commit 阶段追加到页面）。
  - 属性更新简单直接：`updateProperties` 会直接把 props 写到 DOM 上（不处理事件、样式合并或属性删除）。
  - 目前没有实现函数组件/Hooks 的完整支持（后续可以扩展）。

  ### 常见扩展点（学习建议）

  - 将 render 阶段的 DOM 创建与 commit 阶段的 DOM 插入严格区分（现在项目里已做了此区分）。
  - 实现简化的 reconciliation：对比旧 fiber 树与新 fiber 树，生成最小的 DOM 更新操作。
  - 增强属性更新逻辑：区分事件、样式对象，支持删除旧属性。
  - 支持函数组件与 Hooks（useState、useEffect 简化版）。

  如果你想我把某个模块或方法进一步拆解成更小的功能并添加单元测试（例如对 `normalizeChildren` 提供测试用例），我可以继续实现并创建测试样例。

        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
