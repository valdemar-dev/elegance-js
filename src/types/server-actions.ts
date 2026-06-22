import type { IncomingMessage, ServerResponse } from "node:http";

declare global {
    type StringSchema = {
        type: "string";
        required?: boolean;
        length?: [number, number];
        regex?: RegExp;
        enum?: string[];
    };

    type NumberSchema = {
        type: "number";
        required?: boolean;
        min?: number;
        max?: number;
        integer?: boolean;
    };

    type BooleanSchema = {
        type: "boolean";
        required?: boolean;
    };

    type ArraySchema = {
        type: "array";
        required?: boolean;
        length?: [number, number];
        items?: PropSchema;
    };

    type PropSchema = StringSchema | NumberSchema | BooleanSchema | ArraySchema;

    type InferPropType<T extends PropSchema> =
        T extends StringSchema ? string :
        T extends NumberSchema ? number :
        T extends BooleanSchema ? boolean :
        T extends ArraySchema
        ? T["items"] extends PropSchema
        ? InferPropType<T["items"]>[]
        : unknown[]
        : never;

    type InferProps<TSchema extends Record<string, PropSchema>> =
        & { [K in keyof TSchema as TSchema[K]["required"] extends false ? never : K]: InferPropType<TSchema[K]> }
        & { [K in keyof TSchema as TSchema[K]["required"] extends false ? K : never]?: InferPropType<TSchema[K]> };

        
    interface ActionContext {
        req: IncomingMessage;
        res: ServerResponse;
    }

    type WithContext<TProps> = [TProps] extends [never] ? ActionContext : TProps & ActionContext;

    interface ServerActionDefinitionTyped<
        TSchema extends Record<string, PropSchema>,
        TReturn,
    > {
        props: TSchema;
        callback(args: InferProps<TSchema> & ActionContext): TReturn;
    }


    interface ServerActionDefinitionUntyped<TProps, TReturn> {
        callback(args: WithContext<TProps>): TReturn;
    }

    interface RuntimeServerActionDefinition  {
        props?: Record<string, any>
        callback(params: Record<string, any>): any;
        id: string
    }

    type ServerActionFn<TProps, TReturn> =
        [TProps] extends [never]
        ? () => Promise<TReturn>
        : (args: TProps) => Promise<TReturn>;

    function serverAction<
        TSchema extends Record<string, PropSchema>,
        TReturn = void,
    >(
        def: ServerActionDefinitionTyped<TSchema, TReturn>
    ): ServerActionFn<InferProps<TSchema>, TReturn>;

    function serverAction<TReturn = void>(
        def: ServerActionDefinitionUntyped<never, TReturn>
    ): ServerActionFn<never, TReturn>;

    function serverAction<TProps = any, TReturn = void>(
        def: ServerActionDefinitionUntyped<TProps, TReturn>
    ): ServerActionFn<TProps, TReturn>;

    var __serverActions: RuntimeServerActionDefinition[];
}

export {};