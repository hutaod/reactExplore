import { some, isStr } from './reconciler.fre'

// Supported and simplify jsx2
// * https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md
export const h = function (type, attrs) {
  const props = attrs || ({})
  const key = props.key || null
  const ref = props.ref || null

  const children = []
  let simple = ''
  const len = arguments.length
  for (let i = 2; i < len; i++) {
    let child = arguments[i]
    const end = i === len - 1
    // if vnode is a nest array, flat them first
    while (isArr(child) && child.some((v) => isArr(v))) {
      child = [].concat(...child)
    }
    const vnode = some(child) ? child : ''
    const str = isStr(vnode)
    // merge simple nodes
    if (str) simple += String(vnode)
    if (simple && (!str || end)) {
      children.push(createText(simple))
      simple = ''
    }
    if (!str) children.push(vnode)
  }

  if (children.length) {
    // if there is only on child, it not need an array, such as child use as a function
    props.children = children.length === 1 ? children[0] : children
  }
  // delete them to reduce loop performance
  delete props.key

  return { type, props, key, ref }
}

export function createText(vnode) {
  return { type: 'text', props: { nodeValue: vnode } }
}

export const Fragment = props => {
  return props.children
}
export const isArr = Array.isArray
