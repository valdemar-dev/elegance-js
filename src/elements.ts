import type { PrimitiveElementOptionsOrChild } from "./types";

export function makeEl<T extends AnyTag>(tagName: T): ElementGenerator<T> {
    return function <S>(
        options?: PrimitiveElementOptionsOrChild<T, S>,
        ...children: Array<VirtualNode<S>>
    ): ElementDescriptor<T, S> {
        const isOptions =
            typeof options === "object" &&
            options !== null &&
            !Array.isArray(options) &&
            !("__type" in (options as any));

        return {
            __type: "element",
            tag: tagName,
            options: isOptions ? (options as Record<string, any>) : {},
            children: isOptions
                ? children
                : [options as VirtualNode<S>, ...children],
        };
    };
}