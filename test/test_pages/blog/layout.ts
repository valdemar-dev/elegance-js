
export const layout = (child: any) => {
    return ul(li(child));
};

export const metadata = () => {
    return [
        title("this is blog layout"),
    ];
};

export const isDynamic = false;