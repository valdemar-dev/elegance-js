# State
A variable generated on the server, and shipped to the browser.  
It can be any value, like an object, array, number, or string.

## Using State
To use state, import the *state* function from Elegance:
`import { state } from "elegance-js";`  

Then, declare your variable:
`const myVariable = state("Hello World!");`  

The return value of *state* is a *state subject*.  
It's value can be mutated with *state.value*.    

It can also be **passed in** to many functions Elegance.JS provides,  
like loadHooks.

## Observer Pattern
When you change a subject's value in the browser, it's important to explicitly  
call the *signal* method of the subject.    
This let's every *observer* of the subject know that it's value has changed.    

This is required to things like the *observe()* function, which dynamically updates  
page content based on the value of state subjects.    

We opted for explicit signaling because we believe this gives the developer more control  
over their code, allowing them to refresh page content *only when they want to*.