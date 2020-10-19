# React原理深入浅出

在我们使用React中，其主要核心部分可以分为以下几点：

- JSX
- Fiber树
- Reconciler
- Scheduler
- Class Component
- Hooks (Function Component)

下面我们就围绕以上几点核心来分析React的原理。

## 理解JSX

我们从以下三个问题来理解JSX：

### 问题一：JSX的本质是什么，它和JS之间到底是什么关系？

我们来看一下[React官网](https://reactjs.org/docs/glossary.html#jsx)对它的定义：

    JSX 是 JavaScript 的一种语法扩展，它和模板语言很接近，但是它充分具备 JavaScript 的能力。

这段描述可能并不能很好的理解，我们可以这样来理解：

    JSX是用于描述DOM的语法，它会被babel编译为React.createElement的函数调用，其本质就是JS。也可说：JSX是React.createElement函数调用的语法糖

#### 示例：

编译前：

```jsx
const jsx = <div id="root">hello</div>
```

编译后：

```jsx
const jsx = React.createElement("div", {
  id: "root"
}, "hello");
```

浏览器并不能识别并执行JSX，因此，如果需要在使用它，就需要使用babel编译成浏览器或者其他环境可识别的JS代码。

#### 那什么是babel呢？它又是怎样把JSX编译成JS的呢?

```babel
Babel 是一个工具链，主要用于将 ECMAScript 2015+ 版本的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。
—— Babel 官网
```

虽然babel的功能描述是 `将 ECMAScript 2015+ 版本的代码转换为向后兼容的 JavaScript 语法...` ，但其功能之一就是 `语法转换` , Babel 也具备将 JSX 语法转换为 JavaScript 代码的能力（依赖官方插件 `@babel/preset-react`）。

问题二：为什么要用JSX？

```text
JSX语法类似原生dom，
```

问题三：JSX背后的功能模块是什么，这个功能模块都做了哪些事情？


## Fiber树

## Reconciler

## Scheduler

## Class Component

## Hooks (Function Component)