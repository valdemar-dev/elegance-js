import { RootLayout } from "../../components/RootLayout";
import { PageHeading } from "../components/PageHeading";
import { DocsLayout } from "../components/DocsLayout";

export const page = RootLayout (
    DocsLayout (
        PageHeading (
            "Preamble",
            "preamble",
        ), 

        div ({
            class: "h-[3000px]"
        }, []),

        PageHeading (
            "Install",
            "installation",
        ), 

        div ({
            class: "h-[3000px]"
        }, []),


    ),
);
