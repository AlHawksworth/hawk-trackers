// ═══════════════════════════════════════════
// SQL Mimo — Simple SQL Query Validator/Engine
// ═══════════════════════════════════════════

const SQLEngine = (function () {

  // Normalize query for comparison
  function normalize(q) {
    return q.trim().replace(/\s+/g, ' ').replace(/;$/, '').toLowerCase();
  }

  // Check if query contains required keywords
  function hasKeywords(query, keywords) {
    const q = normalize(query);
    return keywords.every(kw => q.includes(kw.toLowerCase()));
  }

  // Simple query validators — each returns { correct: boolean, result: array|null, message: string }
  const validators = {
    'select-name-salary': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'employees'])) {
        return { correct: false, message: 'Make sure you SELECT from the employees table.' };
      }
      if (!q.includes('name') || !q.includes('salary')) {
        return { correct: false, message: 'Include both name and salary columns.' };
      }
      if (q.includes('*')) {
        return { correct: false, message: 'Select only name and salary, not all columns.' };
      }
      const result = SQL_DB.employees.map(e => ({ name: e.name, salary: e.salary }));
      return { correct: true, result, message: 'Correct! You selected name and salary from employees.' };
    },

    'select-all-employees': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', '*', 'from', 'employees'])) {
        return { correct: false, message: 'Use SELECT * FROM employees to get all columns.' };
      }
      return { correct: true, result: SQL_DB.employees.slice(0, 5), message: 'Correct! SELECT * returns all columns.' };
    },

    'where-salary-gt-80k': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'employees', 'where'])) {
        return { correct: false, message: 'Use SELECT ... FROM employees WHERE ...' };
      }
      if (!q.includes('salary') || !q.includes('80000')) {
        return { correct: false, message: 'Filter where salary > 80000.' };
      }
      if (!q.includes('>')) {
        return { correct: false, message: 'Use the > operator to find salaries greater than 80000.' };
      }
      const result = SQL_DB.employees.filter(e => e.salary > 80000);
      return { correct: true, result, message: 'Correct! Found ' + result.length + ' employees earning over £80k.' };
    },

    'where-sales-dept': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'employees', 'where'])) {
        return { correct: false, message: 'Use SELECT name FROM employees WHERE ...' };
      }
      if (!q.includes('sales')) {
        return { correct: false, message: "Filter for department = 'Sales'." };
      }
      const result = SQL_DB.employees.filter(e => e.department === 'Sales').map(e => ({ name: e.name }));
      return { correct: true, result, message: 'Correct! Found ' + result.length + ' Sales employees.' };
    },

    'order-salary-desc': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'employees', 'order by'])) {
        return { correct: false, message: 'Use ORDER BY to sort the results.' };
      }
      if (!q.includes('salary')) {
        return { correct: false, message: 'Sort by the salary column.' };
      }
      if (!q.includes('desc')) {
        return { correct: false, message: 'Use DESC to sort from highest to lowest.' };
      }
      const result = SQL_DB.employees
        .map(e => ({ name: e.name, salary: e.salary }))
        .sort((a, b) => b.salary - a.salary);
      return { correct: true, result, message: 'Correct! Results sorted by salary descending.' };
    },

    'and-eng-salary': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'employees', 'where', 'and'])) {
        return { correct: false, message: 'Use WHERE with AND to combine conditions.' };
      }
      if (!q.includes('engineering') || !q.includes('80000')) {
        return { correct: false, message: "Filter for Engineering department AND salary > 80000." };
      }
      const result = SQL_DB.employees
        .filter(e => e.department === 'Engineering' && e.salary > 80000)
        .map(e => ({ name: e.name, salary: e.salary }));
      return { correct: true, result, message: 'Correct! Found ' + result.length + ' senior engineers.' };
    },

    'or-sales-marketing': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'employees', 'where'])) {
        return { correct: false, message: 'Use SELECT ... FROM employees WHERE ...' };
      }
      if (!q.includes('sales') || !q.includes('marketing')) {
        return { correct: false, message: "Include both 'Sales' and 'Marketing' in your condition." };
      }
      if (!q.includes(' or ') && !q.includes(' in ')) {
        return { correct: false, message: 'Use OR or IN to match multiple departments.' };
      }
      const result = SQL_DB.employees
        .filter(e => e.department === 'Sales' || e.department === 'Marketing')
        .map(e => ({ name: e.name, department: e.department }));
      return { correct: true, result, message: 'Correct! Found ' + result.length + ' employees in Sales or Marketing.' };
    },

    'count-employees': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'count', 'from', 'employees'])) {
        return { correct: false, message: 'Use SELECT COUNT(*) FROM employees.' };
      }
      return { correct: true, result: [{ count: 10 }], message: 'Correct! There are 10 employees.' };
    },

    'max-salary': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'max', 'salary', 'from', 'employees'])) {
        return { correct: false, message: 'Use SELECT MAX(salary) FROM employees.' };
      }
      return { correct: true, result: [{ max: 95000 }], message: 'Correct! The highest salary is £95,000.' };
    },

    'avg-salary-by-dept': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'avg', 'from', 'employees', 'group by'])) {
        return { correct: false, message: 'Use AVG(salary) with GROUP BY department.' };
      }
      if (!q.includes('department')) {
        return { correct: false, message: 'Group by department and include it in SELECT.' };
      }
      const groups = {};
      SQL_DB.employees.forEach(e => {
        if (!groups[e.department]) groups[e.department] = [];
        groups[e.department].push(e.salary);
      });
      const result = Object.entries(groups).map(([dept, salaries]) => ({
        department: dept,
        avg_salary: Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
      }));
      return { correct: true, result, message: 'Correct! Average salary calculated per department.' };
    },

    'having-count-gt-2': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'employees', 'group by', 'having'])) {
        return { correct: false, message: 'Use GROUP BY with HAVING to filter groups.' };
      }
      if (!q.includes('count') || !q.includes('> 2')) {
        return { correct: false, message: 'Use HAVING COUNT(*) > 2.' };
      }
      const groups = {};
      SQL_DB.employees.forEach(e => {
        groups[e.department] = (groups[e.department] || 0) + 1;
      });
      const result = Object.entries(groups)
        .filter(([, c]) => c > 2)
        .map(([dept, count]) => ({ department: dept, count }));
      return { correct: true, result, message: 'Correct! Found departments with more than 2 employees.' };
    },

    'join-orders-customers': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'join', 'on'])) {
        return { correct: false, message: 'Use JOIN with ON to combine tables.' };
      }
      if (!q.includes('orders') || !q.includes('customers')) {
        return { correct: false, message: 'Join the orders and customers tables.' };
      }
      const result = SQL_DB.orders.map(o => {
        const c = SQL_DB.customers.find(c => c.id === o.customer_id);
        return { name: c ? c.name : 'Unknown', amount: o.amount };
      });
      return { correct: true, result: result.slice(0, 6), message: 'Correct! Orders joined with customer names.' };
    },

    'join-group-total': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'join', 'group by'])) {
        return { correct: false, message: 'Use JOIN and GROUP BY together.' };
      }
      if (!q.includes('sum')) {
        return { correct: false, message: 'Use SUM(amount) to get the total.' };
      }
      const totals = {};
      SQL_DB.orders.forEach(o => {
        const c = SQL_DB.customers.find(c => c.id === o.customer_id);
        if (c) totals[c.name] = (totals[c.name] || 0) + o.amount;
      });
      const result = Object.entries(totals).map(([name, total_amount]) => ({ name, total_amount }));
      return { correct: true, result, message: 'Correct! Total order amounts per customer.' };
    },

    'subquery-above-avg': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'employees', 'where', 'avg'])) {
        return { correct: false, message: 'Use a subquery with AVG(salary) in the WHERE clause.' };
      }
      const avg = SQL_DB.employees.reduce((s, e) => s + e.salary, 0) / SQL_DB.employees.length;
      const result = SQL_DB.employees
        .filter(e => e.salary > avg)
        .map(e => ({ name: e.name, salary: e.salary }));
      return { correct: true, result, message: 'Correct! Found ' + result.length + ' employees above average salary (£' + Math.round(avg).toLocaleString() + ').' };
    },

    'subquery-in-orders': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'customers', 'where', 'in'])) {
        return { correct: false, message: 'Use WHERE id IN (SELECT ...) with a subquery.' };
      }
      if (!q.includes('orders')) {
        return { correct: false, message: 'The subquery should reference the orders table.' };
      }
      const orderCustomerIds = [...new Set(SQL_DB.orders.map(o => o.customer_id))];
      const result = SQL_DB.customers.filter(c => orderCustomerIds.includes(c.id));
      return { correct: true, result, message: 'Correct! Found ' + result.length + ' customers with orders.' };
    },

    'like-contains-son': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'employees', 'where', 'like'])) {
        return { correct: false, message: "Use WHERE name LIKE '%son%'." };
      }
      if (!q.includes('%son%') && !q.includes("'%son%'")) {
        return { correct: false, message: "Use '%son%' to match names containing 'son'." };
      }
      const result = SQL_DB.employees.filter(e => e.name.toLowerCase().includes('son'));
      return { correct: true, result, message: 'Correct! Found ' + result.length + ' employees with "son" in their name.' };
    },

    'distinct-departments': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'distinct', 'department', 'from', 'employees'])) {
        return { correct: false, message: 'Use SELECT DISTINCT department FROM employees.' };
      }
      const depts = [...new Set(SQL_DB.employees.map(e => e.department))];
      const result = depts.map(d => ({ department: d }));
      return { correct: true, result, message: 'Correct! Found ' + depts.length + ' unique departments.' };
    },

    'alias-monthly-pay': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'employees', 'as'])) {
        return { correct: false, message: 'Use AS to create an alias for the calculated column.' };
      }
      if (!q.includes('/ 12') && !q.includes('/12')) {
        return { correct: false, message: 'Divide salary by 12 to get monthly pay.' };
      }
      if (!q.includes('monthly_pay')) {
        return { correct: false, message: "Alias the result as 'monthly_pay'." };
      }
      const result = SQL_DB.employees.map(e => ({ name: e.name, monthly_pay: Math.round(e.salary / 12) }));
      return { correct: true, result: result.slice(0, 5), message: 'Correct! Monthly pay calculated with alias.' };
    },

    'case-salary-band': function (query) {
      const q = normalize(query);
      if (!hasKeywords(query, ['select', 'from', 'employees', 'case', 'when', 'then', 'end'])) {
        return { correct: false, message: 'Use a CASE WHEN ... THEN ... ELSE ... END expression.' };
      }
      if (!q.includes('80000')) {
        return { correct: false, message: 'Check salary > 80000 for the High band.' };
      }
      const result = SQL_DB.employees.map(e => ({
        name: e.name,
        salary_band: e.salary > 80000 ? 'High' : 'Standard'
      }));
      return { correct: true, result: result.slice(0, 5), message: 'Correct! Salary bands assigned with CASE.' };
    }
  };

  function validate(validatorId, query) {
    const fn = validators[validatorId];
    if (!fn) return { correct: false, message: 'Unknown validator.', result: null };
    try {
      return fn(query);
    } catch (e) {
      return { correct: false, message: 'Error evaluating query. Check your syntax.', result: null };
    }
  }

  return { validate, normalize };
})();
