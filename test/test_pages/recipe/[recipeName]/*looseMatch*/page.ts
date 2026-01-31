/**
 * This page would match /recipe/apple/SOMETHING_ELSE/FOREVERAND/EVER
 */
export function page() {

    return div("this is loose-match for [recipeName]/*looseMatch*");
}

export function metadata() {}

export const isDynamic = true;