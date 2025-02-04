

export const metadata = () => {
    return head ({},
        link ({
            rel: "stylesheet",
            href: "/index.css"
        }),
        title ("Hi There!")
    )
}
