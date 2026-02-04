# State
State refers to a type of special variable that is reactive, and sent to the browser.

To create state, you use the `state` function from Elegance, and you give it an *initial value*. The values type can be any one of: `function`, `Array`, `object`, `number`, `boolean`, or `string`.

This value is then sent *literally* (meaning it is not bundled in the case of something like a function) to the [client](/elegance-client).

When you call the `state` function it will return what's called a **Server Subject**. Server Subjects are used in many places, like the dependency arrays for [observers](/observers), [load hooks](/load-hooks), and [event listeners](/event-listeners).

## Reactivity
Reactivity for state in Elegance follows the commonly known [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern).

Functions like [observer](/observers) register *listeners* onto a [Client Subject](#client-subjects), and whenever you set the `value` property of the **state subject reference**, it will *call every listener* that it has.

For subjects that have a type of `Array`, the method `reactiveMap` becomes available.
It is a templating function, that will map each element in the array to an [Elegance Element](/elements).

It's callback (the function called for each element) is shipped *literally*, and is client-side code. Thus it shouldn't contain secrets, and has no context of server-side variables.

## Client Subjects
After you register a **State Subject** in a page or layout, it first is a **Server Subject**, meaning it only has properties like an `id`, and a `value`, and does not yet react to [observers](#reactivity).

However, when it reaches the [elegance client](/elegance-client) and is initialized, it will become a **Client Subject**.

In many functions, like [load hooks](/load-hooks), their parameters take in a *dependency array* of **Server Subjects**. Then, in their callback (which is client-side code), they become **Client Subjects**, since they have been initialized *in the client-runtime*, rather than the *server-runtime*. This is a very important distinction to make, and thus they are of separate types.

Client subjects are the "full" versions of State Subjects. You can call their `observe` method to attach your own custom observers, whenever you set their `value` property, they will call those observers, or you can even call `triggerObservers` to trigger them manually.

## Specifics
Subject IDs are created using a hash of a page's / layout's pathname, and an ID counter that automatically increments.

This gives static deterministic IDs, that are the same regardless of when the page is compiled, and in what context.

You should not call `state()` in a conditional or unpredictable manner, if you wish to depend on the *deterministic* nature of it's ID creation.

You can, however do this, if you do *not care*, for example, if the variable is only used in 1 component, and not referenced across pages.

You can use `explicitId` in the options object of `state()` to override the ID generation. Just be sure to make it *unique* **per project**.