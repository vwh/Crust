# Crust scripting language

Crust Simple toy scripting language, JavaScript-like programming language.

## Features

### Currently Implemented

- Variables and Constants (`set` and `keep`)
- Functions and closures with lexical scoping
- Control Flow (`if`, `elif`, `else`, `while`)
- Break and Continue statements
- Basic Data Types
  - Numbers
  - Strings
  - Booleans
  - Null
  - Objects
- Operators
  - Arithmetic (`+`, `-`, `*`, `/`, `%`, `**`, `//`)
  - Comparison (`==`, `!=`, `<`, `>`, `<=`, `>=`)
  - Logical (`&&`, `!!`)
  - Unary (`!`, `-`, `+`)
- Native Functions Support

### Code Examples

```crust
# Variables
set x = 10
keep PI = Math.PI

# Functions
fn add(x, y) {
  return x + y
}

# Objects
set person = {
  name: "John",
  age: 30
}

# Control flow
if x > 5 {
  output("x is greater than 5")
} elif x < 5 {
  output("x is less than 5")
} else {
  output("x is equal to 5")
}

# While loops
while x > 0 {
  x = x - 1
  if x == 5 {
    continue
  }
  output(x)
}
```

## TODO List

- [x] Comments
- [ ] Float numbers
- [ ] Arrays with proper array methods
- [ ] String methods and operations
- [ ] For loops
- [ ] Bitwise operators
- [ ] Error handling and stack traces
- [ ] Module/import system
- [ ] Implement standard library
- [ ] Template strings
- [ ] Add async/await support
- [ ] JavaScript block
- [ ] Optimization
- [ ] Documentation and Web Playground
- [ ] VSCode extension for syntax highlighting
