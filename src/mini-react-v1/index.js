/**
 * 第一版Mini React
 * 目标：实现一个最简单的React.createElement和ReactDOM.render，所有代码写死，让页面先现实出一个文本节点“Hello Mini React V1”
 * 
 * 分析：
 * 1. 创建一个div节点，并设置id为app
 * 2. 获取根节点#root，并将div节点添加到根节点下
 * 3. 创建一个文本节点，内容为“Hello Mini React V1”，并将其添加到div节点下
 */

// 第一阶段：创建一个文本节点并将其添加到根节点

const { type } = require("os");

const dom = document.createElement('div');
dom.id = 'app';

// 第二阶段：获取根节点并添加文本节点
document.querySelector('#root').append(dom);

// 第三阶段：创建文本节点并添加到根节点
const textNode = document.createTextNode('');
textNode.nodeValue = 'Hello Mini React V1';
dom.appendChild(textNode);
dom.append(textNode);

console.log(dom)


// Mini React V1 实现结束