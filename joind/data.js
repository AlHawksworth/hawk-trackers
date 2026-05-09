// ═══════════════════════════════════════════
// SQL Mimo — Lesson Data & Virtual Database
// ═══════════════════════════════════════════

const SQL_DB = {
  employees: [
    { id: 1, name: 'Alice Johnson', department: 'Engineering', salary: 85000, hire_date: '2020-03-15', city: 'London' },
    { id: 2, name: 'Bob Smith', department: 'Marketing', salary: 62000, hire_date: '2019-07-22', city: 'Manchester' },
    { id: 3, name: 'Charlie Brown', department: 'Engineering', salary: 92000, hire_date: '2018-01-10', city: 'London' },
    { id: 4, name: 'Diana Prince', department: 'Sales', salary: 71000, hire_date: '2021-05-03', city: 'Birmingham' },
    { id: 5, name: 'Eve Wilson', department: 'Engineering', salary: 78000, hire_date: '2022-09-18', city: 'London' },
    { id: 6, name: 'Frank Miller', department: 'Marketing', salary: 58000, hire_date: '2020-11-30', city: 'Leeds' },
    { id: 7, name: 'Grace Lee', department: 'Sales', salary: 67000, hire_date: '2019-04-12', city: 'Manchester' },
    { id: 8, name: 'Henry Davis', department: 'Engineering', salary: 95000, hire_date: '2017-08-25', city: 'Bristol' },
    { id: 9, name: 'Ivy Chen', department: 'HR', salary: 64000, hire_date: '2021-02-14', city: 'London' },
    { id: 10, name: 'Jack Taylor', department: 'Sales', salary: 73000, hire_date: '2020-06-08', city: 'Birmingham' }
  ],
  orders: [
    { id: 101, customer_id: 1, product: 'Laptop', amount: 1200, order_date: '2024-01-15' },
    { id: 102, customer_id: 2, product: 'Phone', amount: 800, order_date: '2024-01-18' },
    { id: 103, customer_id: 1, product: 'Tablet', amount: 500, order_date: '2024-02-01' },
    { id: 104, customer_id: 3, product: 'Laptop', amount: 1200, order_date: '2024-02-10' },
    { id: 105, customer_id: 4, product: 'Monitor', amount: 350, order_date: '2024-02-14' },
    { id: 106, customer_id: 2, product: 'Keyboard', amount: 75, order_date: '2024-03-01' },
    { id: 107, customer_id: 5, product: 'Phone', amount: 900, order_date: '2024-03-05' },
    { id: 108, customer_id: 3, product: 'Mouse', amount: 45, order_date: '2024-03-12' },
    { id: 109, customer_id: 1, product: 'Monitor', amount: 400, order_date: '2024-03-20' },
    { id: 110, customer_id: 6, product: 'Laptop', amount: 1500, order_date: '2024-04-01' }
  ],
  customers: [
    { id: 1, name: 'TechCorp', country: 'UK', tier: 'Gold' },
    { id: 2, name: 'DataFlow', country: 'UK', tier: 'Silver' },
    { id: 3, name: 'CloudBase', country: 'USA', tier: 'Gold' },
    { id: 4, name: 'NetWorks', country: 'Germany', tier: 'Bronze' },
    { id: 5, name: 'AppStack', country: 'USA', tier: 'Silver' },
    { id: 6, name: 'DevHub', country: 'UK', tier: 'Gold' }
  ],
  products: [
    { id: 1, name: 'Laptop', category: 'Electronics', price: 1200, stock: 45 },
    { id: 2, name: 'Phone', category: 'Electronics', price: 800, stock: 120 },
    { id: 3, name: 'Tablet', category: 'Electronics', price: 500, stock: 80 },
    { id: 4, name: 'Monitor', category: 'Peripherals', price: 350, stock: 60 },
    { id: 5, name: 'Keyboard', category: 'Peripherals', price: 75, stock: 200 },
    { id: 6, name: 'Mouse', category: 'Peripherals', price: 45, stock: 300 },
    { id: 7, name: 'Headphones', category: 'Audio', price: 150, stock: 90 },
    { id: 8, name: 'Webcam', category: 'Peripherals', price: 95, stock: 70 }
  ]
};

// ═══════════════════════════════════════════
// LESSONS
// ═══════════════════════════════════════════
const LESSONS = [
  // ── Module 1: SELECT Basics ──
  {
    id: 'select-basics',
    title: 'SELECT Basics',
    description: 'Learn to retrieve data from tables',
    icon: '📋',
    xp: 30,
    steps: [
      {
        type: 'info',
        instruction: 'The SELECT statement is the foundation of SQL. It retrieves data from a database table.',
        code: 'SELECT column1, column2\nFROM table_name;',
        hint: 'SELECT tells the database what columns you want. FROM tells it which table to look in.'
      },
      {
        type: 'multiple-choice',
        instruction: 'Which keyword retrieves data from a database?',
        choices: ['GET', 'SELECT', 'FETCH', 'RETRIEVE'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the query to get all employee names:',
        template: '_____ name FROM employees;',
        answer: 'SELECT',
        caseSensitive: false
      },
      {
        type: 'write-query',
        instruction: 'Write a query to select the name and salary columns from the employees table.',
        hint: 'Use SELECT followed by column names separated by commas, then FROM table_name',
        validate: 'select-name-salary',
        expectedColumns: ['name', 'salary']
      },
      {
        type: 'multiple-choice',
        instruction: 'What does SELECT * mean?',
        choices: ['Select the first column', 'Select all columns', 'Select all tables', 'Select nothing'],
        correct: 1
      },
      {
        type: 'write-query',
        instruction: 'Write a query to select ALL columns from the employees table.',
        hint: 'Use the * wildcard to select all columns',
        validate: 'select-all-employees',
        expectedColumns: ['id', 'name', 'department', 'salary', 'hire_date', 'city']
      }
    ]
  },

  // ── Module 2: WHERE Clause ──
  {
    id: 'where-clause',
    title: 'WHERE Clause',
    description: 'Filter rows with conditions',
    icon: '🔍',
    xp: 35,
    steps: [
      {
        type: 'info',
        instruction: 'The WHERE clause filters rows based on a condition. Only rows that match the condition are returned.',
        code: "SELECT name, salary\nFROM employees\nWHERE department = 'Engineering';",
        hint: 'WHERE comes after FROM and before ORDER BY. It uses comparison operators like =, >, <, >=, <=, !='
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the query to find employees in London:',
        template: "SELECT name FROM employees\n_____ city = 'London';",
        answer: 'WHERE',
        caseSensitive: false
      },
      {
        type: 'multiple-choice',
        instruction: 'Which operator checks if a value is NOT equal in SQL?',
        choices: ['!=', '<>', 'Both != and <>', 'NOT ='],
        correct: 2
      },
      {
        type: 'write-query',
        instruction: "Write a query to find all employees with a salary greater than 80000.",
        hint: 'Use WHERE salary > 80000',
        validate: 'where-salary-gt-80k',
        expectedColumns: ['id', 'name', 'department', 'salary', 'hire_date', 'city']
      },
      {
        type: 'write-query',
        instruction: "Write a query to find the names of employees in the 'Sales' department.",
        hint: "Use WHERE department = 'Sales' — remember string values need quotes",
        validate: 'where-sales-dept',
        expectedColumns: ['name']
      },
      {
        type: 'multiple-choice',
        instruction: "What does this query return?\nSELECT name FROM employees WHERE salary >= 90000;",
        choices: [
          'All employees',
          'Employees earning exactly 90000',
          'Employees earning 90000 or more',
          'Employees earning less than 90000'
        ],
        correct: 2
      }
    ]
  },

  // ── Module 3: ORDER BY ──
  {
    id: 'order-by',
    title: 'ORDER BY',
    description: 'Sort your query results',
    icon: '📊',
    xp: 30,
    steps: [
      {
        type: 'info',
        instruction: 'ORDER BY sorts the results. Use ASC for ascending (default) or DESC for descending.',
        code: 'SELECT name, salary\nFROM employees\nORDER BY salary DESC;',
        hint: 'ORDER BY always comes after WHERE (if present) and before LIMIT.'
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the query to sort employees by name alphabetically:',
        template: 'SELECT name FROM employees\n_____ BY name;',
        answer: 'ORDER',
        caseSensitive: false
      },
      {
        type: 'multiple-choice',
        instruction: 'Which keyword sorts results from highest to lowest?',
        choices: ['ASC', 'DESC', 'HIGH', 'REVERSE'],
        correct: 1
      },
      {
        type: 'write-query',
        instruction: 'Write a query to get all employee names and salaries, sorted by salary from highest to lowest.',
        hint: 'Use ORDER BY salary DESC',
        validate: 'order-salary-desc',
        expectedColumns: ['name', 'salary']
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the query to get the 3 highest-paid employees:',
        template: 'SELECT name, salary FROM employees\nORDER BY salary DESC\n_____ 3;',
        answer: 'LIMIT',
        caseSensitive: false
      }
    ]
  },

  // ── Module 4: AND, OR, IN ──
  {
    id: 'logical-operators',
    title: 'AND, OR & IN',
    description: 'Combine multiple conditions',
    icon: '🔗',
    xp: 35,
    steps: [
      {
        type: 'info',
        instruction: 'Combine conditions with AND (both must be true) and OR (either can be true). IN checks if a value matches any in a list.',
        code: "SELECT name FROM employees\nWHERE department = 'Engineering'\n  AND salary > 80000;\n\nSELECT name FROM employees\nWHERE city IN ('London', 'Manchester');",
        hint: 'AND narrows results, OR broadens them. IN is shorthand for multiple OR conditions.'
      },
      {
        type: 'multiple-choice',
        instruction: "Which query finds engineers in London?\n\nA) WHERE department = 'Engineering' OR city = 'London'\nB) WHERE department = 'Engineering' AND city = 'London'",
        choices: ['Query A', 'Query B', 'Both return the same results', 'Neither is correct'],
        correct: 1
      },
      {
        type: 'write-query',
        instruction: "Write a query to find employees who are in Engineering AND earn more than 80000. Select their name and salary.",
        hint: "Use WHERE department = 'Engineering' AND salary > 80000",
        validate: 'and-eng-salary',
        expectedColumns: ['name', 'salary']
      },
      {
        type: 'fill-blank',
        instruction: "Complete the query to find employees in London OR Manchester:",
        template: "SELECT name, city FROM employees\nWHERE city _____ ('London', 'Manchester');",
        answer: 'IN',
        caseSensitive: false
      },
      {
        type: 'write-query',
        instruction: "Write a query to find employees in the Sales OR Marketing department. Select name and department.",
        hint: "Use WHERE department IN ('Sales', 'Marketing') or use OR",
        validate: 'or-sales-marketing',
        expectedColumns: ['name', 'department']
      }
    ]
  },

  // ── Module 5: Aggregate Functions ──
  {
    id: 'aggregates',
    title: 'COUNT, SUM, AVG',
    description: 'Aggregate functions for calculations',
    icon: '🧮',
    xp: 40,
    steps: [
      {
        type: 'info',
        instruction: 'Aggregate functions perform calculations on sets of rows. COUNT counts rows, SUM adds values, AVG calculates the average, MIN/MAX find extremes.',
        code: 'SELECT COUNT(*) FROM employees;\nSELECT AVG(salary) FROM employees;\nSELECT MAX(salary) FROM employees;',
        hint: 'Aggregates collapse multiple rows into a single result.'
      },
      {
        type: 'multiple-choice',
        instruction: 'Which function counts the number of rows?',
        choices: ['SUM()', 'COUNT()', 'TOTAL()', 'NUM()'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the query to find the average salary:',
        template: 'SELECT _____(salary) FROM employees;',
        answer: 'AVG',
        caseSensitive: false
      },
      {
        type: 'write-query',
        instruction: 'Write a query to count the total number of employees.',
        hint: 'Use SELECT COUNT(*) FROM employees',
        validate: 'count-employees',
        expectedColumns: ['count']
      },
      {
        type: 'write-query',
        instruction: 'Write a query to find the highest salary in the employees table.',
        hint: 'Use SELECT MAX(salary) FROM employees',
        validate: 'max-salary',
        expectedColumns: ['max']
      },
      {
        type: 'multiple-choice',
        instruction: "What does SELECT SUM(amount) FROM orders return?",
        choices: ['The number of orders', 'The total of all order amounts', 'The average order amount', 'The largest order'],
        correct: 1
      }
    ]
  },

  // ── Module 6: GROUP BY ──
  {
    id: 'group-by',
    title: 'GROUP BY',
    description: 'Group rows and aggregate per group',
    icon: '📦',
    xp: 45,
    steps: [
      {
        type: 'info',
        instruction: 'GROUP BY groups rows that share a value, then you can aggregate each group separately.',
        code: "SELECT department, COUNT(*) as count\nFROM employees\nGROUP BY department;",
        hint: 'Every column in SELECT must either be in GROUP BY or inside an aggregate function.'
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the query to count employees per department:',
        template: "SELECT department, COUNT(*)\nFROM employees\n_____ BY department;",
        answer: 'GROUP',
        caseSensitive: false
      },
      {
        type: 'write-query',
        instruction: 'Write a query to find the average salary for each department.',
        hint: 'Use GROUP BY department with AVG(salary)',
        validate: 'avg-salary-by-dept',
        expectedColumns: ['department', 'avg_salary']
      },
      {
        type: 'multiple-choice',
        instruction: "What does HAVING do?",
        choices: [
          'Filters rows before grouping',
          'Filters groups after aggregation',
          'Sorts the groups',
          'Limits the number of groups'
        ],
        correct: 1
      },
      {
        type: 'write-query',
        instruction: 'Write a query to find departments with more than 2 employees. Show department and count.',
        hint: 'Use GROUP BY department HAVING COUNT(*) > 2',
        validate: 'having-count-gt-2',
        expectedColumns: ['department', 'count']
      }
    ]
  },

  // ── Module 7: JOINs ──
  {
    id: 'joins',
    title: 'JOIN Tables',
    description: 'Combine data from multiple tables',
    icon: '🔀',
    xp: 50,
    steps: [
      {
        type: 'info',
        instruction: 'JOIN combines rows from two tables based on a related column. INNER JOIN returns only matching rows.',
        code: "SELECT orders.id, customers.name, orders.amount\nFROM orders\nINNER JOIN customers\n  ON orders.customer_id = customers.id;",
        hint: 'The ON clause specifies which columns link the tables together.'
      },
      {
        type: 'multiple-choice',
        instruction: 'What does INNER JOIN return?',
        choices: [
          'All rows from both tables',
          'Only rows that have matches in both tables',
          'All rows from the left table',
          'All rows from the right table'
        ],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the JOIN condition:',
        template: "SELECT orders.product, customers.name\nFROM orders\nINNER JOIN customers\n  _____ orders.customer_id = customers.id;",
        answer: 'ON',
        caseSensitive: false
      },
      {
        type: 'write-query',
        instruction: 'Write a query to show each order with the customer name. Select customer name and order amount.',
        hint: 'JOIN orders with customers ON orders.customer_id = customers.id',
        validate: 'join-orders-customers',
        expectedColumns: ['name', 'amount']
      },
      {
        type: 'multiple-choice',
        instruction: 'LEFT JOIN returns:',
        choices: [
          'Only matching rows',
          'All rows from the left table, with NULLs where there is no match',
          'All rows from the right table',
          'All rows from both tables'
        ],
        correct: 1
      },
      {
        type: 'write-query',
        instruction: "Write a query to find the total order amount per customer. Show customer name and total amount.",
        hint: 'JOIN customers with orders, then GROUP BY customer name and SUM the amounts',
        validate: 'join-group-total',
        expectedColumns: ['name', 'total_amount']
      }
    ]
  },

  // ── Module 8: Subqueries ──
  {
    id: 'subqueries',
    title: 'Subqueries',
    description: 'Queries inside queries',
    icon: '🪆',
    xp: 50,
    steps: [
      {
        type: 'info',
        instruction: 'A subquery is a query nested inside another query. It can be used in WHERE, FROM, or SELECT clauses.',
        code: "SELECT name, salary\nFROM employees\nWHERE salary > (\n  SELECT AVG(salary) FROM employees\n);",
        hint: 'The inner query runs first, then its result is used by the outer query.'
      },
      {
        type: 'multiple-choice',
        instruction: 'Where can subqueries be used?',
        choices: ['Only in WHERE', 'Only in FROM', 'Only in SELECT', 'In WHERE, FROM, and SELECT'],
        correct: 3
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the subquery to find employees earning above average:',
        template: "SELECT name FROM employees\nWHERE salary > (\n  SELECT _____(salary) FROM employees\n);",
        answer: 'AVG',
        caseSensitive: false
      },
      {
        type: 'write-query',
        instruction: 'Write a query to find employees who earn more than the average salary. Show their name and salary.',
        hint: 'Use WHERE salary > (SELECT AVG(salary) FROM employees)',
        validate: 'subquery-above-avg',
        expectedColumns: ['name', 'salary']
      },
      {
        type: 'write-query',
        instruction: "Write a query to find customers who have placed orders. Use a subquery with IN.",
        hint: 'Use WHERE id IN (SELECT customer_id FROM orders)',
        validate: 'subquery-in-orders',
        expectedColumns: ['id', 'name', 'country', 'tier']
      }
    ]
  },

  // ── Module 9: LIKE & Wildcards ──
  {
    id: 'like-wildcards',
    title: 'LIKE & Wildcards',
    description: 'Pattern matching in queries',
    icon: '🎯',
    xp: 30,
    steps: [
      {
        type: 'info',
        instruction: 'LIKE performs pattern matching. % matches any sequence of characters, _ matches exactly one character.',
        code: "SELECT name FROM employees\nWHERE name LIKE 'A%';    -- starts with A\n\nSELECT name FROM employees\nWHERE name LIKE '%son';  -- ends with 'son'",
        hint: '% = any number of characters. _ = exactly one character.'
      },
      {
        type: 'multiple-choice',
        instruction: "What does LIKE '%son' match?",
        choices: ['Names starting with son', 'Names ending with son', 'Names containing son', 'Exactly the word son'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: "Complete the query to find names starting with 'E':",
        template: "SELECT name FROM employees\nWHERE name _____ 'E%';",
        answer: 'LIKE',
        caseSensitive: false
      },
      {
        type: 'write-query',
        instruction: "Write a query to find all employees whose name contains 'son'.",
        hint: "Use WHERE name LIKE '%son%'",
        validate: 'like-contains-son',
        expectedColumns: ['id', 'name', 'department', 'salary', 'hire_date', 'city']
      },
      {
        type: 'multiple-choice',
        instruction: "What does _ (underscore) match in LIKE?",
        choices: ['Any number of characters', 'Exactly one character', 'Zero or one character', 'A literal underscore'],
        correct: 1
      }
    ]
  },

  // ── Module 10: DISTINCT & Aliases ──
  {
    id: 'distinct-aliases',
    title: 'DISTINCT & Aliases',
    description: 'Remove duplicates and rename columns',
    icon: '🏷️',
    xp: 30,
    steps: [
      {
        type: 'info',
        instruction: 'DISTINCT removes duplicate rows. AS creates an alias (rename) for columns or tables.',
        code: "SELECT DISTINCT department FROM employees;\n\nSELECT name, salary * 12 AS annual_salary\nFROM employees;",
        hint: 'DISTINCT goes right after SELECT. AS gives a temporary name to a column or calculation.'
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the query to get unique cities:',
        template: 'SELECT _____ city FROM employees;',
        answer: 'DISTINCT',
        caseSensitive: false
      },
      {
        type: 'write-query',
        instruction: 'Write a query to get all unique departments from the employees table.',
        hint: 'Use SELECT DISTINCT department FROM employees',
        validate: 'distinct-departments',
        expectedColumns: ['department']
      },
      {
        type: 'multiple-choice',
        instruction: "What does AS do in SQL?",
        choices: ['Filters results', 'Creates a temporary name for a column', 'Joins tables', 'Sorts results'],
        correct: 1
      },
      {
        type: 'write-query',
        instruction: "Write a query to show each employee's name and their monthly salary (salary divided by 12), aliased as 'monthly_pay'.",
        hint: "Use SELECT name, salary / 12 AS monthly_pay FROM employees",
        validate: 'alias-monthly-pay',
        expectedColumns: ['name', 'monthly_pay']
      }
    ]
  },

  // ── Module 11: CASE Expressions ──
  {
    id: 'case-expressions',
    title: 'CASE Expressions',
    description: 'Conditional logic in queries',
    icon: '🔀',
    xp: 45,
    steps: [
      {
        type: 'info',
        instruction: 'CASE adds if/then logic to your queries. It returns different values based on conditions.',
        code: "SELECT name,\n  CASE\n    WHEN salary > 90000 THEN 'Senior'\n    WHEN salary > 70000 THEN 'Mid'\n    ELSE 'Junior'\n  END AS level\nFROM employees;",
        hint: 'CASE starts the expression, WHEN sets conditions, THEN gives the result, ELSE is the default, END closes it.'
      },
      {
        type: 'multiple-choice',
        instruction: 'Which keyword ends a CASE expression?',
        choices: ['DONE', 'END', 'CLOSE', 'FINISH'],
        correct: 1
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the CASE expression:',
        template: "SELECT name,\n  CASE\n    WHEN salary > 80000 _____ 'High'\n    ELSE 'Standard'\n  END AS band\nFROM employees;",
        answer: 'THEN',
        caseSensitive: false
      },
      {
        type: 'write-query',
        instruction: "Write a query that shows employee names and a 'salary_band' column: 'High' if salary > 80000, otherwise 'Standard'.",
        hint: "Use CASE WHEN salary > 80000 THEN 'High' ELSE 'Standard' END AS salary_band",
        validate: 'case-salary-band',
        expectedColumns: ['name', 'salary_band']
      }
    ]
  },

  // ── Module 12: INSERT, UPDATE, DELETE ──
  {
    id: 'data-modification',
    title: 'INSERT, UPDATE, DELETE',
    description: 'Modify data in tables',
    icon: '✏️',
    xp: 40,
    steps: [
      {
        type: 'info',
        instruction: 'INSERT adds new rows, UPDATE modifies existing rows, DELETE removes rows.',
        code: "INSERT INTO employees (name, department, salary)\nVALUES ('New Person', 'HR', 55000);\n\nUPDATE employees SET salary = 90000\nWHERE name = 'Alice Johnson';\n\nDELETE FROM employees\nWHERE id = 10;",
        hint: 'Always use WHERE with UPDATE and DELETE to avoid changing/removing all rows!'
      },
      {
        type: 'multiple-choice',
        instruction: 'What happens if you run DELETE FROM employees without a WHERE clause?',
        choices: ['Nothing happens', 'Only the first row is deleted', 'ALL rows are deleted', 'An error occurs'],
        correct: 2
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the INSERT statement:',
        template: "_____ INTO products (name, price)\nVALUES ('Speaker', 120);",
        answer: 'INSERT',
        caseSensitive: false
      },
      {
        type: 'fill-blank',
        instruction: 'Complete the UPDATE statement:',
        template: "_____ employees SET salary = 70000\nWHERE id = 6;",
        answer: 'UPDATE',
        caseSensitive: false
      },
      {
        type: 'multiple-choice',
        instruction: "Which is the correct syntax to add a new row?",
        choices: [
          "INSERT employees VALUES ('Test', 50000)",
          "INSERT INTO employees (name, salary) VALUES ('Test', 50000)",
          "ADD INTO employees (name, salary) VALUES ('Test', 50000)",
          "INSERT employees SET name='Test', salary=50000"
        ],
        correct: 1
      }
    ]
  }
];
