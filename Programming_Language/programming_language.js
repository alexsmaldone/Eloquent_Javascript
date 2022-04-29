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

/*
If the next character in the program is not an opening parenthesis, this is not
an application, and parseApply returns the expression it was given.

Otherwise, it skips the opening parenthesis and creates the syntax tree object
for this application expression. It then recursively calls parseExpression to
parse each argument until a closing parenthesis is found. The recursion is
indirect, through parseApply and parseExpression calling each other.
*/

function parseApply(expr, program) {
  program = skipSpace(program);
  if (program[0] != "(") {
    return { expr: expr, rest: program };
  }

  program = skipSpace(program.slice(1));
  expr = { type: "apply", operator: expr, args: [] };
  while (program[0] != ")") {
    let arg = parseExpression(program);
    expr.args.push(arg.expr);
    program = skipSpace(arg.rest);
    if (program[0] == ",") {
      program = skipSpace(program.slice(1));
    } else if (program[0] != ")") {
      throw new SyntaxError("Expected ',' or ')'");
    }
  }
  return parseApply(expr, program.slice(1));
}

/*
This is all we need to parse Egg. We wrap it in a convenient parse function
that verifies that it has reached the end of the input string after parsing the
expression (an Egg program is a single expression), and that gives us the
program’s data structure.
*/

function parse(program) {
  let { expr, rest } = parseExpression(program);
  if (skipSpace(rest).length > 0) {
    throw new SyntaxError("Unexpected text after program");
  }
  return expr;
}

// console.log(parse("+(a, 10)"));

/*
What can we do with the syntax tree for a program? Run it, of course! And that is what the evaluator does.
You give it a syntax tree and a scope object that associates names with values,
and it will evaluate the expression that the tree represents and return the value that this produces.
*/

const specialForms = Object.create(null);

function evaluate(expr, scope) {
  if (expr.type == "value") {
    return expr.value;
  } else if (expr.type == "word") {
    if (expr.name in scope) {
      return scope[expr.name];
    } else {
      throw new ReferenceError(`Undefined bindind: ${expr.name}`);
    }
  } else if (expr.type == "apply") {
    let { operator, args } = expr;
    if (operator.type == "word" && operator.name in specialForms) {
      return specialForms[operator.name](expr.args, scope);
    } else {
      let op = evaluate(operator, scope);
      if (typeof op == "function") {
        return op(...args.map((arg) => evaluate(arg, scope)));
      } else {
        throw new TypeError("Applying a non-function.");
      }
    }
  }
}

/*
The specialForms object is used to define special syntax in Egg.
It associates words with functions that evaluate such forms. It is currently empty. Let’s add if.
*/
