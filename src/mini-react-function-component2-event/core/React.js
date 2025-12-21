import { createDom, normalizeChildren } from "./domUtils";

let root = null;
let nextWorkOfUnit = null;

/**
 * 创建一个文本节点对象
 * @param {string} text - 要创建的文本节点的文本内容
 * @returns {Object} 返回一个包含类型和属性的文本节点对象
 * @returns {string} returns.type - 节点类型，固定为"TEXT_ELEMENT"
 * @returns {Object} returns.props - 节点属性对象
 * @returns {string} returns.props.nodeValue - 文本节点的值
 * @returns {Array} returns.props.children - 子节点数组，文本节点为空数组
 */
function createTextNode(text) {
  // 构造并返回文本节点对象
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  }
}

/**
 * 创建一个虚拟DOM元素对象
 * @param {string} type - 元素类型（如 'div', 'span' 等标签名）
 * @param {Object} props - 元素的属性对象，包含所有HTML属性和事件处理器
 * @param {...any} children - 元素的子节点，可以是字符串或其他虚拟DOM元素
 * @returns {Object} 返回一个包含type和props属性的虚拟DOM元素对象
 */
function createElement(type, props, ...children) {
  return {
    type,
    // 处理props属性，将子节点转换为统一格式
    props: {
      ...props,
      // 遍历所有子节点，将字符串转换为文本节点，其他节点保持不变
      children: children?.map((node) => {
        return typeof node === "string" ? createTextNode(node) : node;
      })
    }
  }
}




/**
 * 渲染函数，用于初始化渲染工作单元
 * @param {Object} node - 要渲染的节点对象
 * @param {HTMLElement} container - 渲染容器DOM元素
 * @returns {void}
 */
function render(node, container) {
  // 初始化下一个工作单元，将容器和节点信息包装成统一的数据结构
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [node]
    }
  }
}

/**
 * 更新DOM元素的属性
 * @param {Object} dom - 要更新的DOM元素对象
 * @param {Object} props - 包含要设置的属性键值对的对象
 * @returns {void}
 */
function updateProperties(dom, props) {
  // 遍历所有属性并更新到DOM元素上
  for (let key in props) {
    // 跳过children属性，避免直接设置
    if (key !== 'children') {
      // 特殊处理id属性，优先使用setAttribute方法设置
      if (key === 'id' && typeof dom.setAttribute === 'function') {
        dom.setAttribute(key, props[key]);
      } else {
        // 其他属性直接赋值给DOM元素
        dom[key] = props[key];
      }
    }
  }
}

/**
 * 执行一个工作单元（fiber节点的处理）
 * 需要考虑以下几的问题：
 * 1. 如果当前fiber没有对应的DOM节点，则创建一个新的DOM节点并赋值给fiber.dom
 * 2. 需要考虑是否是函数组件的情况：
 * - 如果是函数组件，则调用函数并获取返回的虚拟DOM元素，并递归处理返回的元素
 * - 如果不是函数组件，则继续处理当前fiber的属性和子节点
 * 3. 将fiber的属性应用到对应的DOM节点上
 * 4. 规范化fiber的子节点，生成子fiber节点
 * 5. 返回下一个需要处理的fiber节点，优先返回子节点，其次是兄弟节点，最后是父节点的兄弟节点
 * 
 * @param {Object} fiber - 需要处理的fiber节点对象
 * @returns {Object|null} 返回下一个需要处理的fiber节点，如果没有则返回null
 */
function performUnitOfWork(fiber) {
  if (!fiber) {
    return null;
  }
  const existingProps = fiber.props || { children: [] };

  const isFunctionComponent = typeof fiber.type === 'function';

  if (isFunctionComponent) {
    const childFromComponent = fiber.type(existingProps);
    fiber.props = Object.assign(
      {},
      existingProps,
      {
        children: childFromComponent ? [childFromComponent] : []
      }
    );
  }

  if (!isFunctionComponent) {
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);
      updateProperties(fiber.dom, fiber.props);
    }
  }

  /**
   * 为子节点创建fiber节点并连接到当前fiber上
   * 1. 调用normalizeChildren 方法将子节点规范化为统一格式；
   * 2. 为每一个child创建一个newFiber节点，并设置其dom、props、parent和sibling等属性，连接父子关系
   */

  const flatChildren = normalizeChildren(fiber.props.children);
  let prevSibling = null;

  // 为子节点创建fiber节点并连接到当前fiber上
  flatChildren.forEach((child, index) => {
    // 如果child为null或undefined，则跳过
    if (!child) {
      return;
    }
    // 将字符串或数字类型的子节点转换为文本节点
    const c = (typeof child === "string" || typeof child === "number") ? {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: String(child),
        children: []
      }
    } : child;

    // 创建新的fiber节点
    const newFibber = {
      type: c.type,
      props: c.props,
      dom: null,
      parent: fiber,
      sibling: null,
      child: null
    };

    if (index === 0 || !prevSibling) {
      fiber.child = newFibber;
    } else {
      prevSibling.sibling = newFibber;
    }
    prevSibling = newFibber;
  })

  // 返回下一个需要处理的fiber节点
  if (fiber.child) {
    return fiber.child;
  }

  // 如果没有子节点，则返回兄弟节点
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }

  return null
}


/**
 * workloops - 工作循环函数，用于在浏览器空闲时执行任务单元
 * @param {IdleDeadline} deadline - 浏览器提供的空闲时间信息对象，包含timeRemaining等方法
 * @returns {void}
 */
function workloops(deadline) {

  // 控制是否应该让出执行权的标志位
  let shouldYield = false;

  // 在有工作单元且不应该让出执行权的情况下持续工作
  while (!shouldYield && nextWorkOfUnit) {
    // 检查剩余空闲时间是否不足1毫秒，如果不足则设置让出标志
    if (deadline.timeRemaining() < 1) {
      shouldYield = true;
    } else {
      // 执行当前工作单元并获取下一个工作单元
      nextWorkOfUnit = performUnitOfWork(nextWorkOfUnit);
    }
  }

  // 在下一个空闲回调中继续执行工作循环
  window.requestIdleCallback(workloops);
}

//一旦进入页面就需要启动工作循环
window.requestIdleCallback(workloops);

export default {
  render,
  createElement
}