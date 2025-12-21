/**
 * Mini React --- Core Renderer （精简版）
 *
 * 本文件实现一个非常精简的 Fiber 渲染器的核心逻辑（非完整实现，偏教学/探索用途）。
 * 目标与分层：
 * - render(): 接收虚拟 DOM（由 JSX 或 createElement 创建），将整体渲染任务拆分为 fiber 工作单元并启动时间切片调度。
 * - performUnitOfWork(): 在 render 阶段构建/链接 fiber 节点并创建真实 DOM（但不立即挂载到页面上，挂载在 commit 阶段统一处理以优化性能）。
 * - commitRoot()/commitWork(): 将计算完成的 DOM 树统一提交到真实 DOM（避免 render 阶段频繁 DOM 操作）。
 *
 * 重要约定（fiber 结构）：
 * - fiber.type: 节点类型（字符串标签或 'TEXT_ELEMENT'）。
 * - fiber.props: 属性对象（包含 children 数组）。
 * - fiber.dom: 对应的真实 DOM 节点（在 render 阶段 createDom 后创建）。
 * - fiber.parent: 父 fiber 引用（用于 commit 时挂载）。
 * - fiber.child: 第一个子 fiber 链接（深度优先处理顺序）。
 * - fiber.sibling: 兄弟 fiber 链接（以支持广度上的顺序处理）。
 *
 * 设计说明（简要）：
 * - 为支持页面响应性，渲染任务被拆分为多个小的工作单元（fiber），并通过 requestIdleCallback 的空闲时间片执行。
 * - render 阶段只负责构建 DOM 节点并建立 fiber 链表（depth-first 构建），真正的 DOM 插入在 commit 阶段一次性完成。
 * - 目前未实现 diff 算法（每次都重新构建），未实现事件绑定/样式差分等高级特性。
 */

import { createDom, updateProperties } from './domUtils.js';
import { commitWork } from './fiberUtils.js';
import { normalizeChildren } from './childrenUtils.js';

/**
 * render(node, container)
 *
 * 入口渲染函数。它把 App 或传入的虚拟 DOM 转成一个根 fiber 并将其赋值为 nextWorkOfUnit。
 * 接着 requestIdleCallback 会在空闲时间调度调度器（workLoop）来逐步处理这个 root fiber。
 *
 * 说明：这里并不立即把 node 渲染到页面上，而是把 container 作为根 fiber 的 dom 字段，以便后续 commit 阶段使用。
 *
 * 输入：
 * - node: 虚拟节点（由 createElement/JSX 生成）
 * - container: 真实 DOM 节点（通常是 document.getElementById('root')）
 *
 * 输出/副作用：
 * - 设置 nextWorkOfUnit 为根 fiber，供工作循环处理
 * - 设置 root 以便在 commit 阶段统一提交
 */
let root = null;
function render(node, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [node]
    }
  }

  root = nextWorkOfUnit
}


/**
 * createTextNode
 *
 * 生成内部使用的 TEXT_ELEMENT 类型的虚拟节点结构。JSX 中的文本节点会被转换为该类型，
 * 以便统一后续处理（createDom 时创建 TextNode）。
 *
 * 输入：text - 文本值（string/number）
 * 返回值：一个包含 type: 'TEXT_ELEMENT' 的虚拟节点对象
 */
function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}


/**
 * createElement(type, props, ...children)
 *
 * 简易实现 of React.createElement：把 JSX 或 createElement 的调用转换为统一的虚拟节点结构。
 * - 将 children 中的字符串转换为 TEXT_ELEMENT
 * - 保留传入的 props 字段（会在 render 阶段被用于设置真实 DOM）
 *
 * 注意：此实现较为简化，不处理 key/ref、事件处理器特殊绑定。
 */
export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((node) => {
        return typeof node === "string" ? createTextNode(node) : node;
      })
    }
  }
}

// 工具函数已在顶部导入（createDom, updateProperties, normalizeChildren, commitWork）

/**
 * 更新属性，不包含children属性
 * @param {*} dom 
 * @param {*} props 
 */
// updateProperties 已移至 domUtils.updateProperties

/**
 * 将dom节点添加到合适的容器中：
 * - 优先挂到 parent.dom
 * - 若 parent.dom 不存在或 parent 为 null，则回退到 document.querySelector('#root')
 * 这个函数封装了副作用的部分，便于维护和测试。
 * 
 * @param {*} dom 
 * @param {*} parentFiber 
 * @returns 
 */
// appendDomToRootContainer 已移至 domUtils.appendDomToRootContainer

/**
 * performUnitOfWork 方法的职责是处理单个工作单元（fiber节点）, 包括一下功能：
 * 1. 创建对应的DOM节点（如果还没有创建的话）
 * 2. 更新DOM节点的属性
 * 3. 为子节点创建fiber节点（不在此阶段挂载DOM，推迟到commit阶段）
 * 4. 返回下一个需要处理的工作单元（fiber节点） 
 * @param {*} fiber 
 * @returns 
 */

/**
 * 
 * performUnitOfWork是什么？主要功能是啥？
 * performUnitOfWork是一个核心的渲染逻辑，用于处理单个工作单元（fiber 节点）。这个函数相当于一个递归函数，用于处理单个 fiber 节点。
* 这是调度器在 render 阶段的核心步骤：针对当前的 fiber
 * 1. 确保真实 DOM 节点存在（若不存在则创建）
* 2. 更新 DOM 属性（不包括 children）
* 3. 基于当前 fiber 的 children 创建子 fiber（仅构建 fiber 链表，不进行 DOM 挂载）
* 4. 返回下一个要处理的 fiber（深度优先遍历）：优先 child -> sibling -> 父的 sibling -> 继续向上
 *
* 关键设计：
* - 在 render 阶段并不 append 元素到页面（避免频繁 DOM 操作），挂载在 commitRoot() 时统一执行。
* - children 的规范化通过 normalizeChildren 做扁平化 / 类型替换（字符串 -> TEXT_ELEMENT），使得主算法更为简洁。
*
* 签名：输入 fiber（可能包含已有 dom / props / parent 等），返回下一个要处理的 fiber 或 null
 */
function performUnitOfWork(fiber) {
  // 先做空值检查，避免传入 undefined 的 fiber 导致后续运行时错误
  if (!fiber) return null;

  // 确保 fiber.props 始终存在，避免后续访问时出现 undefined 错误
  // 不要直接在原始 props 上 mutate，因为它可能是不可扩展的（导致 TypeError）。
  const existingProps = fiber.props || { children: [] };

  const isFunctionComponent = typeof fiber.type === 'function';
  if (isFunctionComponent) {
    // 如果是函数组件，执行函数以得到其返回的虚拟 DOM（Vnode）
    // 例如：function RenderApp(props) { return <div>...</div> }
    // 其返回值可能是 null、字符串、单个虚拟节点或数组。
    const childFromComponent = fiber.type(existingProps);
    // 把函数组件返回值包装进 props.children，不过不要直接修改原 props（可能不可扩展）。
    // 使用对象展开创建一个新的 props 对象，保证可扩展性和不修改原有对象。
    fiber.props = Object.assign(
      {},
      existingProps,
      {
        children: childFromComponent ? [childFromComponent] : []
      }
    );
    // Debug: log that a function component was processed and number of children
    console.log('Processed function component:', fiber.type.name || fiber.type, '-> children:', fiber.props.children);
  }

  if (!isFunctionComponent) {
    // 创建dom节点
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);

      // props 已在上面做了初始化和绑定
      // 将非 children 的 props 赋值到 dom（updateProperties 由 domUtils.js 实现）
      updateProperties(fiber.dom, fiber.props);
    }
  }
  // 此判断已在顶部进行了检查，所以不再需要

  // 为子节点创建 fiber 节点，使用 normalizeChildren 标准化
  // 为子节点创建 fiber 节点：
  // - 调用 normalizeChildren 把 children 规范化为扁平数组并把文本变为 TEXT_ELEMENT
  // - 为每一个 child 创建一个 newFiber，并链接 parent/child/sibling
  const flatChildren = normalizeChildren(fiber.props.children);
  let prevSibling = null;
  flatChildren.forEach((child, index) => {
    // 跳过 null/undefined 的子节点
    if (!child) return;

    // 如果 child 为字符串或数字，创建 TEXT_ELEMENT 纤程
    const c = (typeof child === 'string' || typeof child === 'number') ? { type: 'TEXT_ELEMENT', props: { nodeValue: String(child), children: [] } } : child;
    const newFiber = {
      type: c.type,
      props: c.props,
      dom: null,
      parent: fiber,
      sibling: null,
      child: null
    };

    // 链接兄弟节点
    if (index === 0 || !prevSibling) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  });

  // 返回下一个工作单元
  if (fiber.child) {
    return fiber.child;
  }
  // 若无子节点，寻找下一个兄弟节点或父节点的兄弟节点
  let nextFiber = fiber;
  while (nextFiber) {
    // 寻找兄弟节点
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 没有兄弟节点，继续向上寻找父节点
    nextFiber = nextFiber.parent;
  }
  // 没有下一个工作单元，返回 null
  return null;
}

/**
 * 提交工作单元，将 fiber 的 DOM 节点添加到其父节点的 DOM 中
 * @param {*} fiber 
 * @returns 
 */
// commitWork 已移至 fiberUtils.commitWork

/**
 * 提交根节点到屏幕
 */
function commitRoot() {
  // 提交根节点到屏幕的逻辑
  // commitRoot 会把我们在 render 阶段构建的 fiber 树统一提交到真实 DOM。
  // 注意：commitWork 只会在父节点的 dom 已经存在时进行 appendChild，这也是我们把 append 操作集中到 commit 阶段的原因。
  console.log('Committing root to screen');
  // 如果 root 为 null，则 commitWork 不会执行任何操作。这也是我们在 render 阶段设置 root 的目的——标识这次渲染的根。
  commitWork(root);
  // 提交完成后，清空 root
  root = null;
}

// nextWorkOfUnit 由 render 设置为根工作单元
let nextWorkOfUnit = null;

/**
 * 简易的工作循环占位实现；真实实现应包含 performUnitOfWork / commitRoot 等逻辑
 * 工作循环需要做什么呢？
 * 1. 获取当前空闲时间（deadline）
 * 2. 持续执行 performUnitOfWork 直到没有工作单元或者需要让出时间片
 * 3. 提交根节点到屏幕
 * 4. 持续调度下次空闲回调
 * @param {*} deadline
 */
function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    if (deadline.timeRemaining() < 1) {
      shouldYield = true;
    } else {
      // 处理下一个工作单元
      // performUnitOfWork 返回下一个 fiber（深度优先），如果返回 null 说明本次任务树处理完毕。
      nextWorkOfUnit = performUnitOfWork(nextWorkOfUnit);
    }
  }

  // 所有工作单元处理完毕，提交根节点到屏幕
  if (!nextWorkOfUnit && root) {
    commitRoot();
  }

  // 持续调度下次空闲回调
  window.requestIdleCallback(workLoop);
}

// 启动工作循环
window.requestIdleCallback(workLoop);

export default {
  render,
  createElement
};

/**
 * Notes & Next Steps (建议与扩展)
 * - Reconciliation: 当前实现未做 DOM diff，建议为 subsequent render 实现简单的比较算法，以避免每次重建 DOM
 * - 属性处理优化：updateProperties 应分别处理事件（onClick -> addEventListener）、样式对象合并、属性删除
 * - Component 支持：允许函数/类组件返回虚拟 DOM，并在 render 阶段构建对应 fiber
 * - 错误与边界：当前实现对异常缺乏处理（比如 createElement 的非法输入），可加 guard 与开发时警告
 * - 性能：扁平化 children 的 flat 与 normalizeChildren 效率可以再优化（避免频繁创建临时数组）
 */