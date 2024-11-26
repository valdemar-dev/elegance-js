declare const createElementOptions: (obj: Record<string, any>) => () => Record<string, any>;
declare const elements: {
    [key: string]: EleganceElement<ElementTags>;
};
declare const optionlessElements: {
    [key: string]: EleganceOptionlessElement<OptionlessElementTags>;
};
declare const childrenlessElements: {
    [key: string]: EleganceChildrenlessElement<ChildrenlessElementTags>;
};
declare const childrenlessOptionlessElements: {
    [key: string]: EleganceChildrenlessOptionlessElement<ChildrenlessOptionlessElementTags>;
};
declare const allElements: {
    [x: string]: EleganceElement<ElementTags> | EleganceOptionlessElement<OptionlessElementTags> | EleganceChildrenlessElement<ChildrenlessElementTags> | EleganceChildrenlessOptionlessElement<ChildrenlessOptionlessElementTags>;
};
export { elements, optionlessElements, childrenlessElements, childrenlessOptionlessElements, createElementOptions, allElements };
