import { Flag } from './reconciler.fre'

export const updateElement = (
  dom,
  oldProps,
  newProps,
) => {
  for (let name in { ...oldProps, ...newProps }) {
    let oldValue = oldProps[name]
    let newValue = newProps[name]

    if (oldValue === newValue || name === 'children') {
    } else if (name === 'style') {
      for (const k in { ...oldValue, ...newValue }) {
        if (!(oldValue && newValue && oldValue[k] === newValue[k])) {
          ;dom[name][k] = newValue?.[k] || ''
        }
      }
    } else if (name[0] === 'o' && name[1] === 'n') {
      name = name.slice(2).toLowerCase()
      if (oldValue) dom.removeEventListener(name, oldValue)
      dom.addEventListener(name, newValue)
    } else if (name in dom && !(dom instanceof SVGElement)) {
      // for property, such as className
      ;dom[name] = newValue || ''
    } else if (newValue == null || newValue === false) {
      dom.removeAttribute(name)
    } else {
      // for attributes
      dom.setAttribute(name, newValue)
    }
  }
}

export const createElement = fiber => {
  const dom =
    fiber.type === 'text'
      ? document.createTextNode('')
      : fiber.tag === Flag.SVG
      ? document.createElementNS(
          'http://www.w3.org/2000/svg',
          fiber.type
        )
      : document.createElement(fiber.type)
  updateElement(dom, {}, fiber.props)
  return dom
}
