/**
 * @name 调度器
 * @description 用于调度任务的执行
 * - 任务优先级处理
 * - 让任务不紧急、剩余时间又不充足的情况下，不阻碍主线程
 */

// 宏任务列表
const macroTask = []
// 任务最后执行时间
let deadline = 0
// 让出主线程的剩余时间
const sliceLen = 5
// 所有需要执行的回调函数
const callbacks = []

// 调度器，callbacks存放flushWork
// 如果是第一个，调用requestMessageChannel进行取出所有回调进行执行
export function schedule (cb) {
  // 因为requestMessageChannel会返回一个函数用于执行下一个宏任务
  // 因此此时所有同步或者微任务都已经加入callbacks中
  callbacks.push(cb) === 1 && postMessage()
}

// 任务调度
export function scheduleWork (callback) {
  // 获取当前时间
  const currentTime = getTime();
  // 定义任务
  const newTask = {
    callback,
    time: currentTime + 3000,
  }
  // 把任务添加到宏任务中
  macroTask.push(newTask)
  // 开始调度
  schedule(flushWork)
}

const postMessage = (function () {
  // 定义一个存放执行所有回调函数的函数
  const cb = () => callbacks.splice(0).forEach(c => c())
  if (typeof MessageChannel !== 'undefined') {
    const channel = new MessageChannel()
    // 在message channel port1 添加回调
    channel.port1.onmessage = cb
    // 返回一个函数用于执行message channel port1 上的 postMessage 方法，
    // 以触发前一步的回调
    return () => channel.port2.postMessage(null)
  }
  // MessageChannel不存在就用setTimeout异步执行
  return () => setTimeout(cb)
})()

// 刷新任务
function flushWork() {
  // 刷新当前时间
  const currentTime = getTime()
  // 刷新截止时间
  deadline = currentTime + sliceLen
  // 如果任务未清空，则继续进行调度
  flush(currentTime) && schedule(flushWork)
}

// 刷新函数，返回任务是否结束
function flush(initTime) {
  let currentTime = initTime
  let currentTask = peek(macroTask)
  while (currentTask) {
    // 获取任务是否过期未执行 true为任务超过最晚执行时间
    const timeout = currentTask.time <= currentTime
    // 如果任务未过期，但当前宏任务执行时间超过 5 秒
    // 应该让出主线程，直接退出任务调度
    if (!timeout && shouldYeild()) {
      break
    }

    // 获取任务的callback
    const callback = currentTask.callback;
    // 清楚当前任务的callback
    currentTask.callback = null;
    // 如果callback是函数，则直接执行，并返回下一个需要执行的callback
    const next = typeof callback === "function" && callback(timeout)
    // 如果next存在则给赋值给currentTask.callback
    // 不存在则直接在macroTask中移除当前的任务
    next ? (currentTask.callback = next) : macroTask.shift()

    // 刷新最新的任务
    currentTask = peek(macroTask)
    // 刷新当前时间
    currentTime = getTime()
  }
  // 返回任务是否结束标识 true则表示还有任务待执行
  return !!currentTask
}

function peek(queue) {
  // 任务根据其执行的最晚时间进行排序
  queue.sort((a, b) => a.time - b.time)
  // 返回优先级最高的任务
  return queue[0]
}

// 是否应该等待让出主线程
export function shouldYeild() {
  // 当前时间大于等于 deadline 时应该让出
  return getTime() >= deadline
}

function getTime() {
  // 单位秒，但使用了一个浮点数来达到微秒级别的精确度
  return performance.now()
}