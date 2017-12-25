import {Parser, Grammar} from 'nearley'
import moo from 'moo'
import grammar from './lisp-grammar.ne'
const parser = new Parser(Grammar.fromCompiled(grammar))

// removes comments
function preProcess(source) {
  return source.replace(/;.*$/gm, "")
}
export function execute(source) {
  const preProcessed = preProcess(source)
  parser.feed(preProcessed)
  if (parser.results.length != 1) {
    throw new Error(`The parser returned ${parser.results.length} results!`)
  }
  console.log("Now we're ready", stringify(parser.results[0]))
}

if (process && process.argv.length == 3) {
  const fileName = process.argv[2]
  fs.readFile(fileName, 'utf8', function (err, data) {
    execute(preprocess(data))
  })
}

function stringify(obj) {
  var seen = [];

  return JSON.stringify(obj, function(key, val) {
     if (val != null && typeof val == "object") {
          if (seen.indexOf(val) >= 0) {
              return "seen";
          }
          seen.push(val);
      }
      return val;
  });
}
