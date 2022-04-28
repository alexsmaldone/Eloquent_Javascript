/*
We define a function parseExpression, which takes a string as input and
returns an object containing the data structure for the expression at the start of
the string, along with the part of the string left after parsing this expression.

When parsing subexpressions (the argument to an application, for example),
this function can be called again, yielding the argument expression as well as
the text that remains. This text may in turn contain more arguments or may be
the closing parenthesis that ends the list of arguments.
*/

function parseExpression(program) {
  program = skipSpace(program);
  let match, expr;
  if ((match = /^"([^"]*)"/.exec(program))) {
    expr = { type: "value", value: match[1] };
  } else if ((match = /^\d+\b/.exec(program))) {
    expr = { type: "value", value: Number(match[0]) };
  } else if ((match = /^[^\s(),#"]+/.exec(program))) {
    expr = { type: "word", name: match[0] };
  } else {
    throw new SyntaxError("Unexpected syntax: " + program);
  }

  return parseApply(expr, program.slice(match[0].length));
}

function skipSpace(string) {
  let first = string.search(/\S/);
  if (first == -1) return "";
  return string.slice(first);
}
