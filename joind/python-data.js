// ═══════════════════════════════════════════
// Joind — Python Lesson Data
// ═══════════════════════════════════════════

const PYTHON_LESSONS = [
  // ── Module 1: Variables & Types ──
  {
    id: 'py-variables',
    title: 'Variables & Types',
    description: 'Store and use data in Python',
    icon: '📦',
    xp: 30,
    track: 'python',
    steps: [
      {
        type: 'info',
        instruction: 'In Python, you create a variable by assigning a value with =. No need to declare a type — Python figures it out.',
        code: 'name = "Alice"\nage = 25\nheight = 1.72\nis_student = True',
        hint: 'Python has strings (str), integers (int), floats (float), and booleans (bool).'
      },
      {
        type: 'multiple-choice',
        instruction: 'What type is the value 3.14?',
        choices: ['int', 'float', 'str', 'bool'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the code to store the number 42 in a variable:',
        template: 'answer = _____',
        answer: '42',
        caseSensitive: false
      },
      {
        type: 'multiple-choice',
        instruction: 'Which of these is a valid variable name in Python?',
        choices: ['2fast', 'my-var', 'my_var', 'class'],
        correct: 2
      },
      {
        type: 'write-query',
        instruction: 'Write a line of code that creates a variable called greeting and assigns it the string "Hello, World!"',
        hint: 'Use quotes around the string value',
        validate: 'py-assign-greeting'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does type(42) return?',
        choices: ["<class 'int'>", "<class 'str'>", "<class 'float'>", "<class 'number'>"],
        correct: 0
      }
    ]
  },

  // ── Module 2: Strings ──
  {
    id: 'py-strings',
    title: 'Strings',
    description: 'Work with text in Python',
    icon: '🔤',
    xp: 35,
    track: 'python',
    steps: [
      {
        type: 'info',
        instruction: 'Strings are sequences of characters. You can use single or double quotes. f-strings let you embed expressions inside strings.',
        code: 'name = "Alice"\ngreeting = f"Hello, {name}!"\nprint(greeting)  # Hello, Alice!\nprint(len(name))  # 5',
        hint: 'f-strings start with f before the quote. Use {expression} inside them.'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does "hello".upper() return?',
        choices: ['"Hello"', '"HELLO"', '"hello"', 'Error'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the f-string to include the variable name:',
        template: 'name = "Bob"\nmessage = f"Hi, _____!"',
        answer: '{name}',
        caseSensitive: true
      },
      {
        type: 'write-query',
        instruction: 'Write code that uses an f-string to create a variable called msg with the value "I am 25 years old" using a variable age = 25.',
        hint: 'First set age = 25, then use an f-string with {age}',
        validate: 'py-fstring-age'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does "python"[0:3] return?',
        choices: ['"pyt"', '"pyth"', '"ytho"', '"py"'],
        correct: 0
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the code to get the length of a string:',
        template: 'word = "hello"\nsize = _____(word)',
        answer: 'len',
        caseSensitive: true
      }
    ]
  },

  // ── Module 3: Lists ──
  {
    id: 'py-lists',
    title: 'Lists',
    description: 'Store collections of items',
    icon: '📋',
    xp: 35,
    track: 'python',
    steps: [
      {
        type: 'info',
        instruction: 'Lists are ordered, mutable collections. Use square brackets to create them. Items are accessed by index (starting at 0).',
        code: 'fruits = ["apple", "banana", "cherry"]\nprint(fruits[0])   # apple\nfruits.append("date")\nprint(len(fruits)) # 4',
        hint: 'Lists can hold any type of data, even mixed types.'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does [1, 2, 3][1] return?',
        choices: ['1', '2', '3', 'Error'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the code to add "grape" to the list:',
        template: 'fruits = ["apple", "banana"]\nfruits._____("grape")',
        answer: 'append',
        caseSensitive: true
      },
      {
        type: 'write-query',
        instruction: 'Write code that creates a list called numbers containing 1, 2, 3, 4, 5.',
        hint: 'Use square brackets with comma-separated values',
        validate: 'py-create-list'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does len([10, 20, 30]) return?',
        choices: ['2', '3', '30', '60'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the code to get the last item of a list:',
        template: 'items = [10, 20, 30]\nlast = items[_____]',
        answer: '-1',
        caseSensitive: true
      }
    ]
  },

  // ── Module 4: If Statements ──
  {
    id: 'py-conditionals',
    title: 'If Statements',
    description: 'Make decisions in your code',
    icon: '🔀',
    xp: 35,
    track: 'python',
    steps: [
      {
        type: 'info',
        instruction: 'Use if, elif, and else to run code based on conditions. Python uses indentation (4 spaces) to define blocks.',
        code: 'age = 18\n\nif age >= 18:\n    print("Adult")\nelif age >= 13:\n    print("Teenager")\nelse:\n    print("Child")',
        hint: 'The condition after if must be True for that block to run. elif is short for "else if".'
      },
      {
        type: 'multiple-choice',
        instruction: 'What keyword is used for "else if" in Python?',
        choices: ['else if', 'elseif', 'elif', 'elsif'],
        correct: 2
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the condition to check if x is greater than 10:',
        template: 'x = 15\nif x _____ 10:\n    print("big")',
        answer: '>',
        caseSensitive: false
      },
      {
        type: 'write-query',
        instruction: 'Write an if statement that prints "even" if a variable num (set to 4) is even, otherwise prints "odd".',
        hint: 'Use num % 2 == 0 to check if a number is even',
        validate: 'py-if-even-odd'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does Python use to define code blocks?',
        choices: ['Curly braces {}', 'Parentheses ()', 'Indentation', 'Keywords begin/end'],
        correct: 2
      }
    ]
  },

  // ── Module 5: For Loops ──
  {
    id: 'py-for-loops',
    title: 'For Loops',
    description: 'Repeat actions over sequences',
    icon: '🔁',
    xp: 40,
    track: 'python',
    steps: [
      {
        type: 'info',
        instruction: 'For loops iterate over sequences (lists, strings, ranges). Use range(n) to loop n times.',
        code: 'for i in range(5):\n    print(i)  # 0, 1, 2, 3, 4\n\nfruits = ["apple", "banana"]\nfor fruit in fruits:\n    print(fruit)',
        hint: 'range(5) gives you 0, 1, 2, 3, 4. range(1, 6) gives 1, 2, 3, 4, 5.'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does range(3) produce?',
        choices: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '1, 2'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the loop to iterate over a list:',
        template: 'names = ["Alice", "Bob"]\n_____ name in names:\n    print(name)',
        answer: 'for',
        caseSensitive: true
      },
      {
        type: 'write-query',
        instruction: 'Write a for loop that prints the numbers 1 to 5 (inclusive) using range().',
        hint: 'Use range(1, 6) to get numbers 1 through 5',
        validate: 'py-for-range'
      },
      {
        type: 'multiple-choice',
        instruction: 'How do you loop over both index and value of a list?',
        choices: ['for i, v in list:', 'for i, v in enumerate(list):', 'for i in index(list):', 'for i, v in range(list):'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the code to sum all numbers in a list:',
        template: 'nums = [1, 2, 3, 4]\ntotal = 0\nfor n in nums:\n    total _____ n',
        answer: '+=',
        caseSensitive: true
      }
    ]
  },

  // ── Module 6: Functions ──
  {
    id: 'py-functions',
    title: 'Functions',
    description: 'Define reusable blocks of code',
    icon: '⚙️',
    xp: 45,
    track: 'python',
    steps: [
      {
        type: 'info',
        instruction: 'Functions are defined with def. They can take parameters and return values.',
        code: 'def greet(name):\n    return f"Hello, {name}!"\n\nmessage = greet("Alice")\nprint(message)  # Hello, Alice!',
        hint: 'Use return to send a value back. Without return, a function returns None.'
      },
      {
        type: 'multiple-choice',
        instruction: 'Which keyword defines a function in Python?',
        choices: ['function', 'func', 'def', 'define'],
        correct: 2
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the function definition:',
        template: '_____ add(a, b):\n    return a + b',
        answer: 'def',
        caseSensitive: true
      },
      {
        type: 'write-query',
        instruction: 'Write a function called double that takes a number n and returns n * 2.',
        hint: 'Use def double(n): and return n * 2',
        validate: 'py-def-double'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does a function return if there is no return statement?',
        choices: ['0', '""', 'None', 'Error'],
        correct: 2
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the function to return the square of a number:',
        template: 'def square(x):\n    _____ x ** 2',
        answer: 'return',
        caseSensitive: true
      }
    ]
  },

  // ── Module 7: Dictionaries ──
  {
    id: 'py-dicts',
    title: 'Dictionaries',
    description: 'Key-value data storage',
    icon: '📖',
    xp: 40,
    track: 'python',
    steps: [
      {
        type: 'info',
        instruction: 'Dictionaries store key-value pairs. Keys must be unique. Access values using their key.',
        code: 'person = {\n    "name": "Alice",\n    "age": 25,\n    "city": "London"\n}\nprint(person["name"])  # Alice\nperson["email"] = "alice@example.com"',
        hint: 'Use curly braces {} to create a dict. Access values with dict[key].'
      },
      {
        type: 'multiple-choice',
        instruction: 'How do you access the value for key "name" in a dictionary d?',
        choices: ['d.name', 'd["name"]', 'd(name)', 'd->name'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the code to add a new key-value pair:',
        template: 'scores = {"maths": 90}\nscores[_____] = 85',
        answer: '"english"',
        caseSensitive: false
      },
      {
        type: 'write-query',
        instruction: 'Write code that creates a dictionary called car with keys "brand" (value "Toyota") and "year" (value 2022).',
        hint: 'Use curly braces with "key": value pairs',
        validate: 'py-create-dict'
      },
      {
        type: 'multiple-choice',
        instruction: 'What method returns all the keys of a dictionary?',
        choices: ['.items()', '.keys()', '.values()', '.all()'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the code to safely get a value with a default:',
        template: 'data = {"x": 10}\nval = data._____(\"y\", 0)',
        answer: 'get',
        caseSensitive: true
      }
    ]
  },

  // ── Module 8: While Loops ──
  {
    id: 'py-while-loops',
    title: 'While Loops',
    description: 'Loop until a condition is false',
    icon: '🔄',
    xp: 35,
    track: 'python',
    steps: [
      {
        type: 'info',
        instruction: 'A while loop repeats as long as its condition is True. Be careful to avoid infinite loops!',
        code: 'count = 0\nwhile count < 5:\n    print(count)\n    count += 1\n# Prints 0, 1, 2, 3, 4',
        hint: 'Always make sure the condition will eventually become False, or use break to exit.'
      },
      {
        type: 'multiple-choice',
        instruction: 'When does a while loop stop?',
        choices: ['After 10 iterations', 'When the condition becomes False', 'When it hits a return', 'Never'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the loop to count down from 5:',
        template: 'n = 5\n_____ n > 0:\n    print(n)\n    n -= 1',
        answer: 'while',
        caseSensitive: true
      },
      {
        type: 'write-query',
        instruction: 'Write a while loop that prints numbers from 1 to 3.',
        hint: 'Start with i = 1, loop while i <= 3, print i, then increment',
        validate: 'py-while-123'
      },
      {
        type: 'multiple-choice',
        instruction: 'What keyword immediately exits a loop?',
        choices: ['stop', 'exit', 'break', 'end'],
        correct: 2
      }
    ]
  },

  // ── Module 9: List Comprehensions ──
  {
    id: 'py-comprehensions',
    title: 'List Comprehensions',
    description: 'Create lists in one line',
    icon: '✨',
    xp: 45,
    track: 'python',
    steps: [
      {
        type: 'info',
        instruction: 'List comprehensions are a concise way to create lists. They combine a for loop and an optional condition into one line.',
        code: 'squares = [x**2 for x in range(5)]\n# [0, 1, 4, 9, 16]\n\nevens = [x for x in range(10) if x % 2 == 0]\n# [0, 2, 4, 6, 8]',
        hint: 'Syntax: [expression for item in iterable if condition]'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does [x*2 for x in [1,2,3]] produce?',
        choices: ['[1, 2, 3]', '[2, 4, 6]', '[1, 4, 9]', '[3, 6, 9]'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the list comprehension to get squares of 1-4:',
        template: 'squares = [x**2 _____ x in range(1, 5)]',
        answer: 'for',
        caseSensitive: true
      },
      {
        type: 'write-query',
        instruction: 'Write a list comprehension that creates a list of even numbers from 0 to 9.',
        hint: 'Use [x for x in range(10) if x % 2 == 0]',
        validate: 'py-comprehension-evens'
      },
      {
        type: 'multiple-choice',
        instruction: 'Where does the if condition go in a list comprehension?',
        choices: ['Before the for', 'After the for', 'Before the expression', 'It cannot have a condition'],
        correct: 1
      }
    ]
  },

  // ── Module 10: String Methods ──
  {
    id: 'py-string-methods',
    title: 'String Methods',
    description: 'Manipulate text like a pro',
    icon: '🔧',
    xp: 35,
    track: 'python',
    steps: [
      {
        type: 'info',
        instruction: 'Strings have many built-in methods for manipulation. They return new strings (strings are immutable).',
        code: 'text = "Hello, World!"\nprint(text.lower())      # hello, world!\nprint(text.split(", "))  # ["Hello", "World!"]\nprint(text.replace("World", "Python"))\n# Hello, Python!',
        hint: 'Common methods: .upper(), .lower(), .strip(), .split(), .replace(), .startswith(), .endswith()'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does " hello ".strip() return?',
        choices: ['" hello"', '"hello "', '"hello"', '" hello "'],
        correct: 2
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the code to split a sentence into words:',
        template: 'sentence = "one two three"\nwords = sentence._____(" ")',
        answer: 'split',
        caseSensitive: true
      },
      {
        type: 'write-query',
        instruction: 'Write code that takes text = "hello world" and creates a variable result containing the uppercase version.',
        hint: 'Use the .upper() method',
        validate: 'py-string-upper'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does "abc".replace("b", "x") return?',
        choices: ['"abc"', '"axc"', '"xbc"', '"abx"'],
        correct: 1
      }
    ]
  },

  // ── Module 11: Error Handling ──
  {
    id: 'py-exceptions',
    title: 'Try & Except',
    description: 'Handle errors gracefully',
    icon: '🛡️',
    xp: 40,
    track: 'python',
    steps: [
      {
        type: 'info',
        instruction: 'Use try/except to catch and handle errors instead of crashing your program.',
        code: 'try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero!")\nfinally:\n    print("This always runs")',
        hint: 'try contains risky code. except catches specific errors. finally always runs.'
      },
      {
        type: 'multiple-choice',
        instruction: 'What error occurs when you divide by zero?',
        choices: ['ValueError', 'TypeError', 'ZeroDivisionError', 'MathError'],
        correct: 2
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the error handling:',
        template: 'try:\n    num = int("abc")\n_____ ValueError:\n    print("Not a number!")',
        answer: 'except',
        caseSensitive: true
      },
      {
        type: 'write-query',
        instruction: 'Write a try/except block that tries to convert "hello" to an int and prints "Invalid" if it fails.',
        hint: 'Use try: int("hello") except ValueError: print("Invalid")',
        validate: 'py-try-except'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does the finally block do?',
        choices: ['Runs only if there is an error', 'Runs only if there is no error', 'Always runs regardless of errors', 'Stops the program'],
        correct: 2
      }
    ]
  },

  // ── Module 12: Imports & Modules ──
  {
    id: 'py-imports',
    title: 'Imports & Modules',
    description: 'Use Python libraries',
    icon: '📚',
    xp: 35,
    track: 'python',
    steps: [
      {
        type: 'info',
        instruction: 'Python has a rich standard library. Use import to bring in modules. You can import specific items or rename them.',
        code: 'import math\nprint(math.sqrt(16))  # 4.0\n\nfrom random import randint\nprint(randint(1, 10))\n\nimport datetime as dt\nnow = dt.datetime.now()',
        hint: 'import module — imports the whole module. from module import item — imports just one thing.'
      },
      {
        type: 'multiple-choice',
        instruction: 'Which imports only the sqrt function from math?',
        choices: ['import math.sqrt', 'from math import sqrt', 'import sqrt from math', 'using math.sqrt'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the import to use randint:',
        template: '_____ random import randint\nprint(randint(1, 6))',
        answer: 'from',
        caseSensitive: true
      },
      {
        type: 'write-query',
        instruction: 'Write code that imports the math module and prints the value of pi (math.pi).',
        hint: 'Use import math then print(math.pi)',
        validate: 'py-import-math'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does "import numpy as np" do?',
        choices: ['Installs numpy', 'Imports numpy with alias np', 'Creates a new module called np', 'Renames numpy permanently'],
        correct: 1
      }
    ]
  }
];
