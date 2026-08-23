import "./reset.css";

//!force-bundling
import "./keep.css";

//!allow-bundling
import { format } from "./utils";

const unusedVar = 42;

export default function Layout() {
    return <div onClick={() => console.log(format("hi"))}>hello</div>;
}
