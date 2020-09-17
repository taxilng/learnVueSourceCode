/* @flow */

import { toArray } from '../util/index'

export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 第一次 全局缓存个 installedPlugins = this._installedPlugins = []
    // 第二次 installedPlugins = this._installedPlugins = [1]
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 当插件plugin插件已经在缓存中，就直接返回，单例嘛
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    // 将除了第一参数的另外几个参数拿出去来。
    const args = toArray(arguments, 1)
    // 在第一个参数添加上 Vue类
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      // 有install属性就调用这个属性值的方法，跟上拼凑的参数
      // 用apply的目的不是为了this指向，因为this指向根本没变，而是为了传参，将类数组args一个个再传入
      // 可以换一种方式来写 plugin.install(...args)
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      // 没有install，但是plugin本身是函数，那就直接调用
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin) //缓存起来
    return this
  }
}
