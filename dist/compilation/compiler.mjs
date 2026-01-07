import path from "path";
import crypto from "crypto";
import { EleganceElement, invalidElementError, SpecialElementOption } from "../elements/element";
let compilerOptions;
function setCompilerOptions(newOptions) {
  compilerOptions = newOptions;
}
function generateId(compilationContext) {
  compilationContext.idCounter += 1;
  const id = crypto.createHash("sha256").update(compilationContext.pathname + ":" + compilationContext.idCounter.toString()).digest("base64url").slice(0, 11);
  return id;
}
function getElementKey(compilationContext, element) {
  if (element.key) return element.key;
  element.key = generateId(compilationContext);
  return element.key;
}
function generatePageCompilationContext(pathname) {
  const modulePath = path.join(compilerOptions.pagesDirectory, pathname);
  return {
    pathname,
    modulePath,
    idCounter: 0
  };
}
function serializeEleganceElement(compilationContext, element) {
  let serializedElement = "";
  let specialOptions = [];
  serializedElement += `<${element.tag}`;
  {
    const options = Object.entries(element.options);
    element.options["key"] = getElementKey(compilationContext, element);
    if (options.length > 0) {
      for (const [optionName, optionValue] of options) {
        serializedElement += ` ${optionName}="${optionValue}"`;
      }
    }
  }
  serializedElement += ">";
  {
    if (element.children === null) {
      return { serializedElement, specialOptions };
    }
    if (element.children.length > 0) {
      for (const child of element.children) {
        const result = serializeElement(compilationContext, child);
        serializedElement += result.serializedElement;
        specialOptions.push(...result.specialOptions);
      }
    }
  }
  serializedElement += `</${element.tag}>`;
  return { serializedElement, specialOptions };
}
function serializeElement(compilationContext, element) {
  let specialOptions = [];
  let serializedElement;
  switch (typeof element) {
    case "object":
      if (Array.isArray(element)) {
        serializedElement = element.join(", ");
        break;
      }
      if (element instanceof EleganceElement) {
        const entries = Object.entries(element.options);
        for (const [optionName, optionValue] of entries) {
          if (optionValue instanceof SpecialElementOption) {
            const { clientToken } = optionValue.serialize(element, optionName);
          }
        }
        const result = serializeEleganceElement(compilationContext, element);
        serializedElement = result.serializedElement;
        specialOptions = result.specialOptions;
        break;
      }
      throw invalidElementError(element, "Arbitrary objects are not valid children.");
    case "boolean":
      serializedElement = `${element}`;
      break;
    case "number":
      serializedElement = element.toString();
      break;
    case "string":
      serializedElement = element;
      break;
    default:
      throw invalidElementError(element, "The typeof of this element as not one of EleganceElement, boolean, number, string or Array. Please convert it into one of these types.");
  }
  return { serializedElement, specialOptions };
}
export {
  generatePageCompilationContext,
  serializeElement,
  setCompilerOptions
};
