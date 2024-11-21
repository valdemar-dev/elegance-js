declare function Link(
    options: Record<string, any>, 
    ...children: Array<() => BuiltElement<string>> | string[]
): () => BuiltElement<"a">


export { Link }
