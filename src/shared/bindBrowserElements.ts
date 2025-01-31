const elementsWithAttributesAndChildren: string[] = [
  'a', 'abbr', 'address', 'article', 'aside', 'b', 'body', 'blockquote', 'button', 'canvas',
  'cite', 'code', 'colgroup', 'data', 'del', 'details', 'dfn', 'div', 'dl', 'dt', 'em', 'fieldset',
  'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i',
  'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'menu',
  'menuitem', 'meter', 'nav', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'pre', 'progress',
  'q', 'section', 'select', 'small', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 
  'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'u', 'ul', 'var', 'video', 'details', 'datalist'
];

const elementsWithAttributesOnly: string[] = [
  'audio', 'base', 'br', 'col', 'embed', 'link', 'meta', 'noscript', 'source', 'track', 'wbr', 'area',
  'command', 'picture', 'progress', 'html', 'head'
];

const elementsWithChildrenOnly: string[] = [
  'title', 'template'
];

const define = (tagName: string, hasAttr: boolean, hasChildren: boolean) => {
    return (...args: any[]) => {
        let options: Record<string, any> = {};
        let children: ElementChildren = [];

        if (hasAttr && args.length > 0 && typeof args[0] === 'object') {
            options = args[0];
            if (hasChildren && args.length > 1) {
                children = args.slice(1);
            }
        } else if (hasChildren && args.length > 0) {
            children = args;
        }

        return ({
            tag: tagName,
            getOptions: options ?? {},
            children: children,
        });
    };
};

Object.assign(globalThis, {
    ...elementsWithAttributesAndChildren.reduce((acc, el) => {
        acc[el] = define(el, true, true);
        return acc;
    }, {} as { [key: string]: Function }),
    ...elementsWithChildrenOnly.reduce((acc, el) => {
        acc[el] = define(el, false, true);
        return acc;
    }, {} as { [key: string]: Function }),
    ...elementsWithAttributesOnly.reduce((acc, el) => {
        acc[el] = define(el, true, false);
        return acc;
    }, {} as { [key: string]: Function }),
})
