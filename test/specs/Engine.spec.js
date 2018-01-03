import {Point, Line, Circle} from '@/engine'
import nerdamer from "nerdamer/all"
import assert from "assert"
import Complex from "complex.js"
import h from '@/helpers.js'

describe('Point', () => {
  it('Converts to a complex number', () => {
    const p = new Point({x: 5, y: 2})

    assert(p.complex().equals(new Complex({re: 5, im: 2})))
  })

  it("can tell if another point is same as it", () => {
    const p1 = new Point({x: nerdamer("sqrt(3)/2"), y: 8})
    const p2 = new Point({x: nerdamer("sqrt(3)/2"), y: 8})
    const p3 = new Point({x: nerdamer("sqrt(3)/2"), y: 9})
    const p4 = new Point({x: nerdamer("sqrt(3)/4"), y: 8})

    assert(p1.same(p2))
    assert(!p1.same(p3))
    assert(!p1.same(p4))
  })

  it("can calculate distance between itself and another point", () => {
    const p = new Point(0, 0)
    const q = new Point(1, 1)
    assert(h.eq(p.distance(q), nerdamer("sqrt(2)")))
  })
})

describe('Line', () => {
  describe('Instantiation', () => {

    it("correctly calculates slope and y-intercept", () => {
      const p1 = new Point({x: 5, y: 2})
      const p2 = new Point({x: 0, y: 0})

      const line = new Line({points: [p1, p2]})

      assert(h.eq(line.slope, nerdamer("2/5")))
      assert(h.eq(line.yIntercept, 0))
    })

    it("handles the case of vertical lines", () => {
      const p1 = new Point({x: 3, y: 3})
      const p2 = new Point({x: 3, y: 6})

      const line = new Line({points: [p1, p2]})

      assert(line.slope == Infinity)
      assert(h.eq(line.xIntercept, 3))
    })

    it("correctly instantiates from an equation", () => {
      const eqn1 = nerdamer("3y + 5x - 8 = 0")
      const eqn2 = nerdamer("9x = sqrt(8)")
      const eqn3 = nerdamer("9y = sqrt(8)")

      const line1 = new Line({eqn: eqn1})
      const line2 = new Line({eqn: eqn2})
      const line3 = new Line({eqn: eqn3})

      assert(h.eq(line1.slope, nerdamer("-5/3")))
      assert(h.eq(line1.yIntercept, nerdamer("8/3")))

      assert(line2.slope == Infinity)
      assert(h.eq(nerdamer(line2.xIntercept), nerdamer("sqrt(8)/9")))

      assert(h.eq(line3.slope, 0))
      assert(h.eq(line3.yIntercept, nerdamer("sqrt(8)/9")))
    })
  })

  it("correctly tells if it contains a point or not", () => {
    const p1 = new Point({x: 5, y: 2})
    const p2 = new Point({x: 0, y: 0})
    const p3 = new Point({x: 5, y: 10})

    const line1 = new Line({points: [p1, p2]})
    const line2 = new Line({points: [p1, p3]})

    assert(line1.containsPoint(new Point({x: 10, y: 4})))
    assert(!line1.containsPoint(new Point({x: 10, y: 3})))
    assert(line1.containsPoint(new Point({x: nerdamer("5*sqrt(3)"), y: nerdamer("2*sqrt(3)")})))

    assert(line2.containsPoint(new Point({x: 5, y: 4})))
    assert(!line2.containsPoint(new Point({x: 6, y: 4})))
    assert(line2.containsPoint(new Point({x: 5, y: nerdamer("sqrt(3)")})))
  })

  it("can tell if another line is same as this one", () => {
    const p1 = new Point({x: 0, y: 1})
    const p2 = new Point({x: 5, y: 3})
    const p3 = new Point({x: nerdamer("5*sqrt(3)"), y: nerdamer("2*sqrt(3) + 1")})
    const p4 = new Point({x: nerdamer("5*sqrt(3)"), y: 0})
    const p5 = new Point({x: nerdamer("5*sqrt(3)"), y: 100})

    const line1 = new Line({points: [p1, p2]})
    const line2 = new Line({points: [p1, p3]})

    const line3 = new Line({points: [p3, p4]})
    const line4 = new Line({points: [p3, p5]})

    assert(line1.same(line2))
    assert(line2.same(line1))

    assert(line3.same(line4))
    assert(line4.same(line3))

    assert(!line1.same(line3))
  })

  it("can give point of intersection of two non parallel lines", () => {
    const line1 = new Line({eqn: nerdamer("3x + 5y = 7")})
    const line2 = new Line({eqn: nerdamer("6x + 5y = 7")})
    const line3 = new Line({eqn: nerdamer("12x + 10y = 14")})
    const line4 = new Line({eqn: nerdamer("12x + 10y = 15")})
    const line5 = new Line({eqn: nerdamer("12x = 5")})

    //oblique
    const p1 = line1.pointOfIntersection(line2)
    assert(h.eq(p1.x, 0))
    assert(h.eq(p1.y, nerdamer("7/5")))

    //same
    const p2 = line2.pointOfIntersection(line3)
    assert(typeof p2 == "undefined")

    //parallel
    const p3 = line3.pointOfIntersection(line4)
    assert(typeof p3 == "undefined")

    //one of them vertical
    const p4 = line4.pointOfIntersection(line5)
    assert(h.eq(p4.x, nerdamer("5/12")))
    assert(h.eq(p4.y, nerdamer("1")))

    //check for commutavitiy
    const p5 = line5.pointOfIntersection(line4)
    assert(h.eq(p5.x, nerdamer("5/12")))
    assert(h.eq(p5.y, nerdamer("1")))
  })
})

describe("Circle", () => {
  it("constructs properly", () => {
    const c = new Circle(new Point({x: 3, y: 6}), nerdamer("sqrt(45)"))
    assert(h.eq(c.center.x, 3)) // got emperically
    assert(h.eq(c.center.y, 6)) // got emperically
    assert(h.eq(c.radius, nerdamer("sqrt(45)"))) // got emperically
  })

  it("can make a correct equation", () => {
    const c = new Circle(new Point({x: 3, y: 6}), nerdamer("sqrt(45)"))
    assert(c.equation.toString() == "-12*y+y^2-6*x+x^2+45=45") // got emperically
  })

  it("can tell if a point is a boundary point", () => {
    const c = new Circle(new Point({x: 3, y: 6}), nerdamer("sqrt(45)"))

    assert(c.boundaryPoint(new Point({x: 0, y: 0})))
    assert(c.boundaryPoint(new Point({x: nerdamer("3 + sqrt(45)"), y: 6})))
    assert(!c.boundaryPoint(new Point({x: 1, y: 1})))
  })

  it("can tell if another circle is the same as it", () => {
    const c1 = new Circle(new Point({x: nerdamer("sqrt(3)/2"), y: 8}), nerdamer("sqrt(8)"))
    const c2 = new Circle(new Point({x: nerdamer("sqrt(3)/2"), y: 8}), nerdamer("sqrt(8)"))
    const c3 = new Circle(new Point({x: nerdamer("sqrt(3)/2"), y: 8}), nerdamer("sqrt(3)/2"))
    const c4 = new Circle(new Point({x: nerdamer("sqrt(3)/4"), y: 8}), nerdamer("sqrt(8)"))

    assert(c1.same(c2))
    assert(!c1.same(c3))
    assert(!c1.same(c4))
  })

  it("can find points of intersection with a line", () => {
    const c = new Circle(new Point({x: 3, y: 6}), nerdamer("sqrt(45)"))

    let l, results, yvals
    // vertical line
    l = new Line({eqn: nerdamer("x = 0")})
    results = c.pointsOfIntersectionWithLine(l)
    assert(results[0].same(new Point(0, 12)))
    assert(results[1].same(new Point(0, 0)))

    // random line
    l = new Line({eqn: nerdamer("y = x")})
    results = c.pointsOfIntersectionWithLine(l)
    assert(results[0].same(new Point(0, 0)))
    assert(results[1].same(new Point(9, 9)))

    // tangent
    l = new Line({eqn: nerdamer("y = 6 - sqrt(45)")})
    results = c.pointsOfIntersectionWithLine(l)
    assert(results.length == 1)
    assert(results[0].same(new Point(3, nerdamer("6 - sqrt(45)"))))
  })

  it("can find points of intersection with another circle", () => {
    const c1 = new Circle(new Point({x:2, y:1}), 5)
    const c2 = new Circle(new Point({x:10, y:1}), 7)
    const results = c1.pointsOfIntersectionWithCircle(c2)
    // verified by wolfaram alpha : https://www.wolframalpha.com/input/?i=intersection+points+of+(x+-+2)%5E2+%2B+(y-1)%5E2+%3D+25,+(x+-+10)%5E2+%2B+(y-1)%5E2+%3D+49
    const a = nerdamer("(1/2)*(-5*sqrt(3)+2)")
    const b = nerdamer("(1/2)*(5*sqrt(3)+2)")
    assert(results[0].same(new Point(nerdamer("9/2"), b)))
    assert(results[1].same(new Point(nerdamer("9/2"), a)))
  })

  it("can convert to string representation", () => {
    const c = new Circle(new Point({x:2, y:1}), 5)
    expect(c.toString()).to.equal("Circle[(2,1), 5]")
  })

})
