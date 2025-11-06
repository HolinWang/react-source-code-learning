/**
 * Mini React Fiber v2 实现
 * 本次解决的问题是： 如果渲染dom的时候，没有剩余时间了，任务突然中断了；这个时候用户只能看到页面渲染了一部分的dom
 * 解决方案是：将任务拆分成多个小任务，每次执行一个小任务，执行完后判断是否有剩余时间，如果没有剩余时间了，就暂停任务，等到下一个空闲时间再继续执行；
 * 计算结束之后统一添加到屏幕里面，而不是每次创建完dom节点就添加到屏幕里面
 */

import createNestedFibers from './createNestedFiberjs';

// 初始化下一个工作单元
let nextWorkOfUnit = null;
// 初始化根节点
let root = null;

/**
 * 该方法的作用是：
 * 将构建好的fiber树统一提交到真实DOM中；
 * 为了提高性能，采用批量更新的方式，一次性将所有的dom节点添加到屏幕中，避免了频繁的dom操作；
 * @returns 
 */
function commitRoot() {
    if (!root) return;
    commitWork(root.child);
    root = null;
}

/**
 * 该方法的作用是：
 * 将fiber节点对应的dom节点添加到其父节点的dom节点中；
 * 为什么要递归地添加子节点和兄弟节点？
 * 因为在fiber架构中，节点是以树形结构存在的，每个节点都有自己的子节点和兄弟节点
 * 通过递归地添加子节点和兄弟节点，可以保证所有的dom节点都被正确地添加到屏幕中
 * @param {*} fiber 
 * @returns 
 */
function commitWork(fiber) {
    if (!fiber) return;
    fiber.parent && fiber.parent.dom && fiber.parent.dom.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

/**
 * 实现工作循环
 * 创建一个工作循环，不断地从任务队列中获取下一个任务并执行它，直到没有任务或者需要让出时间片为止。
 * @param {*} deadline 
 */
function workLoop(deadline) {
    let shouldYield = false; // 是否需要让出时间片
    while (!shouldYield && nextWorkOfUnit) {
        console.log('deadline: ', deadline.timeRemaining());
        // 每次执行一个工作单元，同时更新下一个工作单元
        nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
        shouldYield = deadline.timeRemaining() < 1; // 如果空闲时间小于1ms，就需要让出时间片
    }
    if (!nextWorkOfUnit && root) {
        // 所有工作单元都执行完了，统一将根节点添加到屏幕中
        commitRoot();
    }
    // 下一次空闲时间继续执行工作循环
    requestIdleCallback(workLoop);
}


/**
 * 实现创建dom节点的函数
 * @param {*} fiber 
 * @returns 
 */
function createDom(fiber) {
    let dom = null;
    if (fiber.type === 'TEXT_ELEMENT') {
        dom = document.createTextNode('');
        dom.nodeValue = fiber.props.nodeValue;
    } else {
        dom = document.createElement(fiber.type);
    }
    return dom;
}

/**
 * 为什么要设置属性？
 * 因为在创建dom节点的时候，只是创建了一个空的dom节点，还没有设置属性，比如id、className、style等
 * 这样的dom节点是没有任何意义的，所以需要设置属性
 * @param {*} dom 
 * @param {*} props 
 */
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

/**
 * 为什么要把节点挂在到合适的容器中？
 * 因为在fiber架构中，dom节点的创建和挂载是分开的，创建dom节点的时候，并没有把dom节点挂载到真实的dom树中
 * 这样做的好处是，可以先创建好所有的dom节点，然后再统一挂载到真实的dom树中，避免了频繁的dom操作，提高了性能
 * @param {*} domNode 
 * @param {*} parentFiber 
 * @returns 
 */
function appendDomToRootContainer(domNode, parentFiber) {
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
 * 构建fiber树, 转换链表，建立关系， child, sibling, parent；
 * 为什么要构建fiber树？
 * 因为在fiber架构中，fiber节点是以树形结构存在的，每个fiber节点都有自己的子节点和兄弟节点
 * 通过构建fiber树，可以方便地遍历和操作fiber节点，实现高效的渲染和更新
 * 具体步骤：
 * 1. 如果有子节点, 直接返回子节点，并将其赋值给fiber.child
 *  - 为什么？
 *  - 因为子节点是当前节点的第一个工作单元，优先处理子节点可以保证深度优先遍历fiber树
 * 2. 没有子节点时，向上查找第一个存在 sibling 的祖先并返回其 sibling
 *  - 为什么？
 *  - 因为兄弟节点是当前节点的下一个工作单元，处理完当前节点后需要继续处理兄弟节点
 * 3. 找不到则返回 null
 *  - 为什么？
 *  - 因为当前节点已经没有更多的工作单元了，返回 null 表示任务完成
 * @param {*} fiber 
 * @returns 
 */
function fibertreeConstruction(fiber) {
    // 如果有子节点，优先返回子节点
    if (fiber.child) {
        return fiber.child;
    }

    // 没有子节点时，向上查找第一个存在 sibling 的祖先并返回其 sibling
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }

    // 找不到则返回 null
    return null;
}

/**
 * 实现工作循环
 * 创建一个工作循环，不断地从任务队列中获取下一个任务并执行它，直到没有任务或者需要让出时间片为止。
 * 实现步骤：
 * 1. 创建 workLoop 函数，接收 deadline 参数
 * 2. 在 workLoop 函数中，使用 while 循环不断执行任务，直到没有任务或者需要让出时间片为止
 * 3. 在每次循环中，调用 performWorkOfUnit 函数执行当前的工作单元
 * 4. 判断是否需要让出时间片，如果需要就退出循环
 *  
 * @param {*} deadline 
 */

function performWorkOfUnit(fiber) {
    if (!fiber) return null;
    // 1. 创建dom节点
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
        // 2. 设置属性
        updateProperties(fiber.dom, fiber.props);
    }
    // 3. 将dom节点添加到父节点中
    appendDomToRootContainer(fiber.dom, fiber.parent);
    /**
     * 4. 构建fiber树, 转换链表，建立关系， child, sibling, parent
     */
    return fibertreeConstruction(fiber);
}

requestIdleCallback(workLoop);

nextWorkOfUnit = createNestedFibers(100);