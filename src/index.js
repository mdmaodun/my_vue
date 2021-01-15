import MyVue from './lib/MyVue.js'

window.vm = new MyVue({
  el: '#app',
  data: { msg: 'hello', list: ['A', 'B', 'C', 'D'] },
  render(h) {
    return h(
      'div',
      {
        attrs: { id: 'app' }
      },
      [
        h('span', {}, [this.msg]),
        h('ul', {}, [...this.list.map((v) => h('li', { key: v }, [v]))])
      ]
    )
  }
})
