declare const elementsWithAttributesAndChildren: string[];
declare const elementsWithAttributesOnly: string[];
declare const elementsWithChildrenOnly: string[];
declare const define: (tagName: string, hasAttr: boolean, hasChildren: boolean) => (...args: any[]) => {
    tag: string;
    getOptions: Record<string, any>;
    children: ElementChildren;
};
