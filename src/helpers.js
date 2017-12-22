// value of a nerdamer numeric object
export default {
  val(x) {
    return x.buildFunction()()
  },

  eq(x, y) {
    return x.subtract(y).eq(0)
  }
}
