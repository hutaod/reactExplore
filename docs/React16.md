# React 源码探索分析（16.13.1）

记录阅读源码中的分析记录

React 有两个核心包 react 和 react-dom，其他核心包会在打包的时候打包到这两个包类

## 阅读计划

- 用 debug 方式探索 React 运行过程
- 理清楚 React 渲染更新的流程，并用流程图来进行描述
- 结合官方文档，用文档的方式输出讲述 React 当前版本的原理以及未来的部分趋势
- 写一个功能齐全的类似 mini react 的前端框架

## 按过程进行分析

主要函数分析

- `render`: 渲染函数
- `createRoot`: 开启 `concurrent` 模式
- `createBlockingRoot`: 开启 `blocking` 模式
- `hydrate`: 类似`render`，在 `ssr` 时，客户端使用的渲染函数
- `setState`: 改变组件内部状态的方法

复制了一段官网的说明:

- `legacy 模式`： `ReactDOM.render(<App />, rootNode)`。这是当前 React app 使用的方式。当前没有计划删除本模式，但是这个模式可能不支持这些新功能（concurrent 模式中的新功能）。
- `blocking 模式`： `ReactDOM.createBlockingRoot(rootNode).render(<App />)`。目前正在实验中。作为迁移到 concurrent 模式的第一个步骤。
- `concurrent 模式`： `ReactDOM.createRoot(rootNode).render(<App />)`。目前在实验中，未来稳定之后，打算作为 React 的默认开发模式。这个模式开启了所有的新功能。

如果想了解更多关于 concurrent 模式的消息，可以去官网查看：[React App Concurrent 模式](https://zh-hans.reactjs.org/docs/concurrent-mode-adoption.html)

部分说明：

- container 指根节点（render 传入的节点）

### render 过程

- `render` 函数：
  - 验证 `container` 的正确性
  - 查询 `container` 是否包含 `internalContainerInstanceKey` 属性，且`container._reactRootContainer === undefined`，符合条件就会抛出异常 undefined，说明:
    - `internalContainerInstanceKey = '__reactContainer$' + randomKey`, `randomKey`是个随机数
    - 只有当经过`markContainerAsRoot`函数添加标记的时候才会包含该属性，而在这个阶段被标记说明先调用了`createRoot函数`进行开启`concurrent 模式`
    - `container._reactRootContainer`默认就是为 undefined
    - 因为现阶段`concurrent 模式`还不稳定，会抛出异常
- `legacyRenderSubtreeIntoContainer` 函数，顾名思义：`legacy 模式` 渲染子树到 container，legacy 表示旧版，也就是说这个函数在未来版本可能会被弃用，不过当前默认的模式还是 `legacy 模式`，该函数主要进行了以下几个步骤：
  - topLevelUpdateWarnings
  - `warnOnInvalidCallback$1` 判断 callback 合法性
  - 判断 root 是否存在来判断是进行初始化渲染，还是进行更新
  - 初始化：
    - 进入创建 root 流程
      - 创建 filberRoot
        - 创建 filberRootNode:
        - 创建 filberRootNode，就是 root
        - 创建 rootFilber，并让 root 和它相互关联，`root.current = uninitializedFiber`,`uninitializedFiber.stateNode = root`。
        - 初始化 updateQueue，并挂载到 rootFilber
      - 标记 container： `markContainerAsRoot`
      - 加入自定义事件监听： `ensureListeningTo`
    - 处理 callback
    - unbatchedUpdates 重点,到这一步才会开始把 React 组件加入到 filber 并开始 render 和 commit 阶段 TODO:继续分析 unbatchedUpdates
    - getPublicRootInstance 获取 Root 实例并返回
