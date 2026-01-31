export function page({ params }: { params: any }) {
    return div("caught by *catchall*", params.catchall)
}

export function metadata() {}

export const isDynamic = true;