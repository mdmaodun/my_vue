import createElement from './createElement.js'
import createDOMElement from './createDOMElement.js'
import patch from './patch.js'

export default class MyVue {
  constructor(options) {
    this.$options = options
    this._initData()
    if (this.$options.el) {
      this.$mount(this.$options.el)
    }
  }

  _initData() {
    let timerId = null
    for (let [k, v] of Object.entries(this.$options.data)) {
      Object.defineProperty(this, k, {
        get: () => {
          return v
        },
        set: (newVal) => {
          if (v !== newVal) {
            v = newVal
            clearTimeout(timerId)
            timerId = setTimeout(() => {
              this._vnode = patch(this._vnode, this._render())
            }, 0)
          }
        }
      })
    }
  }

  $mount(selector) {
    // beforeMount
    const container = document.querySelector(selector)
    this._vnode = this._render()
    createDOMElement(this._vnode)
    this.$el = this._vnode.elm
    container.after(this.$el)
    container.remove()
    // mounted
  }

  _render() {
    return this.$options.render.apply(this, [createElement])
  }
}
