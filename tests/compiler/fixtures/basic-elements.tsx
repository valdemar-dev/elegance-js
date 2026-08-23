export default function Home() {
    return (
        <div className="container" data-active>
            <h1>Hello world</h1>
            <button disabled={false}>Click me</button>
            <img src="/logo.png" alt="Logo" />
            <div {...props}>tail</div>
        </div>
    );
}
