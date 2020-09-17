import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'


// 定义vue构造函数
function Vue (options) {
    // rollup打包编译把(process.env.NODE_ENV 编译成 development
    if (process.env.NODE_ENV !== 'production' &&
        !(this instanceof Vue) //直接函数调用的话，this = window； 所以可以判断是否由new来调用
    ) {
        warn('Vue is a constructor and should be called with the `new` keyword')
        // return new Vue() 这样来优化怎么样？
    }
    this._init(options) // 由initMixin(Vue) 方法来定义了这个方法；
}

initMixin(Vue) // 初始化 _init函数 文件路径 core/instance/init.js
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
