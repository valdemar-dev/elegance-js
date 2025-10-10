import fs, { Dirent } from "fs";
import path from "path";
import esbuild from "esbuild";
import { fileURLToPath } from 'url';
import { generateHTMLTemplate } from "./server/generateHTMLTemplate";

import { ObjectAttributeType } from "./helpers/ObjectAttributeType";
import { serverSideRenderPage } from "./server/render";
import { getState, getObjectAttributes, initializeState, initializeObjectAttributes } from "./server/createState";
import { getLoadHooks, LoadHook, resetLoadHooks } from "./server/loadHook";

let packageDir = process.env.PACKAGE_PATH;
if (packageDir === undefined) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    packageDir = path.resolve(__dirname, '..');
}


let elementKey = 0;

const processOptionAsObjectAttribute = (
    element: AnyBuiltElement,
    optionName: string,
    optionValue: ObjectAttribute<any>,
    objectAttributes: Array<any>,
) => {
    const lcOptionName = optionName.toLowerCase();

    const options = element.options as ElementOptions;

    let key = options.key;
    if (key == undefined) {
        key = elementKey += 1
        options.key = key;
    }

    if (!optionValue.type) {
        throw `ObjectAttributeType is missing from object attribute. ${element.tag}: ${optionName}/${optionValue}`;
    }

    // TODO: jank lol - val 2025-02-17
    let optionFinal = lcOptionName;
    
    switch (optionValue.type) {
        case ObjectAttributeType.STATE:
            const SOA = optionValue as ObjectAttribute<ObjectAttributeType.STATE>;

            if (typeof SOA.value === "function") {
                delete options[optionName];
                break;
            }

            if (
                lcOptionName === "innertext" ||
                lcOptionName === "innerhtml"
            ) {
                element.children = [SOA.value];
                delete options[optionName];
            } else {
                delete options[optionName];
                options[lcOptionName] = SOA.value;
            }

            break;

        case ObjectAttributeType.OBSERVER:
            const OOA = optionValue as ObjectAttribute<ObjectAttributeType.OBSERVER>;

            const firstValue = OOA.update(...OOA.initialValues);

            if (
                lcOptionName === "innertext" ||
                lcOptionName === "innerhtml"
            ) {
                element.children = [firstValue];
                delete options[optionName];
            } else {
                delete options[optionName];
                options[lcOptionName] = firstValue;
            }

            optionFinal = optionName;

            break;

        case ObjectAttributeType.REFERENCE:
            options["ref"] = (optionValue as any).value;

            break;
    }

    objectAttributes.push({ ...optionValue, key: key, attribute: optionFinal, });
};

export const processPageElements = (
    element: Child,
    objectAttributes: Array<any>,
    parent: Child,
): Child => {
    if (
        typeof element === "boolean" ||
        typeof element === "number" ||
        Array.isArray(element)
    ) return element;

    if (typeof element === "string") {
        return (element);
    }

    const processElementOptionsAsChildAndReturn = () => {
        const children = element.children as Child[];
        
        (element.children as Child[]) = [
            (element.options as Child),
            ...children
        ];
        
        element.options = {};
        
        for (let i = 0; i < children.length+1; i++) {
            const child = element.children![i];
            
            const processedChild = processPageElements(child, objectAttributes, element)
            
            element.children![i] = processedChild;
        }
        
        return {
            ...element,
            options: {},
        }
    };

    if (typeof element.options !== "object") {
        return processElementOptionsAsChildAndReturn();
    }
    
    const {
        tag: elementTag,
        options: elementOptions,
        children: elementChildren
    } = (element.options as AnyBuiltElement);

    if (
        elementTag &&
        elementOptions &&
        elementChildren
    ) {
        return processElementOptionsAsChildAndReturn();
    }

    const options = element.options as ElementOptions;

    for (const [optionName, optionValue] of Object.entries(options)) {
        const lcOptionName = optionName.toLowerCase();

        if (typeof optionValue !== "object") {
            if (lcOptionName === "innertext") {
                delete options[optionName];

                if (element.children === null) {
                    throw `Cannot use innerText or innerHTML on childrenless elements.`;
                }
                element.children = [optionValue, ...(element.children as Child[])];

                continue;
            }

            else if (lcOptionName === "innerhtml") {
                if (element.children === null) {
                    throw `Cannot use innerText or innerHTML on childrenless elements.`;
                }

                delete options[optionName];
                element.children = [optionValue];

                continue;
            }
            
            // why cant naming be consistent.
            // this was made to make life easier, eg. dataTest, ariaLabel, into data-test, aria-label. BUt html BAD and they use incosistent casing.
            // means this breaks stuff.
            /*
            delete options[optionName];
            options[camelToKebabCase(optionName)] = optionValue;
            */
            
            continue;
        };

        processOptionAsObjectAttribute(element, optionName, optionValue, objectAttributes);
    }

    if (element.children) {    
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children![i];
            
            const processedChild = processPageElements(child, objectAttributes, element)
    
            element.children![i] = processedChild;
        }
    }

    return element;
};

const generateSuitablePageElements = async (
    pageLocation: string,
    pageElements: Child,
    metadata: () => BuiltElement<"head">,
    DIST_DIR: string,
    pageName: string,
) => {
    if (
        typeof pageElements === "string" ||
        typeof pageElements === "boolean" ||
        typeof pageElements === "number" ||
        Array.isArray(pageElements)
    ) {	
        return [];
    }

    const objectAttributes: Array<ObjectAttribute<any>> = [];
    const processedPageElements = processPageElements(pageElements, objectAttributes, []);
    
    elementKey = 0;

    const renderedPage = await serverSideRenderPage(
        processedPageElements as Page,
        pageLocation,
    );

    const template = generateHTMLTemplate({
        pageURL: path.relative(DIST_DIR, pageLocation),
        head: metadata,
        addPageScriptTag: true,
        name: pageName,
    });

    const resultHTML = `<!DOCTYPE html><html>${template}${renderedPage.bodyHTML}</html>`;

    return {
        objectAttributes,
        resultHTML,
    }
};

// TODO: REWRITE THIS SHITTY FUNCTION
const generateClientPageData = async (
    pageLocation: string,
    state: typeof globalThis.__SERVER_CURRENT_STATE__,
    objectAttributes: Array<ObjectAttribute<any>>,
    pageLoadHooks: Array<LoadHook>,
    DIST_DIR: string,
    pageName: string,
) => {
    const pageDiff = path.relative(DIST_DIR, pageLocation);

    let clientPageJSText = `let url="${pageDiff === "" ? "/" : `/${pageDiff}`}";`;
    
    // add in data
    {
        clientPageJSText += `export const data = {`;
    
        if (state) {
            const nonBoundState = state.filter(subj => (subj.bind === undefined));        
    
            clientPageJSText += `state:[`
    
            for (const subject of nonBoundState) {
                if (typeof subject.value === "string") {
                    const stringified = JSON.stringify(subject.value)
                    
                    clientPageJSText += `{id:${subject.id},value:${stringified}},`;
                } else if (typeof subject.value === "function") {
                    clientPageJSText += `{id:${subject.id},value:${subject.value.toString()}},`;
                } else {
                    clientPageJSText += `{id:${subject.id},value:${JSON.stringify(subject.value)}},`;
                }
            }
    
            clientPageJSText += `],`;
    
            const formattedBoundState: Record<string, any> = {};
    
            const stateBinds = state.map(subj => subj.bind).filter(bind => bind !== undefined);
    
            for (const bind of stateBinds) {
                formattedBoundState[bind] = [];
            };
    
            const boundState = state.filter(subj => (subj.bind !== undefined))
            for (const subject of boundState) {
                const bindingState = formattedBoundState[subject.bind!];
    
                delete subject.bind;
    
                bindingState.push(subject);
            }
    
            const bindSubjectPairing = Object.entries(formattedBoundState);
            if (bindSubjectPairing.length > 0) {
                clientPageJSText += "binds:{";
    
                for (const [bind, subjects] of bindSubjectPairing) {
                    clientPageJSText += `${bind}:[`;
    
                    for (const subject of subjects) {
                        if (typeof subject.value === "string") {
                            clientPageJSText += `{id:${subject.id},value:${JSON.stringify(subject.value)}},`;
                        } else {
                            clientPageJSText += `{id:${subject.id},value:${JSON.stringify(subject.value)}},`;
                        }
                    }
    
                    clientPageJSText += "]";
                }
    
                clientPageJSText += "},";
            }
        }
    
        const stateObjectAttributes = objectAttributes.filter(oa => oa.type === ObjectAttributeType.STATE);
    
        if (stateObjectAttributes.length > 0) {
            const processed = [...stateObjectAttributes].map((soa: any) => {
                delete soa.type
                return soa;
            });
    
            clientPageJSText += `soa:${JSON.stringify(processed)},`
        }
    
        const observerObjectAttributes = objectAttributes.filter(oa => oa.type === ObjectAttributeType.OBSERVER);
        if (observerObjectAttributes.length > 0) {
            let observerObjectAttributeString = "ooa:[";
    
            for (const observerObjectAttribute of observerObjectAttributes) {
                const ooa = observerObjectAttribute as unknown as {
                    key: string,
                    refs: {
                        id: number,
                        bind: string | undefined,
                    }[],
                    attribute: string,
                    update: (...value: any) => any,
                };
    
                observerObjectAttributeString += `{key:${ooa.key},attribute:"${ooa.attribute}",update:${ooa.update.toString()},`;
                observerObjectAttributeString += `refs:[`;
    
                for (const ref of ooa.refs) {
                    observerObjectAttributeString += `{id:${ref.id}`;
                    if (ref.bind !== undefined) observerObjectAttributeString += `,bind:${ref.bind}`;
    
                    observerObjectAttributeString += "},";
                }
    
                observerObjectAttributeString += "]},";
            }
    
            observerObjectAttributeString += "],";
            clientPageJSText += observerObjectAttributeString;
        }
    
        if (pageLoadHooks.length > 0) {
            clientPageJSText += "lh:[";
    
            for (const loadHook of pageLoadHooks) {
                const key = loadHook.bind
    
                clientPageJSText += `{fn:${loadHook.fn},bind:"${key || ""}"},`;
            }
    
            clientPageJSText += "],";
        }
    
        clientPageJSText += `};`;
    }
    
    clientPageJSText += "if(!globalThis.pd) { globalThis.pd = {}; globalThis.pd[url] = data}";

    const pageDataPath = path.join(pageLocation, `${pageName}_data.js`);

    let sendHardReloadInstruction = false;

    const transformedResult = await esbuild.transform(clientPageJSText, { minify: true, }).catch((error) => {
        console.error("Failed to transform client page js!", error)
    });
    
    if (!transformedResult) return { sendHardReloadInstruction }

    fs.writeFileSync(pageDataPath, transformedResult.code, "utf-8",)

    return { sendHardReloadInstruction, }
};

export const buildDynamicPage = async (
    filePath: string,
    DIST_DIR: string,
) => {
    initializeState();
    initializeObjectAttributes();
    resetLoadHooks();
    
    let pageElements;
    let metadata;
    
    try {
        
        const {
            construct
        } = await import("file://" + filePath);
        
        const {
            page,
            metadata: pageMetadata,
            isDynamicPage,
        } = construct()
        
        pageElements = page;
        metadata = pageMetadata;
        
        // don't render dynamic pages
        if (isDynamicPage === false) {
            throw new Error("Cannot dynamically render a non-dynamic page.");
        }
    } catch(e) {
        throw new Error(`Error in Dynamic Page: ${filePath} - ${e}`);
    }
    
    if (
        !metadata ||
        metadata && typeof metadata !== "function"
    ) {
        console.warn(`WARNING: Dynamic ${filePath} does not export a metadata function. This is *highly* recommended.`);
    }

    if (!pageElements) {
        console.warn(`WARNING: Dynamic ${filePath} should export a const page, which is of type BuiltElement<"body">.`);
    }
    
    if (typeof pageElements === "function") {
        pageElements = pageElements();
    }

    const state = getState();
    const pageLoadHooks = getLoadHooks();
    const objectAttributes = getObjectAttributes();
    
    const foundObjectAttributes = await generateSuitablePageElements(
        path.dirname(filePath),
        pageElements || (body()),
        metadata ?? (() => head()),
        DIST_DIR,
        "page",
    ) as { objectAttributes: any[], resultHTML: string, }

    await generateClientPageData(
        path.dirname(filePath),
        state || {},
        [...objectAttributes, ...foundObjectAttributes.objectAttributes],
        pageLoadHooks || [],
        DIST_DIR,
        "page"
    );

    return foundObjectAttributes.resultHTML
};