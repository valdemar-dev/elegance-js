import { fileURLToPath } from "url";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { parseMarkdownToElements } from "../../utils/markdown";
import { raw, loadHook, EleganceElement, Link } from "elegance-js";

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
                        tocLinks.forEach(link => link.classList.remove("opacity-30"));
                        tocLink.classList.add("opacity-30");
                    }
                });
            },
            { rootMargin: "-10% 0px -90% 0px" } 
        );

        headings.forEach(h => observer.observe(h));

        return () => {
            headings.forEach(h => observer.unobserve(h));
        }
    }, [])

    const tocHeadings = headings.map((h: EleganceElement<"h2", true>) => Link({
        href: "#" + h.options.id,
    },  
        ...h.children,
    ))

    return div({
        className: "sticky self-start top-0 p-8 h-screen",
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


export function page({ params }: { params: { page: string } }) {
    const page = params.page;

    const desiredFile = encodeURI(page);
    const filePath = path.join(__dirname, "..", "content", `./${desiredFile}.md`)

    if (!existsSync(filePath)) return div("not found");

    const content = readFileSync(filePath).toString();

    const elems = parseMarkdownToElements(content);

    return div({
        className: "grid h-full w-full grid-cols-[minmax(300px,700px)_minmax(300px,1fr)]",
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