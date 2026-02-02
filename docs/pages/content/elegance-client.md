# Elegance Client
The Elegance client refers to the JavaScript **runtime** that runs in the *browser* on all Elegance pages. It handles things like executing [load hooks](/load-hooks), attaching [observers](/observers), [client-side navigation](/client-side-navigation), etc.

The client runtime exposes some tools in the global scope that could be useful to some projects.

They are accessible in the global variable `eleganceClient`, which is defined only in the browser.

## Client Tools
### createHTMLElementFromElement
Take a regular Elegance-style element, like the result of a `div()`, and turn it into a [DOM Element](https://developer.mozilla.org/en-US/docs/Web/API/Element). This is used internally, but may be useful if you are creating your own implementations of client-side components.
### fetchPage
Fetch a page on the same domain and store it's HTML result in-memory. Used internally by `navigateLocally`, but could be used for example to pre-fetch a site for quicker navigation times.
### navigateLocally
Performs client-side navigation. For more information [click here](/client-side-navigation).
### onNavigate
Hook into the navigation system, and call `callback` every time the client navigates locally. Note that this is load-hook scope independent, and should be cleaned up.
### removeNavigationCallback
Remove a navigation callback created by `onNavigate`.