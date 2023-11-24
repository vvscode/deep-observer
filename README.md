# Object Chronicler

[![npm version](https://badge.fury.io/js/object-chronicler.svg)](https://www.npmjs.com/package/object-chronicler)
[![Deploy](https://github.com/vvscode/object-chronicler/workflows/build/badge.svg)](https://github.com/vvscode/object-chronicler/actions)
[![Coverage Status](https://coveralls.io/repos/github/vvscode/object-chronicler/badge.svg?branch=master)](https://coveralls.io/github/vvscode/object-chronicler?branch=master)

Object Chronicler empowers developers to gain unprecedented insights into the behavior of their JavaScript objects and functions. Acting as a meticulous observer, this utility allows you to effortlessly create spies that diligently record every interaction within your complex data structures.

### Key Features

- **Observation Made Easy:** Utilize createSpy to seamlessly spy on objects and functions, generating proxies with built-in history tracking.

- **Detailed Histories:** `BasicHistory` provides a simple yet powerful implementation of the History interface, enabling the storage of detailed records about property accesses, method calls, and more.

- **Flexible Testing:** Perfect for unit testing, debugging, and gaining a deeper understanding of your code's runtime behavior.

#### Why Object Chronicler?

Object Chronicler is your ally in navigating the intricacies of JavaScript objects and functions. Whether you're debugging, testing, or simply seeking a deeper understanding of your code's runtime behavior, this library empowers you to chronicle every interaction, ensuring you have the insights needed for confident and effective development.

> Explore new possibilities with Object Chronicler today!

## Installation

````bash
npm install object-chronicler

## Usage

### createSpy

`createSpy` is the main function for creating spies on objects or functions. It returns a proxied object with a history property to retrieve the recorded interactions.

```ts
import { createSpy, BasicHistory } from 'object-chronicler';

const obj = {
  method1: (x: unknown) => 'result1',
  method2: (y: unknown) => 'result2',
};

const history = new BasicHistory();
const spiedObj = createSpy(obj, history);

console.log(spiedObj.method1(1)); // Output: 'result1'
console.log(spiedObj.method2({ b: [] })); // Output: 'result2'

console.log(history.getAll());
````

### BasicHistory

`BasicHistory` is a simple implementation of the `History` interface. It records interactions in a key-value store.

```ts
import { BasicHistory } from 'object-chronicler';

const history = new BasicHistory();

history.put({ type: 'get', key: 'key1' });
history.put({ type: 'set', key: 'key2', value: 'value2' });

console.log(history.getAll());
```

### Contributing

Feel free to contribute by opening issues or pull requests on [the GitHub repository](https://github.com/vvscode/object-chronicler).

#### Keywords

object, chronicler, spy, testing, history, tracking
