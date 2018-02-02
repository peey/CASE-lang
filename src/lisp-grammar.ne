@{%
const moo = require("moo")
const lexer = moo.compile({
  ws: {match: /[\s]+/, lineBreaks: true},
  lparen: "(",
  rparen: ")",
  number: /[1-9][0-9]*/,
  identifier: /[_A-Z][0-9a-zA-Z$_-]*/,
  functionName: {match:/[^A-Z_\s0-9(][^\s)]*/, keywords: {"kw_loop": "loop", "kw_defun": "defun"}}
})
%}

@lexer lexer

Program -> _ Body _ {% ([,body,]) => ({type:"Program", body: body}) %}

__ -> %ws

_ -> %ws:?

GroupWithSeparator[X, Y] -> $X $Y {% ([term, separator]) => term[0][0] %}
Group[X, Y] -> GroupWithSeparator[$X, $Y]:* $X {% (terms) => ({type: "group", elements: terms[0].concat(terms[1])})%}

# the following has at least one form, because groups have at least one form
Body -> Group[TopLevelForm, __] {% ([group])=> ({type: "Body", forms: group.elements}) %}

# Inner levels just prevent defuns within defuns, semantics of which will get tricky with my naive implementation of things
InnerBody -> Group[InnerLevelForm, __] {% ([group])=> ({type: "Body", forms: group.elements}) %}

InnerLevelForm -> (FunctionCall | Loop) {% ([match]) => match[0] %}

TopLevelForm ->  (InnerLevelForm | Defun) {% ([match]) => match[0] %}

FunctionCall -> %lparen _ %functionName __ Group[Term, __]:? _ %rparen {% ([,,fn,, group,,]) => ({type: "form", children: [fn].concat(group? group.elements : [])}) %}

Loop -> %lparen _ %kw_loop __ %number __ InnerBody _ %rparen {% ([,,kw,,n,,body,]) => ({type: "loop", n, body, begin: kw}) %}

Form -> %lparen _ Group[Term, __]:?  _ %rparen {% ([,,group,,]) => ({type: "form", children: group.elements}) %}

Term -> (%number | %identifier | %functionName | Form) {% ([[term]]) => term %}

Defun -> %lparen _ %kw_defun __ %functionName _ %lparen _ Group[%identifier, __]  _ %rparen __ InnerBody  %rparen {% ([/*lparen*/,/*_*/,kw,/*_*/,name,/*_*/,/*lparen*/,/*_*/, params,/*_*/,/*rparen*/,/*_*/, body, /*rparen*/]) => ({type: "defun", name, begin: kw, params: params.elements, body}) %}
