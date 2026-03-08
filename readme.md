# JavaScript Basics for Beginners

This README explains some important JavaScript concepts in a simple way.

## 1. What is the difference between var, let, and const?

All three are used to declare variables in JavaScript, but they behave differently.

var

Function-scoped

Can be re-declared

Can be updated

Hoisted and initialized with undefined

var name = "Anayet";
var name = "Developer"; // allowed
name = "MERN Developer"; // allowed
let

Block-scoped

Cannot be re-declared in the same scope

Can be updated

Hoisted but not initialized

let age = 25;
age = 26; // allowed
// let age = 30; // not allowed in the same scope
const

Block-scoped

Cannot be re-declared

Cannot be updated

Must be assigned a value when declared

const country = "Bangladesh";
// country = "India"; // not allowed
Example with scope
if (true) {
var a = 10;
let b = 20;
const c = 30;
}

console.log(a); // 10
// console.log(b); // error
// console.log(c); // error
Summary Table
Keyword Scope Reassign Redeclare
var Function Yes Yes
let Block Yes No
const Block No No 

## 2. What is the spread operator (...)?

The spread operator is used to expand or copy elements from an array or object.

Array example
const numbers = [1, 2, 3];
const newNumbers = [...numbers, 4, 5];

console.log(newNumbers); // [1, 2, 3, 4, 5]
Copying an array
const arr1 = [10, 20];
const arr2 = [...arr1];

console.log(arr2); // [10, 20]
Combining arrays
const a = [1, 2];
const b = [3, 4];
const combined = [...a, ...b];

console.log(combined); // [1, 2, 3, 4]
Object example
const user = {
name: "Anayet",
role: "Developer"
};

const updatedUser = {
...user,
skill: "MERN"
};

console.log(updatedUser);
Why use spread operator?

Copy arrays or objects

Merge arrays or objects

Add new values easily

## 3. What is the difference between map(), filter(), and forEach()?

These are array methods, but each has a different purpose.

map()

Used to create a new array by changing each element.

const numbers = [1, 2, 3];
const doubled = numbers.map(num => num \* 2);

console.log(doubled); // [2, 4, 6]
filter()

Used to create a new array with only the elements that match a condition.

const numbers = [1, 2, 3, 4, 5];
const evenNumbers = numbers.filter(num => num % 2 === 0);

console.log(evenNumbers); // [2, 4]
forEach()

Used to loop through an array, but it does not return a new array.

const numbers = [1, 2, 3];

numbers.forEach(num => {
console.log(num);
});
Summary Table
Method Returns New Array Purpose
map() Yes Transform each element
filter() Yes Keep elements based on condition
forEach() No Run code for each element 

## 4. What is an arrow function?

An arrow function is a shorter way to write a function in JavaScript.

Regular function
function greet(name) {
return "Hello " + name;
}
Arrow function
const greet = (name) => {
return "Hello " + name;
};
Short form

If there is only one line to return, you can write it like this:

const greet = (name) => "Hello " + name;
Example
const add = (a, b) => a + b;

console.log(add(5, 3)); // 8
Benefits of arrow functions

Shorter syntax

Easier to write

Commonly used in modern JavaScript

## 5. What are template literals?

Template literals are a modern way to write strings in JavaScript.

They use backticks instead of quotes.

Normal string
const name = "Anayet";
const message = "Hello, my name is " + name;
Template literal
const name = "Anayet";
const message = `Hello, my name is ${name}`;
Example with multiple values
const product = "Laptop";
const price = 50000;

console.log(`The price of ${product} is ${price} taka.`);
Multi-line string
const text = `This is line 1
This is line 2
This is line 3`;

console.log(text);
Why use template literals?

Easier string interpolation

Cleaner code

Supports multi-line strings

Final Notes

These are very important JavaScript basics:

var, let, and const are used to declare variables

... is the spread operator

map(), filter(), and forEach() are array methods

Arrow functions are a shorter way to write functions

Template literals make strings easier to write
