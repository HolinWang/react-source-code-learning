/* fiberUtils.js
 * 功能：实现 Fiber 提交阶段的操作（commit），把 render 阶段构建的 fiber 树转为真实 DOM 结构。
 *
 * 说明：commit 阶段的核心是把已存在且正确设置 props/dom 的 fiber 节点插入文档中。该模块将提交逻辑单独抽离，
 * 以便让渲染逻辑和提交逻辑职责分离，且更容易进行单元测试。
 */

/**
 * commitWork(fiber)
 * - 把当前 fiber 的 dom 节点挂载到其父 fiber 的 dom 上（如果父 dom 存在）
 * - 然后递归提交该 fiber 的 child 和 sibling，保证深度优先（先子再兄弟）的插入顺序
 *
 * 参数：fiber - 当前要提交的 fiber（包含 dom/parent/child/sibling）
 * 返回值：无（但是会对 DOM 产生副作用）
 *
 * 注意事项与约定：
 * - commitWork 假设 render 阶段已经创建且设置了所有需要的 dom 和 props
 * - 在某些实现中可能需要处理 DOM diff（更新），而不是简单的 appendChild；本实现以示教学简化为主
 */
export function commitWork(fiber) {
  if (!fiber) return;

  // 将当前 fiber 的 DOM 节点添加到其最近可用父级 DOM 中（若存在）
  if (fiber.dom) {
    // 找到最近一个有 dom 的父节点用于挂载（跳过函数组件等无 dom 的 fiber）
    let parentFiber = fiber.parent;
    while (parentFiber && !parentFiber.dom) {
      parentFiber = parentFiber.parent;
    }
    if (parentFiber && parentFiber.dom) {
      // Debug logging to show where the node is mounted
      try {
        const parentName = parentFiber.dom.tagName || parentFiber.dom.id || parentFiber.dom.nodeValue || parentFiber.dom.type || '<unknown parent>';
        const childName = fiber.dom.tagName || fiber.dom.id || fiber.dom.nodeValue || fiber.dom.type || '<unknown child>';
        console.log('Append', childName, 'to', parentName);
      } catch (e) { }
      parentFiber.dom.appendChild(fiber.dom);
    }
  }

  // 递归提交子节点和兄弟节点（深度优先：先 child，再 sibling）
  // 这保证了在表面上我们以节点顺序构造正确的 DOM 结构
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
