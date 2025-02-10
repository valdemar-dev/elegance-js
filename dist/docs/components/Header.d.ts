export declare const serverState: {
    hasUserScrolled: {
        value: boolean;
        id: number;
        type: import("../../helpers/ObjectAttributeType").ObjectAttributeType.STATE;
    };
    interval: {
        value: number;
        id: number;
        type: import("../../helpers/ObjectAttributeType").ObjectAttributeType.STATE;
    };
    globalTicker: {
        value: number;
        id: number;
        type: import("../../helpers/ObjectAttributeType").ObjectAttributeType.STATE;
    };
};
export declare const pageLoadHooks: ((state: State<typeof serverState>) => void)[];
export declare const Header: () => BuiltElement<"header">;
