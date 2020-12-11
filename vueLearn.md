1.
```js
class Observer{
    this.dep = new Dep()
}

export function observe() {
 return new Observer(value)
}
```