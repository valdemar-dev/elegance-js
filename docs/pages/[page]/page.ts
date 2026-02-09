import { fileURLToPath } from "url";
import path from "path";
import { existsSync, readdirSync, readFileSync } from "fs";
import { parseMarkdownToElements } from "../../utils/markdown";
import { raw, loadHook, EleganceElement, Link, getQuery } from "elegance-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function tableOfContents(elems: EleganceElement<any, any>[]) {
    const headings = elems.filter((e) => e.tag === "h2");

    loadHook(() => {
        const headings = document.querySelectorAll("h2[id]");
        const tocLinks = document.querySelectorAll("#toc a");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const id = entry.target.id;

                    const tocLink = document.querySelector(`#toc a[href="#${id}"]`)!;

                    if (entry.isIntersecting) {
                        tocLinks.forEach(link => {
                            link.classList.remove("dark:opacity-70")
                            link.classList.remove("opacity-30");
                        });

                        tocLink.classList.add("dark:opacity-70");
                        tocLink.classList.add("opacity-30");
                    }
                });
            },
            { rootMargin: "-0% 0px -90% 0px" } 
        );

        headings.forEach(h => observer.observe(h));

        return () => {
            headings.forEach(h => observer.unobserve(h));
        }
    }, [])

    const tocHeadings = headings.map((h: EleganceElement<"h2", true>) => Link({
        className: "duration-200",
        href: "#" + h.options.id,
    },  
        ...h.children,
    ))

    return div({
        className: "md:sticky w-screen md:w-auto self-start pb-8 mb-8 md:border-b-0 border-b-[1px] border-[#00000033] dark:border-[#ffffff33] md:mb-0 top-0 p-4 md:p-8 md:h-screen",
    },
        h3({
            className: "text-lg font-semibold pb-2"
        },
            "Table of Contents",
        ),

        div({
            id: "toc",
            className: "flex flex-col gap-2",
        },
            ...tocHeadings,
        ),
    )
}

export function enumerateRoutes() {
    const pathname = path.join(__dirname, "..", "content")

    const entries = readdirSync(pathname, { withFileTypes: true, })

    return entries.map
}

export function page({ params }: { params: { page: string } }) {
    const page = params.page;

    const desiredFile = encodeURI(page);
    const filePath = path.join(__dirname, "..", "content", `./${desiredFile}.md`)

    if (!existsSync(filePath)) return div("not found");

    const content = readFileSync(filePath).toString();

    const elems = parseMarkdownToElements(content);

    return div({
        className: "flex flex-col-reverse md:grid h-full w-full md:grid-cols-[minmax(300px,700px)_minmax(300px,1fr)]",
    },
        article({
            className: "m-4 lg:mt-8 pb-[300px]",
        },
            ...elems
        ),

        tableOfContents(elems),
    );
}

export function metadata({ params }: { params: { page: string }}) {
    const page = params.page;

    const desiredFile = encodeURI(page);
    const filePath = path.join(__dirname, "..", "content", `./${desiredFile}.html`)

    if (!existsSync(filePath)) return [
        title("Elegance.JS"),
    ];
    
    const content = readFileSync(filePath).toString();

    return [raw(content)];
}

export const isDynamic = true;