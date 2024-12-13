declare const createElementOptions: (obj: Record<string, any>) => () => Record<string, any>;
declare const voidElements: string[];
declare const structureElements: string[];
declare const elements: {
    [key: string]: ((...children: ElementChildren) => () => ({
        tag: string;
        getOptions: () => ({});
        children: ElementChildren;
    })) | ((options: Record<string, any>) => () => ({
        tag: string;
        getOptions: ReturnType<typeof createElementOptions>;
        children: [];
    })) | ((options: Record<string, any>, ...children: ElementChildren) => () => ({
        tag: string;
        getOptions: ReturnType<typeof createElementOptions>;
        children: ElementChildren;
    }));
};
declare const globalProperties: string[];
interface Window {
    [key: string]: any;
}
