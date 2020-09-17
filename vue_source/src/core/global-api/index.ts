/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 公开的util方法。
  // 注意：这些不被视为公共API的一部分-避免依赖
  // 它们，除非您意识到风险。
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  // 代码逻辑在 oberser/index.js 就是观察监听
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  Vue.options = Object.create(null)
  // ['component','directive','filter']
  ASSET_TYPES.forEach(type => {
    /**   
    *     Vue.options = {
    *     components: {},
    *     directives: {},
    *     filters: {},
    *   }
    **/ 
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  // 在Weex的多实例场景中，它用于标识“基本”构造函数以扩展所有纯对象组件。
  Vue.options._base = Vue
 // Vue.options.components = { KeepAlive }
  extend(Vue.options.components, builtInComponents)

  initUse(Vue) // Vue.use() 方法 位置global-api/use.js
  initMixin(Vue) //就是合并一些data,props,methods方法 global-api/mixin.js
  initExtend(Vue)
  initAssetRegisters(Vue)
}
