# Load Hooks
Load hooks are functions that run in the browser during page load.
There are a few different kinds of loadHooks.

## Usage
Import the `loadHook` function from Elegance.
It takes in two parameters, a `callback`, which is run when the load hook runs, and a list of [state subjects](/state) that the loadhook depends on.

## Cleanup
Due to the nature of [client-side navigation](/client-side-navigation), the JavaScript context between pages remains the same. This has many benefits, but also at least one drawback. Code that runs every time a page loads, (aka a load hook), could retain some information in memory, which the browser keeps alive. 

Think things like socket connections, intervals, etc. These obviously cause issues, which is why it's important to  clean them up.

Load hooks may return a function if need be, that will be called upon the "unloading" of a load hook; which should be used to clean up anything that could create issues.

## Specifics
Load hooks registered in [pages](/pages) are called whenever the user navigates to the page.

Whenever a load hook is registered to a [layout](/layouts), however, it's behavior slightly changes.
It will be called upon the initial navigation to a page containing the layout to which it is attached to.

It will remain active until the user navigates to a page which does not contain the layout, and the load hooks cleanup function is called.

Layout's registered to `/` will never be unloaded.

The function body of `callback` within a load hook is sent to the browser *literally*, and thus has no context of server-side variables, and should **never** contain secrets**