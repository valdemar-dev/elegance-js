import { RootLayout } from "../../components/RootLayout";
import { DocsLayout } from "../components/DocsLayout";
import { PageHeading } from "../components/PageHeading";

export const page = RootLayout (
    DocsLayout (
        PageHeading ("Load Hooks", "load-hooks"),
    )
)
