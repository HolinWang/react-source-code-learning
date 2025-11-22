/* childrenUtils.js
 * 功能：规范化 children 列表，返回一个扁平化且统一结构的 children 数组（便于后续构建 fiber）
 *
 * 这个工具做了下列工作：
 * 1) 接受各种可能的 children 输入形态：
 *    - undefined / null
 *    - 单个节点对象（VNode）
 *    - 单个原始值（string / number）
 *    - 数组（可能嵌套）
 * 2) 将 children 规范成一个扁平数组，移除 null/undefined
 * 3) 将原始文本（string / number）转换为一个统一的 TEXT_ELEMENT 虚拟节点，
 *    以便后续的 createDom / props 处理一致
 *
 * 返回值：一个标准化的 children 数组（所有项都为 VNode 样式对象，或整体为空数组）
 *
 * 设计注意点：
 * - 此处没有深度拷贝 children 对象，因此传入的对象引用会保留。
 * - 对于非常深/大的 children 数组，flat(Infinity) 可能引发性能问题，生产代码中应使用更高效的迭代器或限制层级。
 *
 * 示例：
 * normalizeChildren(null) => []
 * normalizeChildren('hello') => [{ type: 'TEXT_ELEMENT', props: { nodeValue: 'hello', children: [] }}]
 * normalizeChildren(["a", ["b"], { type: 'div', props: { children: [] } }]) => 扁平化并转为 VNode
 */

export function normalizeChildren(children) {
  // 规范成数组：null/undefined -> []，单值 -> [val]，已是数组则保持
  const arr = (children === undefined || children === null) ? [] : (Array.isArray(children) ? children : [children]);

  // 尝试使用 Array.prototype.flat（如果环境支持）扁平化深度嵌套数组。
  // 如果 flat 不存在，则使用 reduce concat 的回退实现
  const flatChildren = (arr.flat && arr.flat(Infinity)) || arr.reduce((acc, c) => acc.concat(Array.isArray(c) ? c : [c]), []);

  // 映射与过滤：
  // - null/undefined 的子项直接变成 null，随后被 filter(Boolean) 去除
  // - string/number 转换为 TEXT_ELEMENT（统一结构）
  // - 其他保持原样（假设是我们的虚拟节点对象形式）
  return flatChildren
    .map(child => {
      if (child == null) return null;
      if (typeof child === 'string' || typeof child === 'number') {
        return { type: 'TEXT_ELEMENT', props: { nodeValue: String(child), children: [] } };
      }
      // assume child is VNode (object with type/props)
      return child;
    })
    .filter(Boolean);
}
