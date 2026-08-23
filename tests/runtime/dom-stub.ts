export function installDomStub(): void {
    const g = globalThis as any;
    const noop = () => {};
    const location = { pathname: "/", search: "", hash: "", origin: "http://localhost" };

    g.location = location;
    g.window = { location, addEventListener: noop };
    g.document = {
        querySelector: () => null,
        addEventListener: noop,
    };
    g.requestAnimationFrame = () => 0;
}
