declare const NoProps: symbol;

type Descriptor<S> = LiveComponentDescriptor<S> | ElementDescriptor<any, S>;

type Callback<S> = (state: S, event: any) => Promise<void> | void;
type Callbacks<S> = Record<string, Callback<S>>;

type RenderCallback<S> = (state: S, callbacks: Callbacks<S>) => VirtualNode<S>;
type StateCallback<S> = () => Promise<S> | S;
type InitCallback<S> = (state: S) => void | Promise<void>;

declare global {
    type LiveComponentDescriptor<S = any> = {
        __type: "live";
        __componentId: string;
        __definition: {
            state: StateCallback<S>;
            callbacks: Callbacks<S>;
            render: RenderCallback<S>;
            serverInit: InitCallback<S>;
        };
        props: Record<string, unknown>;
    };

    type VirtualNode<S = any> = number | string | Descriptor<S> | Array<VirtualNode<S>> | null | false;

    var atom: <T>(initial: T) => Atom<T>;
    var view: <F extends (...args: any[]) => any>(fn: F) => F;

    var component: <
        Props = typeof NoProps,
        A extends Record<string, any> = {}
    >(
        config: ComponentConfig<
            Props extends typeof NoProps ? {} : Props,
            A
        >
    ) => ComponentGenerator<Props, A>;

    interface Atom<T> {
        get value(): T;
        set value(value: T);
        readonly id: string;
    }

    var rawHTML: (content: string) => VirtualNode<string>;

    type ComponentSelf<
        Props = Record<string, unknown>,
        A extends Record<string, any> = any
    > = {
        props: Props;
        root?: Element;
    };

    type AtomsOf<A extends Record<string, any>> = {
        [K in keyof A]: Atom<A[K]>;
    };

    type ViewFn<
        Props = Record<string, unknown>,
        A extends Record<string, any> = any
    > = (params: {
        self: ComponentSelf<Props, A>,
        atoms: AtomsOf<A>,
        children: Array<VirtualNode>,
    }) => (LiveComponentDescriptor | ElementDescriptor | null | false | JSX.Element);
 
    type OnPageLoadOptions = {
        type?: "scoped" | "unscoped",
    };

    var onPageLoad: (callback: () => void, options?: OnPageLoadOptions) => void;

    type onMountCleanup = () => (void | Promise<void>);

    interface ComponentConfig<
        Props = Record<string, unknown>,
        A extends Record<string, any> = {}
    > {
        view: ViewFn<Props, A>;
        atoms?: A;
        init?: (self: ComponentSelf<Props, A>, atoms: AtomsOf<A>) => void | Promise<void>;

        /**
         * The `onMount` method of a component is triggered whenever the component *appears* in the DOM.
         *
         * It does *not* trigger for subsequent navigations or re-renders.
         *
         * However, if the component is removed and then re-appears, onMount is called again.
         */
        onMount?: (self: ComponentSelf<Props, A>, atoms: AtomsOf<A>) => void | Promise<void> | onMountCleanup;
        /**
         * The `onUnMount` method of a component is triggered whenever the component *is removed* from the DOM.
         */
        onUnmount?: (self: ComponentSelf<Props, A>, atoms: AtomsOf<A>) => void | Promise<void>;
        /**
         * The `onNavigate` method of a component is triggered *after* local navigation has occured and the page has loaded.
         *
         * It is *also* triggered once after the initial page load, since it is technically a navigation.
         */
        onNavigate?: (self: ComponentSelf<Props, A>, atoms: AtomsOf<A>) => void | Promise<void> | onMountCleanup;
        __id?: string;
    }

    type Page = (...props: any) => VirtualNode;

    var track: <T>(atom: Atom<T>, callback: (value: T) => void) => void;
    var untrack: <T>(atom: Atom<T>, callback: (value: T) => void) => void;

    type ComponentGenerator<
        Props = typeof NoProps,
        A extends Record<string, any> = {}
    > = {
        (...args: Props extends typeof NoProps ? [] : [props: Props]): LiveComponentDescriptor;
        __config: ComponentConfig<
            Props extends typeof NoProps ? {} : Props,
            A
        >;
    };

    type SelfOf<C> = C extends ComponentGenerator<infer Props, infer A>
        ? {
              self: ComponentSelf<
                  Props extends typeof NoProps ? {} : Props,
                  A
              >;
              atoms: AtomsOf<A>;
          }
        : never;

    var createElement: (
        tag: string | ((props: Record<string, any>) => JSX.Element),
        props: Record<string, any> | null,
        ...children: any[]
    ) => JSX.Element;
}

export {};