import React from 'react'
import ReactDOM from 'react-dom'

// const element = (
//   <div id="foo">
//     <a>bar</a>
//     <br />
//   </div>
// )

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === "object" ? child : createTextElement(child))
    }
  }
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  }
}

const Didact = {
  createElement
}

// const element = React.createElement(
//   'div',
//   { id: 'foo' },
//   React.createElement('a', null, 'bar'),
//   React.createElement('br')
// )

// const element = Didact.createElement(
//   'div',
//   { id: 'foo' },
//   Didact.createElement('a', null, 'bar'),
//   Didact.createElement('br')
// )

/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)

const container = document.getElementById('root')
ReactDOM.render(element, container)
