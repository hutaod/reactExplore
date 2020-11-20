const React = require("react")
const { renderToString } = require("react-dom/server")

const h = React.createElement;

function FuncComp(props) {
  const [count, setCount] = React.useState(0)
  return h(
    "div",
    { 
      onClick: () => {
        setCount(count + 1)
      }
    }, 
    count
  )
}

class ClassComp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      count: 0
    }
  }
  render() {
    return h(
      "div",
      { 
        onClick: () => {
          this.setState({ count: this.state.count + 1 })
        }
      }, 
      this.state.count
    )
  }
}

const testApp = h(
  "div",
  { id: "root" },
  h(FuncComp, null),
  h(
    "h2",
    null,
    "函数组件-计时器"
  ),
  h(ClassComp, null),
  h(
    "h2",
    null,
    "Class组件-计时器"
  )
);

console.log(renderToString(testApp))