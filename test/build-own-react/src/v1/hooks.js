/* eslint-disable */
import { dispatchUpdate, isFn, getCurrentFiber } from './reconciler.fre'
let cursor = 0

export const resetCursor = () => {
  cursor = 0
}

export const useState = initState => {
  return useReducer(null, initState)
}

export const useReducer = (reducer, initState) => {
  const [hook, current] = getHook(cursor++)
  if (hook[2] === 1) {
    hook[0] = initState
    hook[2] = 0
  } else if (hook[2] === 2) {
    hook[2] = 0
  } else {
    hook[0] = isFn(hook[1]) ? hook[1](hook[0]) : hook[1] || initState
  }
  return [
    hook[0],
    action => {
      hook[1] = reducer ? reducer(hook[0], action) : action
      hook[3] = reducer && (action).type[0] === '*'
      dispatchUpdate(current)
    },
  ]
}

export const useEffect = (cb, deps) => {
  return effectImpl(cb, deps, 'effect')
}

export const useLayout = (cb, deps) => {
  return effectImpl(cb, deps, 'layout')
}

const effectImpl = (cb, deps, key) => {
  const [hook, current] = getHook(cursor++)
  if (isChanged(hook[1], deps)) {
    hook[0] = useCallback(cb, deps)
    hook[1] = deps
    current.hooks[key].push(hook)
  }
}

export const useMemo = (cb, deps) => {
  const hook = getHook(cursor++)[0]
  if (isChanged(hook[1], deps)) {
    hook[1] = deps
    return (hook[0] = cb())
  }
  return hook[0]
}

export const useCallback = (cb, deps) => {
  return useMemo(() => cb, deps)
}

export const useRef = current => {
  return useMemo(() => ({ current }), [])
}

export const getHook = cursor => {
  const current = getCurrentFiber()
  const hooks = current.hooks || (current.hooks = { list: [], effect: [], layout: [] })
  if (cursor >= hooks.list.length) {
    hooks.list.push([])
  }
  return [hooks.list[cursor], current]
}

export const isChanged = (a, b) => {
  return !a || a.length !== b.length || b.some((arg, index) => arg !== a[index])
}
