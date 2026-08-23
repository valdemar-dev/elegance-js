export default function Page() {
    return (
        <div onClick={() => setCount(count + 1)}>
            <button onClick={handleClick} onKeyDown={handleKey}>Go</button>
        </div>
    );
}
