# Observers
Observers are client-side callbacks that run whenever a [state](/state) subject changes it's value.

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
It could be useful for some observers to retain a simple reference to the actual DOM element they're attached to.
For this use-case, `this` is passed into the observers callback.

Note, that arrow functions cannot due to the lexical scope, according to typescript, access `this`, so you will need to change your observer callback to a regular `function() {}` instead of an arrow function `() => {}`.

Once this is done, typescript should pick up on the type of `this` automatically, and if you want, you can include it in the parameters and type it manually to the type of your element, like so: `function(this: HTMLDivElement) {}`

If you don't want to use `this`, or for some reason don't want to use a regular function declaration, you can also use the `getSelf()` function, which will return the Element the observer is attached to.