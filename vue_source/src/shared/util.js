/* @flow */

export const emptyObject = Object.freeze({})

// These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.
export function isUndef (v: any): boolean % checks {
    return v === undefined || v === null
}

export function isDef (v: any): boolean % checks {
    return v !== undefined && v !== null
}

export function isTrue (v: any): boolean % checks {
    return v === true
}

export function isFalse (v: any): boolean % checks {
    return v === false
}

/**
 * Check if value is primitive.
 * 检查值是否为原始值，字符串，数字，symbol，布尔类型的值
 */
export function isPrimitive (value: any): boolean % checks {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        // $flow-disable-line
        typeof value === 'symbol' ||
        typeof value === 'boolean'
    )
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 * 快速对象检查-主要用于判断, 包含了数组
 */
export function isObject (obj: mixed): boolean % checks {
    return obj !== null && typeof obj === 'object'
}

/**
 * Get the raw type string of a value, e.g., [object Object].
 */
const _toString = Object.prototype.toString

export function toRawType (value: any): string {
    return _toString.call(value).slice(8, -1)
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 * 严格的对象类型检查，排除数组
 */
export function isPlainObject (obj: any): boolean {
    return _toString.call(obj) === '[object Object]'
}

export function isRegExp (v: any): boolean {
    return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 * 检查val是否为有效的数组索引
 */
export function isValidArrayIndex (val: any): boolean {
     //兼容 字符串'1'这样的
     //parseFloat(string) 默认参数为string，严格语法就是转成String
    const n = parseFloat(String(val))
    // 索引当然要大于等于0， 向下取整 必须 等于 自己 ；
    // isFinite() 函数用于检查其参数是否是无穷大，如果 number 是 NaN（非数字），或者是正、负无穷大的数，则返回 false。
    return n >= 0 && Math.floor(n) === n && isFinite(val)
}

export function isPromise (val: any): boolean {
    return (
        isDef(val) &&
        typeof val.then === 'function' &&
        typeof val.catch === 'function'
    )
}

/**
 * Convert a value to a string that is actually rendered.
 */
export function toString (val: any): string {
    return val == null
        ? ''
        : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
            ? JSON.stringify(val, null, 2)
            : String(val)
}

/**
 * Convert an input value to a number for persistence.
 * If the conversion fails, return original string.
 */
export function toNumber (val: string): number | string {
    const n = parseFloat(val)
    return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
export function makeMap (
    str: string,
    expectsLowerCase?: boolean
): (key: string) => true | void {
    const map = Object.create(null)
    const list: Array<string> = str.split(',')
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true
    }
    return expectsLowerCase
        ? val => map[val.toLowerCase()]
        : val => map[val]
}

/**
 * Check if a tag is a built-in tag.
 */
export const isBuiltInTag = makeMap('slot,component', true)

/**
 * Check if an attribute is a reserved attribute.
 */
export const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is')

/**
 * Remove an item from an array.
 */
export function remove (arr: Array<any>, item: any): Array<any> | void {
    if (arr.length) {
        const index = arr.indexOf(item)
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}

/**
 * Check whether an object has the property.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj: Object | Array<*>, key: string): boolean {
    return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 * 缓存函数调用的结果
 */
export function cached<F: Function> (fn: F): F {
    const cache = Object.create(null) //创建一个空对象用于接收
    // 返回一个函数
    return (function cachedFn (str: string) {
        const hit = cache[str]
        //假设没有缓存这个结果，就把它存起来cache[str] = fn(str) 如果有缓存，直接返回
        return hit || (cache[str] = fn(str))
    }: any)
}

/**
 * Camelize a hyphen-delimited string.
 * 连接符 改成 驼峰
 */
// 正则 - 匹配 - ，\w 匹配字母或数字或下划线
const camelizeRE = /-(\w)/g
export const camelize = cached((str: string): string => {
    // replace 接正则， 第二个参数为函数， return 出 替换的值；
    // 第一个参数 _ 匹配的是正则的完整值，例如 'a-b' 匹配到 '-b'
    // 第二参数 匹配到 () 括号里面的匹配值，例如 'a-b' 匹配到 'b' 
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
})

/**
 * Capitalize a string.
 */
export const capitalize = cached((str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
})

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = cached((str: string): string => {
    return str.replace(hyphenateRE, '-$1').toLowerCase()
})

/**
 * Simple bind polyfill for environments that do not support it,
 * e.g., PhantomJS 1.x. Technically, we don't need this anymore
 * since native bind is now performant enough in most browsers.
 * But removing it would mean breaking code that was able to run in
 * PhantomJS 1.x, so this must be kept for backward compatibility.
 */

/* istanbul ignore next */
function polyfillBind (fn: Function, ctx: Object): Function {
    function boundFn (a) {
        const l = arguments.length
        return l
            ? l > 1
                ? fn.apply(ctx, arguments)
                : fn.call(ctx, a)
            : fn.call(ctx)
    }

    boundFn._length = fn.length
    return boundFn
}

function nativeBind (fn: Function, ctx: Object): Function {
    return fn.bind(ctx)
}

export const bind = Function.prototype.bind
    ? nativeBind
    : polyfillBind

/**
 * Convert an Array-like object to a real Array.
 * 将类似Array的对象转换为真实的Array。
 * 第二个参数比较 有意思，设置开始复制的下标，默认值0
 */
export function toArray (list: any, start?: number): Array<any> {
    start = start || 0
    let i = list.length - start
    const ret: Array<any> = new Array(i)
    while (i--) {
        ret[i] = list[i + start]
    }
    return ret
}

/**
 * Mix properties into target object.
 * 将_from的属性混合（会覆盖）to对象中
 * 有污染的改变增加target object的属性
 * for in 可以拷贝继承属性，不可以拷贝 symbol
 * Object.assign 可以拷贝symbol，不可以拷贝继承属性
 * 这就是这个方法与object.assign的区别
 * demo
 * mys1 = Symbol('foo');
 * mys2 = Symbol('fzk');
 * var o1 = {a:1, [mys1]:5};
 * o1.__proto__ = {c:3}
 * var o2 = {b:2,  [mys2]: 6};
 * o2.__proto__ = {d:4};
 * var o3 = Object.assign(o1, o2)
 * for (var key in o1) {
 *    console.log(key, o1[key])
 *}
 */
export function extend (to: Object, _from: ?Object): Object {
    for (const key in _from) {
        to[key] = _from[key]
    }
    return to
}

/**
 * Merge an Array of Objects into a single Object.
 */
export function toObject (arr: Array<any>): Object {
    const res = {}
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
            extend(res, arr[i])
        }
    }
    return res
}

/* eslint-disable no-unused-vars */

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
export function noop (a?: any, b?: any, c?: any) { }

/**
 * Always return false.
 */
export const no = (a?: any, b?: any, c?: any) => false

/* eslint-enable no-unused-vars */

/**
 * Return the same value.
 */
export const identity = (_: any) => _

/**
 * Generate a string containing static keys from compiler modules.
 */
export function genStaticKeys (modules: Array<ModuleOptions>): string {
    return modules.reduce((keys, m) => {
        return keys.concat(m.staticKeys || [])
    }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
export function looseEqual (a: any, b: any): boolean {
    if (a === b) return true
    const isObjectA = isObject(a)
    const isObjectB = isObject(b)
    if (isObjectA && isObjectB) {
        try {
            const isArrayA = Array.isArray(a)
            const isArrayB = Array.isArray(b)
            if (isArrayA && isArrayB) {
                return a.length === b.length && a.every((e, i) => {
                    return looseEqual(e, b[i])
                })
            } else if (a instanceof Date && b instanceof Date) {
                return a.getTime() === b.getTime()
            } else if (!isArrayA && !isArrayB) {
                const keysA = Object.keys(a)
                const keysB = Object.keys(b)
                return keysA.length === keysB.length && keysA.every(key => {
                    return looseEqual(a[key], b[key])
                })
            } else {
                /* istanbul ignore next */
                return false
            }
        } catch (e) {
            /* istanbul ignore next */
            return false
        }
    } else if (!isObjectA && !isObjectB) {
        return String(a) === String(b)
    } else {
        return false
    }
}

/**
 * Return the first index at which a loosely equal value can be
 * found in the array (if value is a plain object, the array must
 * contain an object of the same shape), or -1 if it is not present.
 */
export function looseIndexOf (arr: Array<mixed>, val: mixed): number {
    for (let i = 0; i < arr.length; i++) {
        if (looseEqual(arr[i], val)) return i
    }
    return -1
}

/**
 * Ensure a function is called only once.
 */
export function once (fn: Function): Function {
    let called = false
    return function () {
        if (!called) {
            called = true
            fn.apply(this, arguments)
        }
    }
}
