export const resetLayouts = () => globalThis.__SERVER_CURRENT_LAYOUTS__ = new Map();
export const getLayouts = () => globalThis.__SERVER_CURRENT_LAYOUTS__;

if (!globalThis.__SERVER_CURRENT_LAYOUT_ID__) globalThis.__SERVER_CURRENT_LAYOUT_ID__ = 1;

export const createLayout = (name: string) => {
    process.emitWarning(
        'Function createLayout() is deprecated. Prefer layout.ts files instead.',
        { type: 'DeprecationWarning' }
    );

    const layouts = globalThis.__SERVER_CURRENT_LAYOUTS__;

    if (layouts.has(name)) return layouts.get(name)!;

    const id = globalThis.__SERVER_CURRENT_LAYOUT_ID__ += 1;

    layouts.set(name, id);

    return id;
};
