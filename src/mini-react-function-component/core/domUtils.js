/* domUtils.js
 * 功能概览：
 * - 本文件包含与真实 DOM 操作相关的纯工具函数，负责在 render/commit 阶段处理 DOM 的创建、属性更新与父容器挂载逻辑。
 * - 把这些与副作用相关的细节抽象到独立模块，能使主渲染逻辑更简洁且更容易测试。
 *
 * 约束与说明：
 * - 这些函数会直接操作浏览器 DOM，因此它们的副作用应只在 commit 阶段执行。
 * - updateProperties 非常基础：仅直接把 props 的字段（非 children）赋值到元素上，未做差分、事件绑定处理或样式合并（这些为后续功能）。
 */

/**
 * createDom(fiber)
 * - 根据 fiber.type 创建对应的真实 DOM 节点（HTMLElement 或 TextNode）
 * - 对于 TEXT_ELEMENT 创建 TextNode（nodeValue 会在后续属性更新中赋值）
 *
 * @param {Object} fiber - 一个 fiber 节点对象，含 type/props 等字段
 * @returns {Node} 真实的 DOM 节点（Element 或 Text）
 */
export function createDom(fiber) {
  return fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(fiber.type);
}

/**
 * updateProperties(dom, props)
 * - 将 props（除了 children）应用到指定 DOM 节点上
 * - 这是个非常基础的实现，直接赋值，未处理事件（onClick）、样式对象或属性删除
 *
 * 参数示例：props = { id: 'id1', className: 'card', nodeValue: 'text', children: [] }
 */
export function updateProperties(dom, props = {}) {
  // 直接把 props 赋值到 dom 上（排除 children）
  for (let key in props) {
    if (key !== 'children') {
      // If a DOM element provides setAttribute (our mini DOM in tests), prefer calling it for id
      if (key === 'id' && typeof dom.setAttribute === 'function') {
        dom.setAttribute('id', props[key]);
      } else {
        dom[key] = props[key];
      }
    }
  }
}

/**
 * appendDomToRootContainer(domNode, parentFiber)
 * - 将新创建的 domNode 挂载到合适的容器上：
 *   1) 如果 parentFiber 存在且其 dom 已经创建，则 append 到 parentFiber.dom
 *   2) 如果 parentFiber 存在但其 dom 尚未创建，则退回挂到 root（为了保证没有丢失节点，简化处理）
 *   3) 如果没有 parentFiber，则直接挂到 root
 *
 * 注意：此逻辑为简化版本，退回 root 可能导致嵌套结构在 DOM 上暂时不一致（commit 阶段会统一处理），这在复杂更新时需要额外处理。
 */
export function appendDomToRootContainer(domNode, parentFiber) {
  const rootContainer = document.querySelector('#root');
  if (parentFiber) {
    if (parentFiber.dom) {
      parentFiber.dom.appendChild(domNode);
      return;
    }
    // 父节点存在但 dom 尚未创建，回退到 root
    if (rootContainer) rootContainer.appendChild(domNode);
    return;
  }
  // 无父节点，挂到 root
  if (rootContainer) rootContainer.appendChild(domNode);
}
