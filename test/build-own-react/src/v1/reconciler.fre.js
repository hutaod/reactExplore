import { scheduleWork, shouldYield, schedule } from './scheduler'
import { resetCursor } from './hooks'
import { createElement, updateElement } from './dom'
import { isArr, createText } from './h'

let preCommit
let currentFiber
let WIP
let commits = []

// 存储微任务
const microTask = []

export const render = (element, container, done) => {
  const rootFiber = {
    node: container,
    props: {
      children: element,
      onError
    },
    done
  }
  dispatchUpdate()
}

export const dispatchUpdate = (fiber) => {
  if(fiber && !fiber.lane) {
    fiber.lane = true
    microTask.push(fiber)
  }
  // 开始调和任务
  scheduleWork(reconcileWork)
}

const reconcileWork = timeout => {
  if(!WIP) {
    // 取出微任务
    WIP = microTask.shift()
  }
  while (WIP && (!shouldYield() || timeout)) {
    WIP = reconcile(WIP)
  }
  if(WIP && !timeout) {
    return reconcileWork
  }
  if (preCommit) {
    // 进入commit阶段
    commitWork(preCommit)
  }
  return null
}

const reconcile = WIP => {
  WIP.parentNode = getParentNode(WIP)
  isFn(WIP.type) ? updateHook(WIP) : updateHost(WIP)
  WIP.lane = WIP.lane ? false : 0
  WIP.parent && commits.push(WIP)

  if (WIP.child) return WIP.child
  while (WIP) {
    if(!preCommit && WIP.lane === false) {
      preCommit = WIP
      return null
    }
    if (WIP.sibling) {
      return WIP.sibling
    }
    return WIP.parent
  } 
}

const updateHook = WIP => {
  currentFiber = WIP
  resetCursor()
  let children = WIP.type(WIP.props)
  if (isStr(children)) children = createText(children)
  reconcileChildren(WIP, children)
}

const updateHost = WIP => {
  if (!WIP.node) {
    if (WIP.type === 'svg') {
      WIP.tag = Flag.SVG
    }
    WIP.node = createElement(WIP)
  }
  const p = WIP.parentNode || {}
  WIP.insertPoint = p.last || null
    ; p.last = WIP
    ; WIP.node.last = null
  reconcileChildren(WIP, WIP.props.children)
}

const getParentNode = WIP => {
  while ((WIP = WIP.parent)) {
    if (!isFn(WIP.type)) return WIP.node
  }
}

const reconcileChildren = (WIP, children) => {
  delete WIP.child
  const oldFibers = WIP.kids
  const newFibers = (WIP.kids = hashfy(children))

  const reused = {}

  for (const k in oldFibers) {
    const newFiber = newFibers[k]
    const oldFiber = oldFibers[k]

    if (newFiber && newFiber.type === oldFiber.type) {
      reused[k] = oldFiber
    } else {
      oldFiber.op = Flag.DELETE
      commits.push(oldFiber)
    }
  }

  let prevFiber

  for (const k in newFibers) {
    let newFiber = newFibers[k]
    const oldFiber = reused[k]

    if (oldFiber) {
      oldFiber.op = Flag.UPDATE
      newFiber = { ...oldFiber, ...newFiber }
      newFiber.lastProps = oldFiber.props
      if (shouldPlace(newFiber)) newFiber.op = Flag.PLACE
    } else {
      newFiber.op = Flag.PLACE
    }

    newFibers[k] = newFiber
    newFiber.parent = WIP

    if (prevFiber) {
      prevFiber.sibling = newFiber
    } else {
      if (WIP.tag === Flag.SVG) {
        newFiber.tag = Flag.SVG
      }
      WIP.child = newFiber
    }
    prevFiber = newFiber
  }

  if (prevFiber) prevFiber.sibling = null
}

const shouldPlace = fiber => {
  const p = fiber.parent
  if (isFn(p.type)) return p.key && !p.lane
  return fiber.key
}

const commitWork = fiber => {
  commits.forEach(commit)
  if(fiber.done) {
    fiber.done()
  }
  commits = []
  preCommit = null
  WIP = null
}

const commit = fiber => {
  const { op, parentNode, node, ref, hooks } = fiber
  if (op === Flag.DELETE) {
    if(hooks) {
      hooks.list.forEach(cleanup)
    }
    cleanupRef(fiber.kids)
    while (isFn(fiber.type)) fiber = fiber.child
    parentNode.removeChild(fiber.node)
  } else if (isFn(fiber.type)) {
    if (hooks) {
      side(hooks.layout)
      schedule(() => side(hooks.effect))
    }
  } else if (op === Flag.UPDATE) {
    updateElement(node, fiber.lastProps, fiber.props)
  } else {
    const point = fiber.insertPoint ? fiber.insertPoint.node : null
    const after = point ? point.nextSibling : parentNode.firstChild
    if (after === node) return
    if (after === null && node === parentNode.lastChild) return
    parentNode.insertBefore(node, after)
  }
  refer(ref, node)
}

const onError = e => {
  if (isFn(e.error?.then)) {
    e.preventDefault()
    currentFiber.lane = false
    currentFiber.hooks.list.forEach(h => (h[3] ? (h[2] = 1) : h.length > 3 ? (h[2] = 2) : null))
    dispatchUpdate(currentFiber)
  }
}

const hashfy = c => {
  const out = {}
  isArr(c)
    ? c.forEach((v, i) => (isArr(v) ? v.forEach((vi, j) => (out[hs(i, j, vi.key)] = vi)) : some(v) && (out[hs(i, null, v.key)] = v)))
    : some(c) && (out[hs(0, null, c.key)] = c)
  return out
}

const refer = (ref, dom) => {
  if (ref) isFn(ref) ? ref(dom) : (ref.current = dom)
}

const cleanupRef = kids => {
  for (const k in kids) {
    const kid = kids[k]
    refer(kid.ref, null)
    if (kid.kids) cleanupRef(kid.kids)
  }
}

const side = effects => {
  effects.forEach(cleanup)
  effects.forEach(effect)
  effects.length = 0
}

export const getCurrentFiber = () => currentFiber || null

const effect = e => (e[2] = e[0](currentFiber))
const cleanup = e => e[2]?.(currentFiber)

export const isFn = x => typeof x === 'function'
export const isStr = s => typeof s === 'number' || typeof s === 'string'
export const some = v => v != null && v !== false && v !== true

const hs = (i, j, k) =>
  k != null && j != null ? '.' + i + '.' + k : j != null ? '.' + i + '.' + j : k != null ? '.' + k : '.' + i

export const Flag = {
  NOWORK: 0,
  PLACE: 1,
  UPDATE: 2,
  DELETE: 3,
  SVG: 4,
}

