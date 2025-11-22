/**
 * 创建根节点
 * @flow strict
 * 
 */
import React from './React.js';
function createRoot(root) {
  return {
    render: (node) => React.render(node, root)
  }
}

export default { createRoot };