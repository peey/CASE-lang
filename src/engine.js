//TODO: swap out algebra.js for algebraite because algebra.js doesn't support square roots
import nerdamer from 'nerdamer'
import Complex from 'complex.js'
import h from './helpers.js'

export class Point {
  constructor({x, y}) {
    this.x = nerdamer(x)
    this.y = nerdamer(y)
  }

  complex() {
    return new Complex({
      re: h.val(this.x),
      im: h.val(this.y)
    })
  }
}

export class Line {
  constructor(p1, p2) {
    if (h.eq(p1.x, p2.x)) {
      // the line is vertical
      this.slope = Infinity
      this.xIntercept = p1.x
    } else {
      this.slope = p1.y.subtract(p2.y).divide(p1.x.subtract(p2.x))
      this.yIntercept = p1.y.subtract(this.slope.multiply(p1.x))
    }
  }

  containsPoint(p) {
    if (this.slope == Infinity) {
      return h.eq(this.xIntercept, p.x)
    } else {
      return h.eq(p.y, this.slope.multiply(p.x).add(this.yIntercept))
    }
  }

  same(anotherLine) {
    if (this.slope == Infinity || anotherLine.slope == Infinity) {
      return this.slope == Infinity && anotherLine.slope == Infinity && h.eq(this.xIntercept, anotherLine.xIntercept)
    } else {
      return h.eq(anotherLine.slope, this.slope) && h.eq(anotherLine.yIntercept, this.yIntercept)
    }
  }
}
