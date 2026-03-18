/**
 * This page would match /recipe/apple or /recipes/cake or something like that
 */
export function page() {


    return div("this is the catch-all for recipeName");
}

export function metadata() {}

export const isDynamic = true;