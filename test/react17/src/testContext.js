import React, { useState, useContext, useCallback } from 'react'

const context = React.createContext()

function ContextProvider (props) {
  const [ctx, setCtx] = useState(props.value)
  const changeCtx = () => {
    setCtx(ctx + 1)
  }
  return (
    <context.Provider value={{ ctx, changeCtx }}>
      {props.children}
    </context.Provider>
  )
}

const ChildComp = (...params) => {

  const _context = useContext(context)
  console.log("child", _context)
  console.log(1111, context)
  return (
    <div>
      child
    </div>
  )
}

const Child2Comp = (...params) => {

  const _context = useContext(context)
  console.log("child2", _context)
  return (
    <div>
      child2
      <button onClick={() => {
        _context.changeCtx(_context.ctx + 1)
      }}>add ctx</button>
    </div>
  )
}

const MiddleComp = () => {
  console.log("middle")
  return (
    <div>
      hello
      <ChildComp />
      <Child2Comp />
    </div>
  )
}

const Parent = props => {
  return (
    <ContextProvider value={0}>
      <MiddleComp/>
    </ContextProvider>
  )
}

export default Parent
