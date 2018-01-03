import {Parser, Grammar} from 'nearley'
import moo from 'moo'
import grammar from './lisp-grammar.ne'
import {ExecutionEnvironment, types} from './semantics'


// removes comments
function preProcess(source) {
  return source.replace(/;.*$/gm, "")
}

export function parse(source) {
  const parser = new Parser(Grammar.fromCompiled(grammar))
  const preProcessed = preProcess(source)
  parser.feed(preProcessed)
  if (parser.results.length != 1) {
    throw new Error(`The parser returned ${parser.results.length} results!`)
  }
  return parser.results[0]
}

export class REPL {
	constructor() {
		this.ee = new ExecutionEnvironment()
    // used to keep track of things which we have output to the screen already
    // done this because the alternative - empty the ee.output every time we print - would require modification of the original ee object
    this.previousOutputEndPosition = 0
	}

  loop(source) {
    // READ
    const parseTree = parse(source)
    const forms = parseTree.body.forms

    //EVAL
    for (let i = 0; i < forms.length; i++) {
      this.ee.eval(forms[i])
    }

    //PRINT
    if (this.ee.output.length > this.previousOutputEndPosition) {
      console.log(this.ee.output.slice(this.previousOutputEndPosition))
      this.previousOutputEndPosition = this.ee.output.length
    }
  }
}

//TODO: test the following two walking functions. They are not being used rn. Chuck them out if they have no use in the final product either

// cbs (callbacks) can be an object with enter and exit callbacks or can just be a function in which case it'll be treated as just an enter function
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

