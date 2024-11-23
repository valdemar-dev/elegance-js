declare const createElementOptions: (obj: Record<string, any>) => () => Record<string, any>;
declare const elements: {
    [key: string]: (EleganceElement<any> | EleganceOptionlessElement<any>);
};
export { elements, createElementOptions };
