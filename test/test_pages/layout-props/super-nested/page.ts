export function page({ counter }: { counter: number }) {
    counter += 1;

    return div("counter ended up being:", counter);
}

export function metadata() {
    return [];
}

export const isDynamic = true;