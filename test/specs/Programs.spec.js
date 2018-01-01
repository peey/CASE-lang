import {parse} from '@/interpreter'
import {evaluateExpression, types, state} from '@/semantics'
import h from '@/helpers'

const jsdiff = require("diff") // for some reason can't import this

// require every file in the programs directory, https://stackoverflow.com/a/31770875/1412255
var req = require.context("../programs", true, /(\.case|\.case\.json|\.case\.out)$/m);

const programs = {}
req.keys().forEach(function (fileName) {
  const matches = fileName.match(/\/[^/\.]*/g)
  const key = matches[matches.length - 1].slice(1)

  if (!programs[key]) programs[key] = {name: key};

  const program = programs[key]

  const data = req(fileName)

  if (/\.case$/.test(fileName)) program.src = data
  if (/\.case\.json$/.test(fileName)) program.parsed = data
  if (/\.case\.out$/.test(fileName)) program.out = data

})

Object.keys(programs).forEach((key) => {
  const program = programs[key]

  it ("Program - " + program.name, () => {
    const parsed = parse(program.src)
    const stringified = prettyJSON(parsed)



    if (program.parsed) {
      if (typeof program.parsed !== "object") {
        //TODO: Just load them as text files, to reduce overhead of converting to an object and then back to string since the ultimate
        //purpose of storing .case.json files is string comparison
        throw new Error("There's something wrong with the webpack loader, .case.json files should be loaded as objects, not strings")
      }

      if(prettyJSON(program.parsed) !== stringified) {
        //TODO: diff
        throw new Error("Parsed mismatch")
      }
    } else {
      console.log("generating parsed output for " + program.name)

      window.top.callPhantom({
        type: "program-parse-output",
        name: program.name,
        ast: stringified
      })
    }
  })
})

function prettyJSON(o) {
  return JSON.stringify(o, null, 2)
}

function printDiff(diff) {
  diff.forEach(function(part){
    // green for additions, red for deletions
    // grey for common parts
    var marker = part.added ? '+' :
      part.removed ? '-' : ']';
    console.log(marker + part.value);
  });
}

describe("some handwritten small programs", function () {
  it("opens the compass with the unit length", () => {
    const program = parse("(open Unit)")
    const result = evaluateExpression(program.body.forms[0])

    assert(typeof result === "undefined")
    assert(h.eq(state.compassLength.value, nerdamer(1)))
  })

  it("evaluates a block", () => {
    const program = parse("(block (open Unit))")
    const result = evaluateExpression(program.body.forms[0])

    assert(typeof result === "undefined")
    assert(h.eq(state.compassLength.value, nerdamer(1)))
  })

  it("evaluates a circle", () => {
    const program = parse("(block (open Unit) (arc O))")
    const result = evaluateExpression(program.body.forms[0])
    assert(result instanceof types.Circle)
    assert(result.same(new types.Circle(new types.Point(0, 0), 1)))
  })

  it("can make new labels", () => {
    const program = parse("(label (names MUnit FUnit) Unit Unit)")
    const result = evaluateExpression(program.body.forms[0])

    assert(typeof result === "undefined")
    assert(h.eq(state.symbolTable.resolve("MUnit").value, nerdamer(1)))
    assert(h.eq(state.symbolTable.resolve("FUnit").value, nerdamer(1)))
  })

  it("can give intersection between a circle and a line", () => {
    const program = parse("(block (open Unit) (intersection (arc O) XAxis))")
    const result = evaluateExpression(program.body.forms[0])

    const [A, B] = result
    assert(A instanceof types.Point)
    assert(B instanceof types.Point)

    //NOTE: if this test case errors, must be due to the order of A, B
    assert(A.same(new types.Point(0, 1)))
    assert(B.same(new types.Point(0, -1)))
  })

  xit("can label multiple values", () => {
    //TODO: find a way to do this without block, because block on exit loses scope
    const program = parse("(block (open Unit) (label (names A B) (intersection (arc O) XAxis)))")
    evaluateExpression(program.body.forms[0])

    const A = state.symbolTable.resolve("A")
    const B = state.symbolTable.resolve("B")

    console.log('yo', A, B)
    //assert(A instanceof types.Point)
    //assert(B instanceof types.Point)

    //assert(A.same(new types.Point(0, -1)))
    //assert(B.same(new types.Point(0, 1)))
  })
})
