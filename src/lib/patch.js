import createDOMElement from './createDOMElement.js'

function isTextNode(vnode) {
  return vnode.tag === undefined
}

function sameVNode(a, b) {
  const aKey = a.data && a.data.key
  const bKey = b.data && b.data.key
  return aKey === bKey && a.tag === b.tag
}

function moveAryItem(ary, fromIdx, toIdx) {
  const item = ary[fromIdx]
  ary.splice(fromIdx, 1)
  ary.splice(toIdx, 0, item)
}

export default function patch(oldVnode, newVnode) {
  if (!oldVnode.elm) {
    createDOMElement(oldVnode)
  }

  if (!newVnode.elm) {
    createDOMElement(newVnode)
  }

  let finalVnode = oldVnode

  console.log('--------', oldVnode, newVnode, '----------')
  if (!sameVNode(oldVnode, newVnode)) {
    console.log('不是同一节点，直接插入新的，删除旧的')
    oldVnode.elm.after(newVnode.elm)
    oldVnode.elm.remove()
    finalVnode = newVnode
  } else {
    console.log('是同一个节点')
    if (oldVnode === newVnode) {
      console.log('在内存中是同一个对象，over')
    } else {
      console.log('在内存中不是同一个对象')
      if (isTextNode(newVnode)) {
        console.log('是文本节点')
        if (newVnode.text === oldVnode.text) {
          console.log('文本一样，over')
        } else {
          console.log('文本不一样，更新文本, over')
          oldVnode.text = newVnode.text
          oldVnode.elm.nodeValue = oldVnode.text
        }
      } else {
        console.log('不是文本节点，开始diff算法比较，补丁更新children')
        finalVnode.children = updateChildren(
          oldVnode.children,
          newVnode.children,
          oldVnode.elm
        )
      }
    }
  }
  console.log('--------end----------')
  return finalVnode
}

function updateChildren(oldChildren, newChildren, parentElm) {
  const insertedVnodeQueue = [...oldChildren]

  let oldStartIdx = 0
  let oldEndIdx = oldChildren.length - 1
  let oldStartVnode = oldChildren[oldStartIdx]
  let oldEndVnode = oldChildren[oldEndIdx]

  let newStartIdx = 0
  let newEndIdx = newChildren.length - 1
  let newStartVnode = newChildren[newStartIdx]
  let newEndVnode = newChildren[newEndIdx]

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode === undefined) {
      oldStartVnode = [++oldStartIdx]
    } else if (oldEndVnode === undefined) {
      oldEndVnode = [--oldEndIdx]
    } else if (sameVNode(oldStartVnode, newStartVnode)) {
      patch(oldStartVnode, newStartVnode)
      oldStartVnode = oldChildren[++oldStartIdx]
      newStartVnode = newChildren[++newStartIdx]
    } else if (sameVNode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldChildren[--oldEndIdx]
      newEndVnode = newChildren[--newEndIdx]
    } else if (sameVNode(oldStartVnode, newEndVnode)) {
      patch(oldStartVnode, newEndVnode)
      oldEndVnode.elm.after(oldStartVnode.elm)
      moveAryItem(
        insertedVnodeQueue,
        insertedVnodeQueue.findIndex((v) => v === oldStartVnode),
        insertedVnodeQueue.findIndex((v) => v === oldEndVnode)
      )
      oldStartVnode = oldChildren[++oldStartIdx]
      newEndVnode = newChildren[--newEndIdx]
    } else if (sameVNode(oldEndVnode, newStartVnode)) {
      patch(oldEndVnode, newStartVnode)
      oldStartVnode.elm.before(oldEndVnode.elm)
      moveAryItem(
        insertedVnodeQueue,
        insertedVnodeQueue.findIndex((v) => v === oldEndVnode),
        insertedVnodeQueue.findIndex((v) => v === oldStartVnode)
      )
      oldEndVnode = oldChildren[--oldEndIdx]
      newStartVnode = newChildren[++newStartIdx]
    } else {
      const oldVnodeIdx = oldChildren.findIndex((v) =>
        sameVNode(v, newStartVnode)
      )
      if (oldVnodeIdx !== -1) {
        const oldVnode = patch(oldChildren[oldVnodeIdx], newStartVnode)
        oldStartVnode.elm.before(oldVnode.elm)
        moveAryItem(
          insertedVnodeQueue,
          insertedVnodeQueue.findIndex((v) => v === oldVnode),
          insertedVnodeQueue.findIndex((v) => v === oldStartVnode)
        )
        oldChildren[oldVnodeIdx] = undefined
        newStartVnode = newChildren[++newStartIdx]
      } else {
        oldStartVnode.elm.before(newStartVnode.elm)
        insertedVnodeQueue.splice(
          insertedVnodeQueue.findIndex((v) => v === oldStartVnode),
          0,
          newStartVnode
        )
        newStartVnode = newChildren[++newStartIdx]
      }
    }
  }

  if (oldStartIdx > oldEndIdx && newStartIdx <= newEndIdx) {
    console.log('newChildren中还有新的节点要添加')
    let refVnode = newChildren[newEndIdx + 1]
    if (refVnode) {
      let refVnodeIdx = insertedVnodeQueue.findIndex((v) =>
        sameVNode(v, refVnode)
      )
      refVnode = insertedVnodeQueue[refVnodeIdx]
      for (let i = newStartIdx; i <= newEndIdx; i++) {
        const newVnode = newChildren[i]
        parentElm.insertBefore(newVnode.elm, refVnode.elm)
        insertedVnodeQueue.splice(refVnodeIdx++, 0, newVnode)
      }
    } else {
      for (let i = newStartIdx; i <= newEndIdx; i++) {
        const newVnode = newChildren[i]
        parentElm.append(newVnode.elm)
        insertedVnodeQueue.push(newVnode)
      }
    }
  } else if (newStartIdx > newEndIdx && oldStartIdx <= oldEndIdx) {
    console.log('oldChildren中要有节点要删除')
    for (let i = oldStartIdx; i <= oldEndIdx; ++i) {
      const oldVnode = oldChildren[i]
      if (oldVnode) {
        oldVnode.elm.remove()
        insertedVnodeQueue.splice(
          insertedVnodeQueue.findIndex((v) => v === oldVnode),
          1
        )
      }
    }
  }
  return insertedVnodeQueue
}
