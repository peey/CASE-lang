// value of a nerdamer numeric object
const h = {
  val(x) {
    return x.buildFunction()()
  },

  cmp(x, y) {
    const sub = h.val(x.subtract(y))
    return sub == 0? 0 : (sub < 0? -1 : 1)
  },

  eq(x, y) {
    return h.cmp(x, y) == 0
  },

  lt(x, y) {
    return h.cmp(x, y) == -1
  },

  gt(x, y) {
    return h.cmp(x, y) == 1
  },

  dump(...args) {
    args = args.map(a => String(a))
    console.log(...args)
  }
}

export default h
