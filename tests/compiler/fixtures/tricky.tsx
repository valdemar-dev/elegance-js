const svgIcon = (
    <svg viewBox="0 0 24 24">
        <path d="M0 0h24v24H0z" fill="none" />
    </svg>
);

export default function Page() {
    const list = [1, 2, 3];
    return (
        <div>
            {list.map((n: number) => (
                <span data-index={n}>{n}</span>
            ))}
            <input type="text" aria-label="Name" autoComplete="off" />
            {[<b key="a">B</b>, <i key="b">I</i>]}
        </div>
    );
}
