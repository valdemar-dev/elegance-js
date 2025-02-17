import { RootLayout } from "../../components/RootLayout";
import { PageHeading } from "../components/PageHeading";
import { DocsLayout } from "../components/DocsLayout";

export const page = RootLayout (
    DocsLayout (
        PageHeading (
            "hii",
            "preamble",
        ), 

        div ({
            class: "h-[3000px]"
        })
    ),
);
