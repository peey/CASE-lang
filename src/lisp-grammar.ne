@builtin "number.ne"
@builtin "whitespace.ne"

Program -> _ FormWithSpace:* Form _

FormWithSpace -> Form __

Form -> "(" TermWithSpace:* Term ")"

TermWithSpace -> Term __
Term -> unsigned_int | Identifier | FunctionName | Form

IdentifierBegin -> "_" | [A-Z]
Identifier -> IdentifierBegin [0-9a-zA-Z$_-]:*

FunctionNameBegin -> [^A-Z_\s0-9]
FunctionName -> FunctionNameBegin [^\s]:*
