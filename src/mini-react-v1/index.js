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


/**
 * 以上代码实现了一个最简单的 Mini React V1，包含以下几个步骤：
 * 1. 创建一个div节点并设置id为app。
 * 2. 获取根节点#root，并将div节点添加到根节点下。
 * 3. 创建一个文本节点，内容为“Hello Mini React V1”，并将其添加到div节点下，最终在页面上显示出该文本。
 * 
 * 注意：当前实现方式是手动创建DOM节点并渲染到页面上，数据是写死的，后续版本会逐步完善这个过程，实现更通用的虚拟DOM创建和渲染机制。
 * 
 * 但是存在的问题是：代码写死了，不能动态创建虚拟DOM元素对象，后续版本会改进这个问题。
 */