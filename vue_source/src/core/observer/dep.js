/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 * 一个dep是可观察的，可以有多个指定它的指令。
 */
export default class Dep {
  static target: ?Watcher; // 静态属性
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
    // 调用的 watcher原型方法
    // Dep.target为什么会有 watcher的方法
    // 因为pushTarget(this)，在watcher里面调用了；this是Watcher的实例
    // Dep.target = new Watcher()
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    // 浅拷贝一下数组
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
    // 遍历更新
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
// 当前正在评估的目标观察者。
// 这是全局唯一的，因为一次只能评估一个观察者。
Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop() //删除数组的最后一个
  Dep.target = targetStack[targetStack.length - 1] //获取数组最后一个，当为空时，获取值为 undefined
}
