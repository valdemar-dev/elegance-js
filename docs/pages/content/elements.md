# Elements
Elements are the core part of what make up a website.

There are two different kinds of Elements in Elegance. Literals, and Elegance Elements.
Element literals represent *literal* values, like strings, numbers, booleans, and arrays.

Elegance Elements are slightly more complex, but the jist is, that they're custom objects that the [compiler](/compiler) will turn into HTML elements. 

## Element Creation
To create an element, you use **ambient global function calls**. All standard HTML, svg and math elements are available.

The first parameter of an element call is usually an **options object**.
In the options object you may define key-value pairs, which then get turned into html string.

For example, `header({ class: "header", })`, would result in 
`<header class="header"></header>`.

The first paramater *can* also be a *child* element (for syntax sugar), eg. another Elegance Element, or element literal.
If the first parameter *is* a child element, then it will be prepended to the elements children.

### Childrenless Elements
Some elements in the HTML spec, like `br()` are considered **void** elements. Attempting to give children to these elements will throw an error. They still take in an options object.

## Special Element Options
In the options object, **special element options** are a valid value to almost all option keys. 

Special element options differ from normal options, in the way that the *compiler does not serialize them directly*. But rather, they have their own serialization method, among other methods like *mutate* to instantiate them.

This is useful for a few reasons.

Firstly, it lets us have hidden values for options that may never be needed in the dom, but are needed in JavaScript.
But it could also let us represent more complex values and use custom serialization logic.

[Event listeners](/observers) and [observers](/observers) both return special element options, which you assign to the keys in an option.

## Full Element List
**NOTE** The var element is for keyword collision reasons named to `varElement`
### HTML Elements
* a
* abbr
* address
* article
* aside
* audio
* b
* bdi
* bdo
* blockquote
* body
* button
* canvas
* caption
* cite
* code
* colgroup
* data
* datalist
* dd
* del
* details
* dfn
* dialog
* div
* dl
* dt
* em
* fieldset
* figcaption
* figure
* footer
* form
* h1
* h2
* h3
* h4
* h5
* h6
* head
* header
* hgroup
* html
* i
* iframe
* ins
* kbd
* label
* legend
* li
* main
* map
* mark
* menu
* meter
* nav
* noscript
* object
* ol
* optgroup
* option
* output
* p
* picture
* pre
* progress
* q
* rp
* rt
* ruby
* s
* samp
* script
* search
* section
* select
* slot
* small
* span
* strong
* style
* sub
* summary
* sup
* table
* tbody
* td
* template
* textarea
* tfoot
* th
* thead
* time
* title
* tr
* u
* ul
* varElement
* video
### HTML Childrenless Elements
* area
* base
* br
* col
* embed
* hr
* img
* input
* link
* meta
* param
* source
* track
* wbr
### SVG Elements
* svg
* g
* text
* tspan
* textPath
* defs
* symbol
* use
* image
* clipPath
* mask
* pattern
* linearGradient
* radialGradient
* filter
* marker
* view
* feBlend
* feColorMatrix
* feComponentTransfer
* feComposite
* feConvolveMatrix
* feDiffuseLighting
* feDisplacementMap
* feDistantLight
* feFlood
* feFuncA
* feFuncB
* feFuncG
* feFuncR
* feGaussianBlur
* feImage
* feMerge
* feMergeNode
* feMorphology
* feOffset
* fePointLight
* feSpecularLighting
* feSpotLight
* feTile
* feTurbulence
### SVG Childrenless Elements
* path
* circle
* ellipse
* line
* polygon
* polyline
* stop
### MathML Elements
* math
* ms
* mtext
* mrow
* mfenced
* msup
* msub
* msubsup
* mfrac
* msqrt
* mroot
* mtable
* mtr
* mtd
* mstyle
* menclose
* mmultiscripts
### MathML Childrenless Elements
* mi
* mn
* mo
