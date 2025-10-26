# Event Listener
A function you may attach to an attribute of an Element.  
Used for things like click handlers.

## Using Event Listeners
First, import the *eventListener* function from Elegance:
`import { eventListener } from "elegance-js";`  

Then, create your listener:
`const listener = eventListener([], () => { console.log("I've been clicked!"); });`
`const element = button({ onClick: listener, });`