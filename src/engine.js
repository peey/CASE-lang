import nerdamer from 'nerdamer/all'
import Complex from 'complex.js'
import h from './helpers.js'

console.log("nerdamer", nerdamer)

// comparator for sorting points north-west (-,+ quad) to south-east (+, - quad)
// TODO: sort clockwise. See https://stackoverflow.com/a/6989383/1412255 for ref. It does it from 12'o clock while I want to start it at 6'o clock
function pointComparator(a, b) {
  const cmpx = h.cmp(a.x, b.x)
  if (cmpx !== 0) {
    return cmpx
  } else {
    return h.cmp(b.y, a.y)
  }
}

export class Point {
  constructor(a, b) {
    let x, y
    if (typeof b === "undefined") {
      // called as new Point({x: 0, y:0})
      ({x, y} = a)
    } else {
      // called as new Point(0, 0)
      x = a
      y = b
    }

    this.x = nerdamer(x)
    this.y = nerdamer(y)
  }

  complex() {
    return new Complex({
      re: h.val(this.x),
      im: h.val(this.y)
    })
  }

  same(p) {
    return h.eq(p.x, this.x) && h.eq(p.y, this.y)
  }

  distance(p) {
    return nerdamer("sqrt((a-b)^2 + (c-d)^2)")
      .sub("a", this.x)
      .sub("b", p.x)
      .sub("c", this.y)
      .sub("d", p.y)
  }

  toString() {
    return "(" + this.x.toString() + "," + this.y.toString() + ")"
  }
}

export class Line {
  constructor({points, eqn}) {
    if (points) {
      const [p1, p2] = points
      if (h.eq(p1.x, p2.x)) {
        // the line is vertical
        this.slope = Infinity
        this.xIntercept = p1.x
      } else {
        this.slope = p1.y.subtract(p2.y).divide(p1.x.subtract(p2.x))
        this.yIntercept = p1.y.subtract(this.slope.multiply(p1.x))
        this.equation = nerdamer("y = mx + c", {m: this.slope, c: this.yIntercept})
      }
    } else if (eqn) {
      this.equation = eqn

      if (eqn.variables().indexOf("y") > -1) {
        // means slope is finite
        if (eqn.variables().indexOf("x") > -1) {
          // means slope is nonzero
          const coeffs = nerdamer.coeffs(eqn.solveFor("y"), "x")
          this.slope = nerdamer(nerdamer.vecget(coeffs, 1))
          this.yIntercept = nerdamer(nerdamer.vecget(coeffs, 0))
        } else {
          this.slope = nerdamer(0)
          this.yIntercept = eqn.solveFor("y")[0]
        }
      } else {
        this.slope = Infinity
        this.xIntercept = eqn.solveFor("x")[0]
      }
    } else {
      throw "a tantrum"
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

  pointOfIntersection(anotherLine) {
    const l1 = this, l2 = anotherLine

    if (!(l1.slope == Infinity && l2.slope == Infinity)) {
      if (l1.slope == Infinity || l2.slope == Infinity) {
        const l1 = this.slope == Infinity? this : anotherLine
        const l2 = l1 == this? anotherLine : this

        const x = l1.xIntercept
        const y = l2.slope.multiply(x).add(l2.yIntercept)
        return new Point({x, y})
      } else if (!h.eq(l1.slope, l2.slope)) {
        const x = l2.yIntercept.subtract(l1.yIntercept).divide(l1.slope.subtract(l2.slope))
        const y = l1.slope.multiply(x).add(l1.yIntercept)
        return new Point({x, y})
      }
    }
  }
}


//return values: 0 means equal, -1 means distance is less than d, +1 means distance is more than d
function distanceCompare(p1, p2, d) {
  const distanceSquared = nerdamer("(a - b)^2 + (c - d)^2", {a: p1.x, b: p2.x, c: p1.y, d: p2.y})
  const dSquared = nerdamer(d).pow(2)
  const comparison = h.val(distanceSquared) - h.val(dSquared)
  if (comparison == 0) {
    return 0
  } else if (comparison < 0) {
    return -1
  } else {
    return 1
  }
}

export class Circle {
  constructor(center, radius) {
    this.center = center // must be a point
    this.radius = nerdamer(radius)
    this.equation = nerdamer("(x - h)^2 + (y - k)^2 = (r)^2", {
      h: this.center.x,
      k: this.center.y
    }).sub("r", this.radius) //FIXME: for some reason I can't directly substitute r in the above call...
  }

  boundaryPoint(p) {
    return distanceCompare(this.center, p, this.radius) == 0
  }

  pointsOfIntersectionWithLine(l) {
    if (l.slope == Infinity) {
      const x = l.xIntercept
      const comparison = distanceCompare(this.center, new Point({x, y: this.center.y}), this.radius)
      if (comparison == 0) { // then the line is tangent to the circle
        return [new Point({x, y: this.center.y})]
      } else if (comparison == -1) {
        const ySolutions = this.equation.sub("x", x).solveFor("y")
        const result =  ySolutions.map(y => new Point({x, y: nerdamer(y, {x: x})}))
        result.sort(pointComparator)
        return result
      }
    } else {
      const eqnInX = this.equation.sub("y", nerdamer("(m*x + c)", {m: l.slope, c: l.yIntercept}))
      const xSolutions = eqnInX.solveFor("x")
      const result = xSolutions.map(x => new Point({x, y: l.equation.sub("x", x).solveFor("y")}))
      result.sort(pointComparator)
      return result
    }
  }

  pointsOfIntersectionWithCircle(c) {
    const compare = distanceCompare(this.center, c.center, this.radius.add(c.radius))

    if (compare != 1) {
      //equation of the line containing the two points: https://math.stackexchange.com/a/256123/41484
      const lineEquation = nerdamer("-2*(x)*(a - b) -2*(y)*(c - d) = (r^2 - s^2) - (a^2 - b^2) - (c^2 - d^2)")
        .sub("a", this.center.x)
        .sub("b", c.center.x)
        .sub("c", this.center.y)
        .sub("d", c.center.y)
        .sub("r", this.radius)
        .sub("s", c.radius)

      const line = new Line({eqn: lineEquation})

      const result = this.pointsOfIntersectionWithLine(line)
      result.sort(pointComparator)
      return result
    }
  }

  same(c) {
    return this.center.same(c.center) && h.eq(this.radius, c.radius)
  }
}
