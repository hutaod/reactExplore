import * as Didact from "./v1/fre.esm"
// console.log(Didact)
/** @jsx Didact.h */
// function Counter() {
//   const [state, setState] = Didact.useState(1)
//   return <h1 onClick={() => {
//     setState(c => c + 1)
//   }}>Count: {state}</h1>
// }
// const element = <Counter />
const element = <div id="hello">123</div>
const container = document.getElementById("root")
console.log(element)
Didact.render(element, container)
