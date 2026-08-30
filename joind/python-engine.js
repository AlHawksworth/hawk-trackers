// ═══════════════════════════════════════════
// Joind — Python Code Validator
// ═══════════════════════════════════════════

const PythonEngine = (function () {

  function normalize(code) {
    return code.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  function hasTokens(code, tokens) {
    const c = normalize(code);
    return tokens.every(t => c.includes(t.toLowerCase()));
  }

  const validators = {
    'py-assign-greeting': function (code) {
      const c = code.trim();
      if (!c.includes('greeting')) {
        return { correct: false, message: 'Name your variable "greeting".' };
      }
      if (!c.includes('=')) {
        return { correct: false, message: 'Use = to assign a value.' };
      }
      if (!c.includes('"Hello, World!"') && !c.includes("'Hello, World!'")) {
        return { correct: false, message: 'Assign the exact string "Hello, World!" (with comma and space).' };
      }
      return { correct: true, message: 'Correct! You created a string variable.' };
    },

    'py-fstring-age': function (code) {
      const c = code.trim();
      if (!c.includes('age') || !c.includes('25')) {
        return { correct: false, message: 'Set age = 25 first.' };
      }
      if (!c.includes('msg')) {
        return { correct: false, message: 'Store the result in a variable called msg.' };
      }
      if (!c.includes('f"') && !c.includes("f'")) {
        return { correct: false, message: 'Use an f-string (start with f before the quote).' };
      }
      if (!c.includes('{age}')) {
        return { correct: false, message: 'Use {age} inside the f-string to insert the variable.' };
      }
      return { correct: true, message: 'Correct! f-strings make string formatting easy.' };
    },

    'py-create-list': function (code) {
      const c = code.trim();
      if (!c.includes('numbers')) {
        return { correct: false, message: 'Name your list "numbers".' };
      }
      if (!c.includes('[') || !c.includes(']')) {
        return { correct: false, message: 'Use square brackets to create a list.' };
      }
      if (!c.includes('1') || !c.includes('2') || !c.includes('3') || !c.includes('4') || !c.includes('5')) {
        return { correct: false, message: 'Include all numbers 1 through 5.' };
      }
      return { correct: true, message: 'Correct! You created a list of numbers.' };
    },

    'py-if-even-odd': function (code) {
      const c = code.trim();
      if (!c.includes('num') || !c.includes('4')) {
        return { correct: false, message: 'Set num = 4 first.' };
      }
      if (!c.includes('if')) {
        return { correct: false, message: 'Use an if statement.' };
      }
      if (!c.includes('%') || !c.includes('2') || !c.includes('== 0')) {
        return { correct: false, message: 'Use num % 2 == 0 to check for even.' };
      }
      if (!c.includes('print')) {
        return { correct: false, message: 'Use print() to output the result.' };
      }
      if (!c.includes('"even"') && !c.includes("'even'")) {
        return { correct: false, message: 'Print "even" when the number is even.' };
      }
      if (!c.includes('else')) {
        return { correct: false, message: 'Use else for the odd case.' };
      }
      return { correct: true, message: 'Correct! You wrote a conditional check for even/odd.' };
    },

    'py-for-range': function (code) {
      const c = code.trim();
      if (!c.includes('for')) {
        return { correct: false, message: 'Use a for loop.' };
      }
      if (!c.includes('range')) {
        return { correct: false, message: 'Use range() to generate numbers.' };
      }
      if (!c.includes('print')) {
        return { correct: false, message: 'Use print() to display each number.' };
      }
      if (!c.includes('1') || !c.includes('6')) {
        if (!c.includes('1, 6') && !c.includes('1,6')) {
          return { correct: false, message: 'Use range(1, 6) to get numbers 1 through 5.' };
        }
      }
      return { correct: true, message: 'Correct! range(1, 6) produces 1, 2, 3, 4, 5.' };
    },

    'py-def-double': function (code) {
      const c = code.trim();
      if (!c.includes('def')) {
        return { correct: false, message: 'Use def to define a function.' };
      }
      if (!c.includes('double')) {
        return { correct: false, message: 'Name the function "double".' };
      }
      if (!c.includes('return')) {
        return { correct: false, message: 'Use return to send back the result.' };
      }
      if (!c.includes('* 2') && !c.includes('*2') && !c.includes('+ n') && !c.includes('+n')) {
        if (!c.includes('* 2') && !c.includes('*2')) {
          return { correct: false, message: 'Multiply the parameter by 2.' };
        }
      }
      return { correct: true, message: 'Correct! Your function doubles a number.' };
    },

    'py-create-dict': function (code) {
      const c = code.trim();
      if (!c.includes('car')) {
        return { correct: false, message: 'Name your dictionary "car".' };
      }
      if (!c.includes('{') || !c.includes('}')) {
        return { correct: false, message: 'Use curly braces to create a dictionary.' };
      }
      if ((!c.includes('"brand"') && !c.includes("'brand'")) || (!c.includes('"Toyota"') && !c.includes("'Toyota'"))) {
        return { correct: false, message: 'Include "brand": "Toyota" in your dictionary.' };
      }
      if ((!c.includes('"year"') && !c.includes("'year'")) || !c.includes('2022')) {
        return { correct: false, message: 'Include "year": 2022 in your dictionary.' };
      }
      return { correct: true, message: 'Correct! You created a dictionary with key-value pairs.' };
    },

    'py-while-123': function (code) {
      const c = code.trim();
      if (!c.includes('while')) {
        return { correct: false, message: 'Use a while loop.' };
      }
      if (!c.includes('print')) {
        return { correct: false, message: 'Use print() to display numbers.' };
      }
      if (!c.includes('<=') && !c.includes('< 4') && !c.includes('<4')) {
        if (!c.includes('<= 3') && !c.includes('<=3') && !c.includes('< 4') && !c.includes('<4')) {
          return { correct: false, message: 'Loop while the counter is <= 3 (or < 4).' };
        }
      }
      return { correct: true, message: 'Correct! Your while loop prints 1, 2, 3.' };
    },

    'py-comprehension-evens': function (code) {
      const c = code.trim();
      if (!c.includes('[') || !c.includes(']')) {
        return { correct: false, message: 'Use square brackets for a list comprehension.' };
      }
      if (!c.includes('for')) {
        return { correct: false, message: 'Include a for clause in your comprehension.' };
      }
      if (!c.includes('range')) {
        return { correct: false, message: 'Use range() to generate numbers.' };
      }
      if (!c.includes('if') || !c.includes('% 2') || !c.includes('== 0')) {
        return { correct: false, message: 'Add an if condition to filter even numbers (x % 2 == 0).' };
      }
      return { correct: true, message: 'Correct! Your list comprehension filters even numbers.' };
    },

    'py-string-upper': function (code) {
      const c = code.trim();
      if (!c.includes('text') || (!c.includes('"hello world"') && !c.includes("'hello world'"))) {
        return { correct: false, message: 'Start with text = "hello world".' };
      }
      if (!c.includes('result')) {
        return { correct: false, message: 'Store the result in a variable called result.' };
      }
      if (!c.includes('.upper()')) {
        return { correct: false, message: 'Use the .upper() method.' };
      }
      return { correct: true, message: 'Correct! .upper() converts a string to uppercase.' };
    },

    'py-try-except': function (code) {
      const c = code.trim();
      if (!c.includes('try')) {
        return { correct: false, message: 'Start with a try: block.' };
      }
      if (!c.includes('except')) {
        return { correct: false, message: 'Add an except block to catch the error.' };
      }
      if (!c.includes('int') || (!c.includes('"hello"') && !c.includes("'hello'"))) {
        return { correct: false, message: 'Try to convert "hello" to int inside the try block.' };
      }
      if (!c.includes('print') || (!c.includes('"Invalid"') && !c.includes("'Invalid'"))) {
        return { correct: false, message: 'Print "Invalid" in the except block.' };
      }
      return { correct: true, message: 'Correct! try/except handles errors gracefully.' };
    },

    'py-import-math': function (code) {
      const c = code.trim();
      if (!c.includes('import math')) {
        return { correct: false, message: 'Use "import math" to import the module.' };
      }
      if (!c.includes('print')) {
        return { correct: false, message: 'Use print() to display the value.' };
      }
      if (!c.includes('math.pi')) {
        return { correct: false, message: 'Access pi with math.pi.' };
      }
      return { correct: true, message: 'Correct! math.pi gives you 3.14159...' };
    }
  };

  function validate(validatorId, code) {
    const fn = validators[validatorId];
    if (!fn) return { correct: false, message: 'Unknown validator.', result: null };
    try {
      return fn(code);
    } catch (e) {
      return { correct: false, message: 'Error evaluating code. Check your syntax.', result: null };
    }
  }

  return { validate, normalize };
})();
