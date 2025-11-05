// ---------- 测试代码：生成深层的 fiber 树以在页面上渲染大量嵌套 DOM ----------
// 创建一个形如：
// <div id="test-root">
//   "text 1"
//   <div id="node-1">
//     "text 2"
//     <div id="node-2"> ... </div>
//   </div>
// </div>
/**
 * 以函数式风格生成嵌套的 fiber 树。
 * 说明：为了在 JS 中高效构造带 parent/child/sibling 指针的树，我们在构造时返回新的对象，
 * 尽量避免之后的大量可变操作——构造过程在局部作用域中完成并返回根节点。
 * 返回的结构和之前一致，包含 child/sibling/parent/dom 等字段。
 */
function createNestedFibers(depth = 10) {
    // 构建根节点
    const root = {
        type: 'div',
        props: { id: 'test-root', children: [] },
        parent: null,
        child: null,
        sibling: null,
        dom: null
    };

    // 使用循环构造每一层，保证每次创建的新对象的引用在构造时就确定
    let parent = root;
    for (let i = 1; i <= depth; i++) {
        const textFiber = {
            type: 'TEXT_ELEMENT',
            props: { nodeValue: `level ${i} - sample text`, children: [] },
            parent: parent,
            child: null,
            sibling: null,
            dom: null
        };

        const divFiber = {
            type: 'div',
            props: { id: `node-${i}`, children: [] },
            parent: parent,
            child: null,
            sibling: null,
            dom: null
        };

        // 将 parent.child 指向 textFiber
        parent.child = textFiber;
        // text 的 sibling 指向 div
        textFiber.sibling = divFiber;
        // div 的 child 在下一次循环中会被设置为新的 text

        // 将 parent 设为 divFiber，为下一层准备
        parent = divFiber;
    }

    return root;
}

export default createNestedFibers;