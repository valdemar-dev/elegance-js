
declare const elements: {
    meta: BuildableElement<"meta">,
    footer: BuildableElement<"footer">,
    link: BuildableElement<"link">, 
    header: BuildableElement<"header">, 
    p: BuildableElement<"p">, 
    body: BuildableElement<"body">,
    main: BuildableElement<"main">, 
    div: BuildableElement<"div">,
    button: BuildableElement<"button">, 
    input: BuildableElement<"input">, 
    a: BuildableElement<"a">, 
    h1: BuildableElement<"h1">, 
    h2: BuildableElement<"h2">, 
    h3: BuildableElement<"h3">, 
    h4: BuildableElement<"h4">, 
    h5: BuildableElement<"h5">, 
    h6: BuildableElement<"h6">, 
    pre: BuildableElement<"pre">,
    html: BuildableElement<"html">, 
    script: BuildableElement<"script">, 
    span: BuildableElement<"span">, 
    title: BuildableElement<"title">, 
    head: BuildableElement<"head">, 
    style: BuildableElement<"style">
};

declare function createElementOptions(obj: Record<string, any>): () => Record<string, any>

export { elements, createElementOptions }
