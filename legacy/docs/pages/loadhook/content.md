# Loadhook
A function that is called *in the browser* when the page loads.    

They're great for setting up timers, fetching client-side data, binding values, etc.  
## How to use Loadhooks
You can register a loadHook like so:
`import { loadHook } from "elegance-js"`
`loadHook([], () => { console.log("Hello Browser!"); })`  

The first parameter to the loadHook is a **array of state** that the loadHook  
would like to use in the browser.    

The second parameter is the function itself.
## Passing in State
Let's say you have declared some state:
`const myState = state("hello!")`  

This state, when created, exists in the *server*.  
And such, browser-side code will have no idea what you're referring to,  
if you just say "myState.value" in the loadHooks function body.    

This is why you must *pass in references* to the state you want to use,  
via a dependency array:
`loadHook([myState], (_, myState) => { console.log(myState.value); })`

## State Manager
The client's state manager is also available in the loadHook's function body.    

You can use it to do things like register new observers for state subjects:
`const updateCallback = (value: string) => { console.log(value); };`
`loadHook([myState], (state, myState) => { state.observe(myState, updateCallback, "some-key"); })`