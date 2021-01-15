export default function createDOMElement(vnode) {
  if (!vnode.tag) {
    vnode.elm = document.createTextNode(vnode.text)
  } else {
    vnode.elm = document.createElement(vnode.tag)

    if (vnode.data && vnode.data.attrs) {
      for (const [k, v] of Object.entries(vnode.data.attrs)) {
        vnode.elm.setAttribute(k, v)
      }
    }

    if (Array.isArray(vnode.children)) {
      vnode.children.forEach((v) => {
        createDOMElement(v)
        vnode.elm.append(v.elm)
      })
    }
  }
  return vnode.elm
}
