/**
 * mini-react-v2
 * @description: 手写一个简易版的 React，实现创建虚拟DOM元素并渲染到页面上
 * 目标：实现一个最简单的React.createElement和ReactDOM.render，所有代码写死，让页面先现实出一个文本节点“Hello Mini React V2”
 * 
 * 分析：
 * 1. 创建一个div节点，并设置id为app
 * 2. 获取根节点#root，并将div节点添加到根节点下
 * 3. 创建一个文本节点，内容为“Hello Mini React V2”，并将其添加到div节点下
 * 
 * 当前的实现方式是手动创建虚拟DOM元素对象，然后根据这个对象创建真实DOM并渲染到页面上，但是还是静态的数据写死的；
 */

/**
 * 创建一个文本虚拟DOM元素
 */
const textElement = {
    type: 'TEXT_ELEMENT',
    props: {
        nodeValue: 'Hello Mini React V2',
        children: []
    }
}

/**
 * 创建一个虚拟DOM元素
 */
const element = {
    type: 'div',
    props: {
        id: 'app',
        children: [textElement]
    }
}

// 第一阶段：创建一个div节点并设置id为app
const dom = document.createElement(element.type);
dom.id = element.props.id;
// 第二阶段：获取根节点并添加div节点
document.querySelector('#root').append(dom);
// 第三阶段：创建文本节点并添加到div节点
const textNode = document.createTextNode('');

textNode.nodeValue = element.props.children[0].props.nodeValue;
dom.appendChild(textNode);

console.log(dom);