/**
 * 如动态创建虚拟DOM节点；
 * 使用函数的方式，通过传入不同的参数，来创建不同的虚拟DOM节点；
 * 
 * @description: mini-react-v3
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
const createElement = (type, props, ...children) => {
    return {
        type,
        props: {
            ...props,
            children
        }
    }
}

// 使用 createElement 和 createTextNodeElement 创建虚拟DOM元素
const textNodeElement = createTextNodeElement('Hello Mini React V3');

// 创建一个div虚拟DOM元素，包含文本节点作为子节点
const App = createElement(
    'div',
    { id: 'app' },
    textNodeElement
);

// 渲染虚拟DOM到页面上
const dom = document.createElement(App.type);
dom.id = App.props.id;
// 获取根节点并添加div节点
document.querySelector('#root').append(dom);
// 创建文本节点并添加到div节点
const textNode = document.createTextNode('');
// 设置文本节点的内容
textNode.nodeValue = textNodeElement.props.nodeValue;
// 将文本节点添加到div节点下
dom.append(textNode);

console.log(dom);