import {parse} from '@/interpreter'
import 'colors'
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
