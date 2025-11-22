
/**
 * 有个问题：如果我们页面的dom节点非常多多到一次性渲染不出来，那么如何做到每次只渲染几个节点呢？如果中断了任务，下次如何继续从上次中断的地方继续渲染呢？
 * 解决思路：将任务分成多个小任务，每次执行一个小任务，执行完后让出时间片给浏览器渲染，等浏览器渲染完后再继续执行下一个小任务 * 这样就不会阻塞浏览器的渲染了
 * 解决方案：使用浏览器提供的requestIdleCallback API；
 *         该API会在浏览器空闲的时候执行回调函数，并且会传入一个deadline参数，deadline对象中有一个timeRemaining方法，可以获取当前空闲时间还剩多少毫秒；
 *         我们可以利用这个时间来判断是否继续执行任务还是让出时间片给浏览器渲染；
 *         这样就实现了任务的拆分和时间片的分配，从而避免了阻塞浏览器渲染的问题。
 * 
 * 具体实现步骤如下:
 * 1. 创建dom, 并添加到容器中
 * 2. 构建fiber树, 建立关系， child, sibling, parent
 * 3. 遍历fiber树，执行任务
 * 4. 利用requestIdleCallback实现任务的拆分和时间片的分配
 * 5. 提交阶段，将fiber节点对应的dom添加到容器中
 * 6. 完成渲染
 * 
 * 还存在的问题是：
 * 1. 如何高效地创建大量嵌套的fiber节点？
 * 2. 当渲染完一些dom之后没有可用时间了，如何保存当前的渲染状态，以便下次继续渲染？用户可能会看到页面卡顿之后会继续渲染。
 */

import createNestedFibers from './createNestedFiber.js';
/**
 * 根据fiber创建真实DOM节点，并设置属性；
 * 注意设置属性：排除children属性，因为children不是DOM节点的属性；
 * @param {*} fiber 
 * @returns 
 */
function createDom(fiber) {
    const dom = fiber.type === 'TEXT_ELEMENT'
        ? document.createTextNode('')
        : document.createElement(fiber.type);
    return dom;
}

function updateProperties(dom, props) {
    // 设置属性
    const isProperty = key => key !== 'children';
    /**
     * 过滤出非children属性，然后设置到dom节点上
     */
    Object.keys(props).filter(isProperty).forEach(key => {
        dom[key] = props[key];
    });
}


let nextWorkOfUnit = null;

/**
 * 将 dom 挂载到合适的容器中：
 * - 优先挂到 parent.dom
 * - 若 parent.dom 不存在或 parent 为 null，则回退到 document.querySelector('#root')
 * 这个函数封装了副作用的部分，便于维护和测试。
 */
function appendDomToContainer(domNode, parentFiber) {
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

/**
 * 工作循环
 * 创建一个工作循环，不断地从任务队列中获取下一个任务并执行它，直到没有任务或者需要让出时间片为止。
 *  
 * @param {*} deadline 
 */
function workLoop(deadline) {
    let shouldYield = false; // 是否需要让出时间片
    while (!shouldYield) {
        console.log('deadline: ', deadline.timeRemaining());
        nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
        shouldYield = deadline.timeRemaining() < 1; // 如果空闲时间小于1ms，就需要让出时间片
    }
    requestIdleCallback(workLoop);
}

/**
 * 实现工作单元的执行逻辑
 * 具体实现思路：
 * 1. 创建dom节点
 * 2. 将dom节点添加到容器中
 * 3. 构建fiber树, 转换链表，建立关系， child, sibling, parent
 * @param {*} fiber 
 * @returns 
 */
function performWorkOfUnit(fiber) {
    if (!fiber) return null;

    // 1. 创建dom节点
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
        updateProperties(fiber.dom, fiber.props);
    }
    // 2. 将 dom 节点添加到容器中（已抽离成函数）
    appendDomToContainer(fiber.dom, fiber.parent);

    // 3. 构建fiber树, 转换链表，建立关系， child, sibling, parent
    if (fiber.child) {
        return fiber.child;
    }
    // 如果没有子节点，找兄弟节点，没有兄弟节点就找父节点的兄弟节点，以此类推
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }

    return null;
}
requestIdleCallback(workLoop);



// 将生成的测试树设置为初始工作单元（这样 requestIdleCallback 的工作循环会开始处理它）
// 根据需要调整 depth，注意：过大可能会造成页面渲染较长时间
nextWorkOfUnit = createNestedFibers(100);


