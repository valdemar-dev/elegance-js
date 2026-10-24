
/**
 * This is a 404 page. You can use any htmlCode.ts(x) to export a page,
 * and that page will be shown if a request returns a non 200 code.
 * 
 * For example, if a request would return 403, Elegance will attempt to show 403.ts(x) if it exists.
 */
export default function Page() {
    return <div>Oops! This page doesn't exist.</div>
}