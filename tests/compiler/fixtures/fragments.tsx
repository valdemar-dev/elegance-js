export default function Page({ items, cond }: any) {
    return (
        <>
            <header>Top</header>
            {items.map((i: any) => (
                <li key={i.id}>{i.name}</li>
            ))}
            {cond ? <span>A</span> : <span>B</span>}
        </>
    );
}
