import { RootLayout } from "../components/RootLayout";
import { PageHeading } from "./components/PageHeading";
import { DocsLayout } from "./components/DocsLayout";

export const page = RootLayout (
    DocsLayout (
        PageHeading ("Getting Started", "#getting-started"), 
    ),
);
