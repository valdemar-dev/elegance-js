declare function Observer(
    options: Record<string, any>, 
    ...children: Array<() => BuiltElement<string>> | string[]
): () => BuiltElement<"a">

export { Observer }
