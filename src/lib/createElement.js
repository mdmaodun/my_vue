import VNode from './VNode.js'

export default function createElement(tag, data, children) {
  return new VNode(
    tag,
    data,
    children.map((v) => {
      if (typeof v === 'string') {
        return new VNode(undefined, undefined, undefined, v, undefined)
      }
      return v
    }),
    undefined,
    undefined
  )
}
