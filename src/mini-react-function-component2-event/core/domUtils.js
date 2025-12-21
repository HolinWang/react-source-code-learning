/**
 * 创建DOM节点
 * @param {Object} fiber - fiber节点对象
 * @returns {Node} 返回创建的DOM节点（文本节点或元素节点）
 */
export function createDom(fiber) {
  // 根据fiber类型创建对应的DOM节点
  return fiber.type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(fiber.type);
}


/**
 * 标准化子元素数组，将各种类型的子元素转换为统一的虚拟DOM节点格式
 * @param {*} children - 子元素，可以是单个元素、数组或null/undefined
 * @returns {Array} 标准化后的子元素数组，每个元素都是虚拟DOM节点格式
 */
export function normalizeChildren(children) {
  /**
   * 处理子元素为undefined、null或数组的情况
   * 1. children 为 undefined 或 null 时，返回空数组
   * 2. children 为数组时，返回数组
   * 3. children 为非数组时，返回包含该元素的数组
   */
  const arr = (children === undefined || children === null) ? [] : (Array.isArray(children) ? children : [children]);

  /**
   * 将嵌套数组扁平化为一维数组
   * @param {Array} arr - 需要扁平化的数组
   * @returns {Array} 扁平化后的一维数组
   */
  const flatChildren = (arr.flat && arr.flat(Infinity)) || arr.reduce((acc, c) => acc.concat(Array.isArray(c) ? c : [c]), []);

  /**
   * 遍历扁平化后的子元素数组，将字符串和数字转换为文本节点，
   * 过滤掉null和undefined元素
   */
  return flatChildren.map(child => {
    if (child === null || child === undefined) {
      return null;
    }
    if (typeof child === "string" || typeof child === "number") {
      return {
        type: "TEXT_ELEMENT",
        props: {
          nodeValue: String(child),
          children: []
        }
      }
    }
    return child;
  }).filter(Boolean);
}