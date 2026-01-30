import { Child, } from "elegance-js";

export function layout({ child, props }: { child: Child, props: { counter: number, }}) {
    props.counter += 1;
    
    return div( child(props) );
}

export function metadata() {
    return [];
}