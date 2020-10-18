import React from 'react'
// import ReactDOM from 'react-dom'

function createElement (type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child)
      )
    }
  }
}

function createTextElement (text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createDom(filber) {
  const dom =
    filber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(filber.type)

  const isProperty = key => key !== "children"
  Object.keys(filber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = filber.props[name]
    })

  return dom
}

function render (element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element]
    }
  }
}

let nextUnitOfWork = null

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
  // 添加 dom 节点
  if(!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  if(fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }

  // 创建新的fiber
  const elements = fiber.props.children
  let index = 0
  let prevSibling = null
  while (index < elements.length) {
    const element = elements[index]
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null
    }

    if(index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index ++
  }

  // 返回 nextUnitOfWork
  if(fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

const Didact = {
  createElement,
  render
}

/** @jsx Didact.createElement */
const element = (
  <div id='foo'>
    <a>bar</a>
    <b />
  </div>
)

const container = document.getElementById('root')
Didact.render(element, container)
