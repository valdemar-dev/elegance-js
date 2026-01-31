# Load Hooks
Load hooks are functions that run in the browser during page load.
There are a few different kinds of loadHooks.

## Usage
Import the `loadHook` function from Elegance.
It takes in two parameters, a `callback`, which is run when the load hook runs,
and a list of [state subjects](https://elegance.js.org/state) that the loadhook depends on.

## Cleanup
Load hooks may return a function, which should clean up any side-effects, like active connections, timers, intervals, etc.

## Specifics
Load hooks registered in [pages](https://elegance.js/pages) are called whenever the user navigates to the page.

Whenever a load hook is registered to a [layout](https://elegance.js/layouts), however, it's behavior slightly changes.
It will be called upon the initial navigation to a page containing the layout to which it is attached to.
Then, it remains active until the user navigates to a page which does not contain the layout, and the load hooks cleanup function is called.