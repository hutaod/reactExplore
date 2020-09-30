import * as Didact from "./v1"
// console.log(Didact)
/** @jsx Didact.h */
function Counter() {
  const [state, setState] = Didact.useState(1)
  return <h1 onClick={() => {
    setState(c => c + 1)
  }}>Count: {state}</h1>
}
const element = <Counter />
const container = document.getElementById("root")
Didact.render(element, container)
