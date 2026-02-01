# Observers
Observers are client-side callbacks that run whenever a [state](https://elegance.js.org/state) subject changes it's value.

Observers are assigned to element options, to dynamically update values like their `className`.

## Usage
Import the `observer` function from Elegance.
The `observer` function takes two values, the `callback` that will be run, and an array `dependencies` to watch.
Whenever one of `dependencies` updates, `callback` will be executed.
Whatever `callback` returns, will be the new value of whatever field of an Element's options the observer is assigned to.

## Callback
Please note that the callback body is sent *literally* to the browser, and thus has no context of server-side variables,
and should **never** contain secrets.

## Element Reference
Inside the observer's `callback`, the `this` value is set to whatever DOM Element the observer is attached to.
To access it, transform the callback into a regular `function() {}` instead of an arrow function `() => {}`