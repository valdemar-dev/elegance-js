import { RootLayout } from "../components/RootLayout";
import { PageHeading } from "./components/PageHeading";
import { DocsLayout } from "./components/DocsLayout";

export const metadata = () => head ({
},
    link ({
        rel: "stylesheet",
        href: "/index.css"
    }),
    title ("Hi There!")
)

export const page = RootLayout (
    DocsLayout (
        PageHeading ("Getting Started", "#getting-started"), 
    ),
);
