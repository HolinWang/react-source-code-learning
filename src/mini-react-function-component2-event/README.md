# 实现react vdom的事件绑定
```
1. fiber数据结构：
每个 fiber 节点包含以下重要属性：
type：组件类型
props：属性
dom：对应的真实 DOM 节点
parent：父 fiber
child：第一个子 fiber
sibling：下一个兄弟 fiber
alternate：对应到上一次更新的 fiber
effectTag：副作用标记（"PLACEMENT"、"UPDATE"、"DELETION"）

2. 工作流程
初始化阶段：调用 render 创建根 fiber
协调阶段（Reconciliation）：
通过 workLoop 分片处理
performUnitOfWork 逐一处理 fiber 节点
reconcileChildren 对比新旧节点
提交阶段（Commit）：通过 commitRoot 一次性更新 DOM
```

## 阶段性目标
### 第一阶段 ✅
1. 实现render函数；渲染函数，目的是为了初始化渲染工作单元。
2. 需要实现createElement函数；创建Virtual DOM元素对象。
3. 实现createElement/createTextNode函数；目的是用于创建虚拟节点。
* 以上函数是比较关键的函数，确保最基本的功能可以创建渲染virrtual DOM元素对象。

### 第二阶段 ☑️
1. 实现performUnitOfWork函数；目的是逐个处理fiber节点，构建DOM并连接子fiber节点。
2. 实现commitRoot函数；目的是将构建好的DOM树统一挂载到页面上，避免频繁操作。
3. 实现workLoop函数，目的是利用 requestIdleCallback 分片执行渲染任务。在浏览器空闲时间处理工作单元，确保不阻塞主线程