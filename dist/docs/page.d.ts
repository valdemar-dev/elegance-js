import { serverState as headerState } from "./components/Header";
export declare const state: {
    hasUserScrolled: {
        value: boolean;
        id: number;
        type: import("../helpers/ObjectAttributeType").ObjectAttributeType.STATE;
    };
    interval: {
        value: number;
        id: number;
        type: import("../helpers/ObjectAttributeType").ObjectAttributeType.STATE;
    };
    globalTicker: {
        value: number;
        id: number;
        type: import("../helpers/ObjectAttributeType").ObjectAttributeType.STATE;
    };
    cum: {
        value: string;
        id: number;
        type: import("../helpers/ObjectAttributeType").ObjectAttributeType.STATE;
    };
};
export declare const pageLoadHooks: ((state: State<typeof headerState>) => void)[];
export declare const page: BuiltElement<"body">;
