/**
 * 动态生成复杂的虚拟DOM结构
 * @description: mini-react-v4
 * 实现思路：
 * 1. 创建 createTextElement 函数，用于创建文本虚拟DOM元素
 * 2. 创建 createElement 函数，用于创建普通虚拟DOM元素
 * 3. 使用 createElement 和 createTextElement 创建一个复杂的虚拟DOM结构
 * 4. 渲染虚拟DOM到页面上
 * 
 * 如何创建复杂的虚拟DOM结构？
 * - 通过嵌套调用 createElement 和 createTextElement 来创建多层次的虚拟DOM结构
 * - 每个虚拟DOM元素的 children 属性可以包含多个子元素，从而实现复杂的层级关系
 * 
 */


// 第一步：可以由内到外创建虚拟DOM结构，我们最终需要在页面上显示一个app节点，里面有一个h1节点，h1节点里面有一个文本节点“Hello Mini React V4”

/**
 * 创建一个文本虚拟DOM元素，注意结构是固定的，必须要返回一个对象，包含type和props属性，props属性里面包含nodeValue和children属性，这是一个简单的虚拟DOM节点的结构
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

const textNodeElement = createTextNodeElement('Hello Mini React V4');


// 第二步: 创建一个普通的虚拟DOM元素
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

/**
 * 使用 createElement 和 createTextElement 创建一个复杂的虚拟DOM结构, 但是注意结构并不固定，里面的参数是可以随便添加的
 */
const App = createElement(
    'div',
    { id: 'app' },
    createElement(
        'h1',
        {},
        textNodeElement
    ),
    "This is Mini React V4",
    createElement(
        'p',
        {},
        createTextNodeElement('This is a paragraph in Mini React V4.')
    )
);

const dom = document.createElement(App.type);
dom.id = App.props.id;

document.querySelector('#root').append(dom);

// 渲染 h1 节点
const h1Element = App.props.children[0];
const h1Dom = document.createElement(h1Element.type);
dom.appendChild(h1Dom);

// 渲染 h1 内的文本节点
const h1TextElement = h1Element.props.children[0];
const h1TextNode = document.createTextNode('');
h1TextNode.nodeValue = h1TextElement.props.nodeValue;
h1Dom.appendChild(h1TextNode);

// 渲染纯文本节点
const textNode = document.createTextNode('');
textNode.nodeValue = App.props.children[1];
dom.appendChild(textNode);

// 渲染 p 节点
const pElement = App.props.children[2];
const pDom = document.createElement(pElement.type);
dom.appendChild(pDom);

// 渲染 p 内的文本节点
const pTextElement = pElement.props.children[0];
const pTextNode = document.createTextNode('');
pTextNode.nodeValue = pTextElement.props.nodeValue;
pDom.appendChild(pTextNode);

console.log(dom);