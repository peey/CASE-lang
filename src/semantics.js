import nerdamer from "nerdamer"
import * as engine from "./engine"

export class SymbolTable {
  constructor(provided = {}) {
    this.provided = Object.assign({
      Unit: new types.Length(1)
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
  Line: engine.Line
}

/*
 * [TODO] DISCUSSION - Is circle useful as a data type? there is no function which returns a circle.
 * In construction we generally draw the lines first and the compass arcs intersect with those, rather than the other way around.
 * So perhaps there is no need for a circle type because we never need to store it and refer to it later.
 * The only need to refer to a circle would be during styling, but we can look into that later
 */
