/**
 * 动态渲染复杂的DOM结构
 * 目标：实现一个更通用的虚拟DOM创建和渲染机制，能够动态渲染复杂的DOM结构
 * 
 * 分析：
 * 1. 创建虚拟DOM元素的函数 createElement 和 createTextNodeElement
 * 2. 使用递归的方式将虚拟DOM转换为真实DOM并渲染到页面上
 * 3. 支持多层嵌套的虚拟DOM结构
 * 
 * 关键点：
 * - 递归渲染函数 renderElement，根据虚拟DOM的类型创建对应的真实DOM节点
 * - 处理文本节点和普通节点的区别
 * - 遍历子节点并递归调用渲染函数
 */

/**
 * 创建一个文本虚拟DOM元素
 * @param {*} text 
 * @returns 
 */
const createTextNodeElement = (text) => {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

/**
 * 创建一个虚拟DOM元素
 * @param {*} type 
 * @param {*} props 
 * @param  {...any} children 
 * @returns 
 */
const createElement = (type,props,...children) => {
    return {
        type,
        props:{
            ...props,
            children:children.map(child => {
                // 如果子节点是对象，直接返回；如果是文本，则创建文本虚拟DOM元素
                return typeof child === 'object' ? child : createTextNodeElement(child);
            })
        }
    }
}

/**
 * 递归渲染虚拟DOM到真实DOM
 * 渲染算法实现逻辑：
 * 1. 判断虚拟DOM的类型，如果是文本节点则创建文本节点，否则创建对应的元素节点
 * 2. 设置元素节点的属性
 * 3. 遍历子节点，递归调用渲染函数，并将子节点添加到父节点下
 * 4. 返回创建的真实DOM节点
 * @param {*} element 
 * @returns 
 */
const renderElement = (element) => {
    let dom;
    if (element.type === 'TEXT_ELEMENT') {
        dom = document.createTextNode('');
        dom.nodeValue = element.props.nodeValue;
    } else {
        dom = document.createElement(element.type);
        // 设置属性
        for (const prop in element.props) {
            if (prop !== 'children') {
                dom[prop] = element.props[prop];
            }
        }
    }

    // 递归渲染子节点
    element.props?.children.forEach(child => {
        dom.appendChild(renderElement(child));
    });

    return dom;
}
// 创建一个复杂的虚拟DOM结构，可以多层嵌套，包含文本节点和普通节点，并且可以混合使用文本和元素节点，无限制的嵌套
const App = createElement(
    'div',
    { id: 'app' },
    createElement(
        'div',
        { id: 'div1' },
        createElement(
            'p',
            { id: 'p1' },
            createElement(
                'span',{},
                createTextNodeElement('Nested span inside paragraph.')
            )
        ),
        createTextNodeElement('Hello Mini React V5')
    ),
    "This is Mini React V5",
    createElement(
        'p',
        {},
        createTextNodeElement('This is a paragraph in Mini React V5.')
    )
);

// 渲染虚拟DOM到页面上
const dom = renderElement(App);
document.querySelector('#root').appendChild(dom);

console.log(dom);

/**
 * 以上代码实现了一个更通用的虚拟DOM创建和渲染机制，包含以下几个步骤：
 * 1. 创建文本虚拟DOM元素函数 createTextNodeElement。
 * 2. 创建普通虚拟DOM元素函数 createElement。
 * 3. 递归渲染函数 renderElement，根据虚拟DOM的类型创建对应的真实DOM节点，并处理子节点的递归渲染。
 * 4. 创建一个复杂的虚拟DOM结构 App，并将其渲染到页面上，最终在页面上显示出相应的内容。
 * 
 * 注意：当前实现方式支持多层嵌套的虚拟DOM结构，并能够动态渲染复杂的DOM结构。
 * 存在的问题是：并没有真正意义上的动态创建虚拟DOM元素对象，后续版本会改进这个问题，实现更完善的虚拟DOM创建和渲染机制。
 */