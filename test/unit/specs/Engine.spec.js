import {Point, Line} from '@/engine'
import nerdamer from "nerdamer"
import assert from "assert"
import Complex from "complex.js"
import h from '@/helpers.js'

describe('Point', () => {
  it('Converts to a complex number', () => {
    const p = new Point({x: 5, y: 2})

    assert(p.complex().equals(new Complex({re: 5, im: 2})))
  })
})

describe('Line', () => {
  it("correctly calculates slope and y-intercept", () => {
    const p1 = new Point({x: 5, y: 2})
    const p2 = new Point({x: 0, y: 0})

    const line = new Line(p1, p2)

    assert(h.eq(line.slope, nerdamer("2/5")))
    assert(h.eq(line.yIntercept, 0))
  }),
  it("handles the case of vertical lines", () => {
    const p1 = new Point({x: 3, y: 3})
    const p2 = new Point({x: 3, y: 6})

    const line = new Line(p1, p2)

    assert(line.slope == Infinity)
    assert(h.eq(line.xIntercept, 3))
  }),
  it("correctly tells if it contains a point or not", () => {
    const p1 = new Point({x: 5, y: 2})
    const p2 = new Point({x: 0, y: 0})
    const p3 = new Point({x: 5, y: 10})

    const line1 = new Line(p1, p2)
    const line2 = new Line(p1, p3)

    assert(line1.containsPoint(new Point({x: 10, y: 4})))
    assert(!line1.containsPoint(new Point({x: 10, y: 3})))
    assert(line1.containsPoint(new Point({x: nerdamer("5*sqrt(3)"), y: nerdamer("2*sqrt(3)")})))

    assert(line2.containsPoint(new Point({x: 5, y: 4})))
    assert(!line2.containsPoint(new Point({x: 6, y: 4})))
    assert(line2.containsPoint(new Point({x: 5, y: nerdamer("sqrt(3)")})))
  }),
  it("can tell if another line is same as this one", () => {
    const p1 = new Point({x: 0, y: 1})
    const p2 = new Point({x: 5, y: 3})
    const p3 = new Point({x: nerdamer("5*sqrt(3)"), y: nerdamer("2*sqrt(3) + 1")})
    const p4 = new Point({x: nerdamer("5*sqrt(3)"), y: 0})
    const p5 = new Point({x: nerdamer("5*sqrt(3)"), y: 100})

    const line1 = new Line(p1, p2)
    const line2 = new Line(p1, p3)

    const line3 = new Line(p3, p4)
    const line4 = new Line(p3, p5)

    assert(line1.same(line2))
    assert(line2.same(line1))

    assert(line3.same(line4))
    assert(line4.same(line3))

    assert(!line1.same(line3))
  })
})
