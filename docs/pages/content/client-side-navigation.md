# Client Side Navigation
Client-side navigation is when you overwrite the browsers default navigation, and instead use custom navigation logic on the client.

This has the benefit of *maintaining* the active JavaScript state, as well as the state of DOM elements; which allows you to keep things like active connections alive, timers going, variable values between pages, etc.

In Elegance, this also lets you soft-replace *layouts*, maintaining the literal element instances and their CSS states.

Navigation *does not trigger* if you try to navigate to a page with the same pathname, but it will push state and scroll to any hash it finds.

When client-side navigating, the *cleanups* of [load hooks](/load-hooks) are called.

## Link Element
Elegance comes with a custom `<a>` element, called `Link()`, which *extends* the regular anchor element, overwriting it's `onClick` function to use client-side navigation.

It also includes a few pre-fetching options, letting you do things like pre-load pages whenever the user hovers over a link, allowing for faster navigation.

You can also trigger client-side navigation manually, with the [elegance client](/elegance-client)