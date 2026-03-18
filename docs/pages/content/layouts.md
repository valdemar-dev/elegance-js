# Layouts
Layouts in Elegance are like *wrapper HTML*. Layouts surround your [pages](/pages) with extra HTML. They're commonly used in places where you want an element to exist on many pages, like a navbar, or header.

Layouts are automatically added to pages that they're in the scope of. A layout in the path `/`, will be on *all* pages; whereas a layout in `/blog` would show up in `/blog/my-article`, but **wouldn't** show up in `/about-me`.

## Usage
Create a file in any folder called `layout.ts`.

This file will have *two* mandatory function exports. `layout` and `metadata`. 

`metadata` should return an array of `<head>` children. These will of course be passed into the head of all child pages and layouts.


`layout` should return some sort of element, inside of which you will use the `child` parameter function that is passed in, to denote where the next layout / page will begin. Something like `return div(child())`.
## Layout Props
In the paramater `child` of `layout`, you can pass in a **prop object**, which will be passed into the constructor of the **next layout or page**.

So, if the layout `/layout.ts` calls `child` like this: `child({ counter: 1, })`; a layout at `/blog/layout.ts` would get `{ props: { counter: 1 }}` in it's parameters. These props are *mutable*, so be sure to make note of that, and all the props' values get *accumulated*, so not **every layout** needs to pass `counter` to the child, and eventually the page.

If you want to exclude a value from the next layout, you can simple null it, like so. (example in something like `/blog/layout.ts`, assuming it got `counter` from `/layout.ts`) `child({ counter: undefined })`. This will prevent the value from being sent to `/blog/page.ts`