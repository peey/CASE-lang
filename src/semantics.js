import nerdamer from "nerdamer"
import * as engine from "./engine"

//is wrapping these in a class even necessary? perhaps it helps because it ensures a valid value
export const types = {
  Int: class Int {
    constructor(i) {
      if (Number.isInteger(i) && i >= 0) {
        this.value = i
      } else {
        throw new TypeError("semantics.types: expected Integer, got " + i)
      }
    }
  },
  Length: class Length {
    constructor(l) {
      //TODO: verify that the value is valid
      this.value = nerdamer(l)
    }
  },
  Point: engine.Point,
  Line: engine.Line,
  Circle: engine.Circle
}

// all the error messages of the program, along with debug (line number) information
// TODO: line number information
const errors = {
  ArgMisMatch(method, args) {
    return `${method} does not accept ${args} arguments`
  },
  NotAFunction(method) {
    return `${method} is not a function`
  },
  InvalidGrammar(found, expected) {
    return `Found ${found}, expected ${expected}`
  }
}

export class SymbolTable {
  constructor(provided = {}) {
    this.provided = Object.assign({
      Unit: new types.Length(1),
      O: new types.Point({x:0, y:0}),
      XAxis: new types.Line({eqn: nerdamer("x = 0")})
    }, provided)

    this.stack = [{
      table: {},
      heirarchial: false
    }] // initial scope is program scope

    //TODO later: perhaps having scope name will be useful in debugging?
  }

  newScope(heirarchial = false, initialTable = {}) {
    this.stack.push({table: initialTable, heirarchial})
  }

  exitScope() {
    this.stack.pop()
  }

  resolve(name) {
    let i = this.stack.length - 1
    while(i >= 0) {
      const entry = this.stack[i].table[name]
      if (entry) {
        return entry
      } else if(this.stack[i].heirarchial) {
        i--
      } else {
        break
      }
    }

    if (this.provided[name]) return this.provided[name];

    return false //interpreter should probably throw in this case
  }

  set(name, value) {
    this.stack[this.stack.length - 1].table[name] = value
  }
}

// the program state, exported for testing
export const state = {
  symbolTable: new SymbolTable(),
  compassLength: undefined,
  getCompassLength() {
    if (typeof this.compassLength == "undefined") {
      throw "compass length is undefined and can't be used"
    } else {
      return this.compassLength
    }
  },
  udfs: {}
}

function defineUDF(fn, args) {

}

function evaluateUDF(fn, args) {

}

export function evaluateExpression(e) {
  if (e.type === "form") {
    if (e.children[0].type !== "functionName") {
      throw errors.invalidGrammar(e.children[0].type, "functionName")
    }

    // first try built-in functions
    if (builtInFunctions[e.children[0].value]) {
      const fn = builtInFunctions[e.children[0].value]
      const fnNode = e.children[0]
      const argNodes = e.children.slice(1)
      return fn(argNodes, fnNode)
    } else {
      // this will be implemented later
    }
  } else if (e.type === "identifier") {
    return state.symbolTable.resolve(e.value)
  } else {
    throw new Error(`${e.type} node is not eval-able`)
  }
}


// all the handy validators
const expect = {
  type(objects, types) {
    objects = Array.isArray(objects)? objects : [objects]
    types = Array.isArray(types)? types : [types]

    objects.forEach((object) => {
      let flag = false
      for (let i = 0; i < types.length; i++) {
        if (object instanceof types[i]) {
          flag = true
          break
        }
      }

      if (flag == false) {
        throw new Error(`${object} does not belong to type ${types}`)
      }
    })

    return true
  }
}

const builtInFunctions = {
  arc(args, fn) {
    if (args.length == 1) {
      const radius = state.getCompassLength()
      const center = evaluateExpression(args[0])
      expect.type(center, types.Point)

      return new types.Circle(center, radius.value)
    } else {
      throw errors.ArgMisMatch(fn, args.length)
    }
  },

  line(args, fn) {
    if (args.length == 2) {
      const p = evaluateExpression(args[0])
      const q = evaluateExpression(args[1])
      expect.type([p, q], types.Point)

      return new types.Line({points: [p, q]})
    } else {
      throw errors.ArgMisMatch(fn, args.length)
    }
  },

  length(args, fn) {
    if (args.length == 2) {
      return new types.Length(args[0].distance(args[1]))
    } else {
      throw errors.ArgMisMatch(fn, args.length)
    }
  },

  open(args, fn) {
    if (args.length == 1) {
      const length = evaluateExpression(args[0])
      expect.type(length, types.Length)
      state.compassLength = length
    } else if (args.length == 2) {
      const a = evaluateExpression(args[0])
      const b = evaluateExpression(args[1])

      expect.type(a, types.Point)
      expect.type(b, types.Point)

      state.compassLength = a.distance(b)
    } else {
      throw errors.ArgMisMatch(fn, args.length)
    }
  },

  label(args, fn) {
    if (args.length >= 2) {
      if (args[0].type == "form" && args[0].children[0].value == "names") {
        for (let i = 1; i < args[0].children.length; i++) {
          const name = args[0].children[i]
          if (name.type !== "identifier") {
            throw "some error saying The arguments to names must be identifiers"
          }
        }
      } else {
        throw "some error saying The first argument to label must be a names form"
      }

      const names = args[0].children.slice(1).map((x) => x.value)

      let rhs = []

      for (let i = 1; i < args.length; i++) {
        const result = evaluateExpression(args[i])
        rhs = rhs.concat(result || [])
      }

      if (names.length != rhs.length) {
        throw `some error saying mismatch between number of variables on left hand side (${names.length}) and the right hand side (${rhs.length})`
      }

      names.forEach((name, ix) => state.symbolTable.set(name, rhs[ix]))
    } else {
      throw errors.ArgMisMatch(fn, args.length)
    }
  },

  block(args) {
    let result
    state.symbolTable.newScope(true)
    for(let i = 0; i < args.length; i++) {
      result = evaluateExpression(args[i])
    }
    state.symbolTable.exitScope()
    return result
  },

  output(args) {
    console.log("PROGRAM OUTPUT")
    for (let i = 0; i < args.length; i++) {
      const val = evaluateExpression(args[i])
      console.log(val.toString())
    }
    console.log("PROGRAM OUTPUT END")
  },

  loop(args, fn) {
    if (args.length >= 2) {
      expect.type(args[0], types.Int)
      const n = parseInt(args[0].value) // the number of times to loop
      for (let i = 0; i < n; i++) {
        for (let j = 1; j < args.length; j++) {
          evaluateExpression(args[j])
        }
      }
    } else {
      throw errors.ArgMisMatch(fn, args.length)
    }
  },

  intersection(args, fn) {
    if (args.length >= 2) {
      const a = evaluateExpression(args[0])
      const b = evaluateExpression(args[1])

      expect.type([a, b], [types.Line, types.Circle])

      if (a instanceof types.Line && b instanceof types.Line) {
        return a.pointsOfIntersection(b)
      } else if (a instanceof types.Line && b instanceof types.Circle) {
        return b.pointsOfIntersectionWithLine(a)
      } else if (b instanceof types.Line && a instanceof types.Circle) {
        return a.pointsOfIntersectionWithLine(b)
      } else {
        return a.pointsOfIntersectionWithCircle(b)
      }

    } else {
      throw errors.ArgMisMatch(fn, args.length)
    }
  }
}
