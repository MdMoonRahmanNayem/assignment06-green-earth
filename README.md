1) What is the difference between var, let, and const?
ans: var: Function-scoped, can be re-declared and re-assigned.
let: Block-scoped, can be re-assigned but can not re-declared.
const: Block-scoped, cannot be re-assigned and re-declared.
2) What is the difference between map(), forEach(), and filter()? 
ans: map(): Returns a new modify array.
forEach(): Just loops over items, no new array is returned.
filter(): Returns a new array with only the items that pass a condition.
3) What are arrow functions in ES6?
ans: const addition = (a, b) => a + b;
4) How does destructuring assignment work in ES6?
ans: const [a, b] = [10, 20];     
const {name, age} = {name:"Ali", age:25}; 
5) Explain template literals in ES6. How are they different from string concatenation?
ans: ```js
const name = "moon";
console.log(`Hello, my name is ${name}`);

