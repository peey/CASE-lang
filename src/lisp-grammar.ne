@{%
const moo = require("moo")
const lexer = moo.compile({
  ws: {match: /[\s]+/, lineBreaks: true},
  lparen: "(",
  rparen: ")",
  number: /[1-9][0-9]*/,
  identifier: /[_A-Z][0-9a-zA-Z$_-]*/,
  functionName: /[^A-Z_\s0-9(][^\s)]*/
})
%}

@lexer lexer

Program -> _ Body _ {% ([,body,]) => ({type:"Program", body: body}) %}

__ -> %ws

_ -> %ws:?

GroupWithSeparator[X, Y] -> $X $Y {% ([term, separator]) => term[0][0] %}
Group[X, Y] -> GroupWithSeparator[$X, $Y]:* $X {% (terms) => ({type: "group", elements: terms[0].concat(terms[1])})%}

Body -> Group[Form, __] {% ([group])=> ({type: "Body", forms: group.elements}) %}

Form -> %lparen _ Group[Term, __]  _ %rparen {% ([,,group,,]) => ({type: "form", children: group.elements})%}

UncleanTerm -> %number | %identifier | %functionName | Form
Term -> UncleanTerm {% ([term]) => term[0] %} # If I write the postprocessor directly in the rule above it only applies to

