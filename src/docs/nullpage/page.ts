import { createEventListener, createState } from "../../server/createState";

createEventListener({
    dependencies: [],
    eventListener: (params) => {
    },
});

export const metadata = () => head ({
},
    link ({
        rel: "stylesheet",
        href: "/index.css"
    }),
    title ("Hi There!")
)

export const page = body({
    class: "bg-green-400"
});
