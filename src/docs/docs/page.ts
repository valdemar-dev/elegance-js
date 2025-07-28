import { RootLayout } from "../components/RootLayout";
import { PageHeading } from "./components/PageHeading";
import { DocsLayout } from "./components/DocsLayout";
import { createLoadHook } from "../../server/loadHook";

export const metadata = () => head ({
},
    link ({
        rel: "stylesheet",
        href: "/index.css"
    }),
    title ("Hi There!")
)

createLoadHook({
    fn: () => {
        client.navigateLocally(window.location.href + "/basics", true)
    },
})

export const page = RootLayout ();
