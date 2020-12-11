import React from 'react';
import ReactDOM from 'react-dom';

const TestPortals = props => {
  const [count, setCount] = React.useState(0)
  return ReactDOM.createPortal((
    <div onClick={() => {
      setCount(count + 1)
    }}>
      hello {count}
    </div>
  ), document.body)
}

function Parent() {
  const [visible, setVisible] = React.useState(true)
  return (
    <div>
      <h2>TestPortals</h2>
      <button onClick={() => setVisible(!visible)}>{visible ? "hide" : "show"}</button>
      {visible ? <TestPortals/> : null}
    </div>
  )
}

export default Parent
