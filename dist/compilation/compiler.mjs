import path from "path";
import { EleganceElement, invalidElementError, SpecialElementOption } from "../elements/element";
let compilerOptions;
function setCompilerOptions(newOptions) {
  compilerOptions = newOptions;
}
function generateID(compilationContext) {
  compilationContext.idCounter += 1;
}
function generatePageCompilationContext(pathname) {
  const modulePath = path.join(compilerOptions.pagesDirectory, pathname);
  return {
    pathname,
    modulePath,
    idCounter: 0
  };
}
function serializeEleganceElement(element) {
  let serializedElement = "";
  let specialOptions = [];
  serializedElement += `<${element.tag}`;
  const options = Object.entries(element.options);
  if (options.length > 0) {
    for (const [optionName, optionValue] of options) {
      serializedElement += ` ${optionName}="${optionValue}"`;
    }
  }
  if (element.children === null) {
    serializedElement += ">";
    return { serializedElement, specialOptions };
  }
  if (element.children.length > 0) {
    for (const child of element.children) {
      const result = serializeElement(child);
      serializedElement += result.serializedElement;
      specialOptions.push(...result.specialOptions);
    }
  }
  serializedElement += `</${element.tag}>`;
  return { serializedElement, specialOptions };
}
function serializeElement(element) {
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
            optionValue.process(element, optionName);
          }
        }
        const result = serializeEleganceElement(element);
        serializedElement = result.serializedElement;
        specialOptions = result.specialOptions;
      }
      serializedElement = JSON.stringify(element);
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
      throw invalidElementError(element, "The typeof of this element as not one of object, boolean, number, string or array. Please convert it into one of these types");
  }
  return { serializedElement, specialOptions };
}
export {
  setCompilerOptions
};
