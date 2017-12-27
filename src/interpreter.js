import {Parser, Grammar} from 'nearley'
import moo from 'moo'
import grammar from './lisp-grammar.ne'
const parser = new Parser(Grammar.fromCompiled(grammar))

// removes comments
function preProcess(source) {
  return source.replace(/;.*$/gm, "")
}
export function parse(source) {
  const preProcessed = preProcess(source)
  parser.feed(preProcessed)
  if (parser.results.length != 1) {
    throw new Error(`The parser returned ${parser.results.length} results!`)
  }
  return parser.results[0]
}

// cbs can be an object with enter and exit callbacks or can just be a function in which case it'll be treated as just an enter function
export function walkParsed(parsed, cbs) {
  if (typeof cbs === "function") cbs = {enter: cbs}
  const forms = parsed.body.forms
  walkForms(forms, cbs)
}

export function walkForms(forms, cbs, parentAux) {
  if (typeof forms == "object") forms = [forms];
  const aux = Object.assign({}, parentAux || {});
  // every callback gets two auxillary information - parent, and index which denotes if its the first child, second child, etc of its parent

  forms.forEach(function (child, childIndex) {
    aux.index = childIndex
    cbs.enter && cbs.enter(child)

    if (child.type == "form") {
      walkForms(form.children, cbs, {parent: child})
    }

    aux.index = childIndex
    cbs.exit && cbs.exit(child)
  })
}

export function semanticAnalyzer(parsed) {
  /* Here are the semantic rules which this function will check
   * 1. First child of a form is a
   */
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
