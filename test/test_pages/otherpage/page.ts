import { state } from "../../../src/client/state";

export const page = () => {
    state("1");
    state("2");
    state("3");
    state("4");
    state("5");
    state("6");

    return div("This is other-page");

};

export const metadata = () => {
    return []
};