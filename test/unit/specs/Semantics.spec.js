import nerdamer from "nerdamer"
import h from "@/helpers"
import {SymbolTable, types} from "@/semantics"

describe("Symbol Table", () => {
  it("Resolves the provided symbols in default state", () => {
    const t1 = new SymbolTable()
    assert(h.eq(t1.resolve('Unit').value, nerdamer("1")))

    const t2 = new SymbolTable({
      Hello: new types.Length(12)
    })
    assert(h.eq(t2.resolve('Unit').value, nerdamer("1")))
    assert(h.eq(t2.resolve('Hello').value, nerdamer("12")))

    const t3 = new SymbolTable({
      Unit: new types.Length(12)
    })
    assert(h.eq(t3.resolve('Unit').value, nerdamer("12")))
  })

  it("Lets you create a new scope, set variables, resolve the set variables, and exit scopes", () => {
    const table = new SymbolTable()
    table.newScope()
    table.set("A", new types.Int(3))
    assert(table.resolve("A").value === 3)

    table.newScope(true)
    table.set("Unit", new types.Int(3))
    assert(table.resolve("Unit").value === 3)

    table.newScope(false, {"B": new types.Int(3)})
    assert(table.resolve("B").value === 3)

    table.exitScope()
    table.exitScope()
    table.exitScope()
  })

  it("Limits access in non-heirarchial scope", () => {
    const table = new SymbolTable()
    table.set("A", new types.Int(3))

    table.newScope()
    assert(!table.resolve("A"))

    // more complex cases:

    table.exitScope()

    table.newScope(true) //parent is heirarchial but current is not
    table.newScope()
    assert(!table.resolve("A"))
  })

  it("Does not limit access in heirarchial scope", () => {
    const table = new SymbolTable()
    table.set("A", new types.Int(3))

    table.newScope(true)
    assert(table.resolve("A").value === 3)

    table.newScope(true)
    assert(table.resolve("A").value === 3)
  })
})
