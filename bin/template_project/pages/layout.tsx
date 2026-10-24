
/**
 * This is the root layout of your site.
 * 
 * Each directory can have 1 layout, and they apply recursively.
 * A layout is used to *wrap* the HTML of a page.
 * 
 * It's commonly used for shared UI elements like navbars.
 * 
 * Each layout should use `<Child/>` to denote where the next layout / page will go.
 */
export default async function Layout({ child: Child }: { child: () => Promise<VirtualNode> }) {
    return <div>
        <Child/>
    </div>
}