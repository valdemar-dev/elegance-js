
/**
 * This is a custom component. It's re-usable, and most of it's code is shipped to the browser.
 * It's view function is called to generate the displayed HTML.
 * 
 * Each component can have atoms, which are per-instance reactive variables.
 * 
 * Whenever a component's atoms' value updates, the component re-calls view.
 */
const Counter = component({
    atoms: {
        counter: 0,
    },
    view({ atoms: { counter }}) {
        return <button>Counter is at: {counter.value}</button>
    },
});

/**
 * This is a global atom. Unlike component atoms, it is not instance-specific.
 * 
 * Any component that references a global atom's value in it's view method will be re-drawn after the atom changes value.
 */
const welcomeMessage = atom("Welcome to Elegance!");

/**
 * This is a page constructor function, it is called during the render of this page. Whatever it returns is the displayed <body> of the page.
 * The content in it is considered server-side safe.
 */
export default function Page() {
    return <div>
        <h1>
            {welcomeMessage.value}
        </h1>

        <p>
            Edit page.tsx to get started.
        </p>

        <Counter/>
    </div>
}

/**
 * This function generates the given page's metadata, like title, stylesheets links, etc.
 * 
 * This metadata accumulates from the root layout downward.
 */
export function metadata() {
    return [
        <title>The real fun begins now!</title>
    ]
}