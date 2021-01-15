import createDOMElement from './createDOMElement.js'

function isTextNode(vnode) {
  return vnode.tag === undefined
}

function sameVNode(a, b) {
  const aKey = a.data && a.data.key
  const bKey = b.data && b.data.key
  return aKey === bKey && a.tag === b.tag
}

function moveAryItem(arr, fromIndex, toIndex) {
  const item = arr[fromIndex]
  arr.splice(fromIndex, 1)
  arr.splice(toIndex, 0, item)
}

// function moveAryItem(arr, fromIndex, toIndex) {
//   const item = arr[fromIndex]
//   if (fromIndex < toIndex) {
//     arr.splice(toIndex, 0, item)
//     arr.splice(fromIndex, 1)
//   } else {
//     arr.splice(fromIndex, 1)
//     arr.splice(toIndex, 0, item)
//   }
// }

// 待修复：虚拟dom也要更新
export default function patch(oldVnode, newVnode) {
  if (!oldVnode.elm) {
    createDOMElement(oldVnode)
  }

  // if (!newVnode.elm) {
  //   createDOMElement(newVnode)
  // }

  let vnode = oldVnode

  console.log('--------', oldVnode, newVnode, '----------')
  if (!sameVNode(oldVnode, newVnode)) {
    console.log('不是同一节点，直接插入新的，删除旧的')
    createDOMElement(newVnode)
    oldVnode.elm.after(newVnode.elm)
    oldVnode.elm.remove()
    vnode = newVnode
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
        oldVnode.children = updateChildren(
          oldVnode.elm,
          oldVnode.children,
          newVnode.children
        )
      }
    }
  }
  console.log('--------end----------')
  return vnode
}

function updateChildren(parentElm, oldChildren, newChildren) {
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
        createDOMElement(newStartVnode)
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
    for (let i = newStartIdx; i <= newEndIdx; ++i) {
      const newVnode = newChildren[i]
      createDOMElement(newVnode)
      parentElm.insertBefore(newVnode.elm, oldStartVnode && oldStartVnode.elm)
      const i2 = insertedVnodeQueue.findIndex((v) => v === oldStartVnode)
      insertedVnodeQueue.splice(
        i2 === -1 ? insertedVnodeQueue.length : i2,
        0,
        newVnode
      )
    }
  } else if (newStartIdx > newEndIdx && oldStartIdx <= oldEndIdx) {
    console.log(insertedVnodeQueue, oldStartIdx, oldEndIdx)
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
