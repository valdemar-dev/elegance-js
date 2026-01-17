const page = () => {
    return div({
        class: "hi",
    },
        p({}, [1, "", undefined]),
        2, 
        undefined,
        "hi"
    )
};

const metadata = () => {
    return div(undefined)
};

export {
    page,
    metadata,
}