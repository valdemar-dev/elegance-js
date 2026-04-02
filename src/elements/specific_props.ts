import type { MaybeSpecial } from "./element";

export type SpecificPropsMap = {
    a: {
        href?: MaybeSpecial<string>;
        target?: MaybeSpecial<string>;
        download?: MaybeSpecial<string>;
        rel?: MaybeSpecial<string>;
        ping?: MaybeSpecial<string>;
        referrerpolicy?: MaybeSpecial<string>;
        type?: MaybeSpecial<string>;
    };
    abbr: {};
    address: {};
    area: {
        alt?: MaybeSpecial<string>;
        coords?: MaybeSpecial<string>;
        href?: MaybeSpecial<string>;
        shape?: MaybeSpecial<string>;
        target?: MaybeSpecial<string>;
        download?: MaybeSpecial<string>;
        rel?: MaybeSpecial<string>;
        hreflang?: MaybeSpecial<string>;
        referrerpolicy?: MaybeSpecial<string>;
        ping?: MaybeSpecial<string>;
    };
    article: {};
    aside: {};
    audio: {
        src?: MaybeSpecial<string>;
        autoplay?: MaybeSpecial<boolean>;
        controls?: MaybeSpecial<boolean>;
        loop?: MaybeSpecial<boolean>;
        muted?: MaybeSpecial<boolean>;
        preload?: MaybeSpecial<"auto" | "metadata" | "none">;
    };
    b: {};
    bdi: {};
    bdo: {};
    blockquote: {
        cite?: MaybeSpecial<string>;
    };
    body: {};
    button: {
        disabled?: MaybeSpecial<boolean>;
        form?: MaybeSpecial<string>;
        formaction?: MaybeSpecial<string>;
        formenctype?: MaybeSpecial<string>;
        formmethod?: MaybeSpecial<string>;
        formnovalidate?: MaybeSpecial<boolean>;
        formtarget?: MaybeSpecial<string>;
        name?: MaybeSpecial<string>;
        type?: MaybeSpecial<"submit" | "reset" | "button">;
        value?: MaybeSpecial<string>;
    };
    canvas: {
        width?: MaybeSpecial<number | string>;
        height?: MaybeSpecial<number | string>;
    };
    caption: {};
    cite: {};
    code: {};
    col: {
        span?: MaybeSpecial<number>;
    };
    colgroup: {
        span?: MaybeSpecial<number>;
    };
    data: {
        value?: MaybeSpecial<string>;
    };
    datalist: {};
    dd: {};
    del: {
        cite?: MaybeSpecial<string>;
        dateTime?: MaybeSpecial<string>;
    };
    details: {
        open?: MaybeSpecial<boolean>;
    };
    dfn: {};
    dialog: {
        open?: MaybeSpecial<boolean>;
    };
    div: {};
    dl: {};
    dt: {};
    em: {};
    fieldset: {
        disabled?: MaybeSpecial<boolean>;
        form?: MaybeSpecial<string>;
        name?: MaybeSpecial<string>;
    };
    figcaption: {};
    figure: {};
    footer: {};
    form: {
        action?: MaybeSpecial<string>;
        method?: MaybeSpecial<"get" | "post" | "dialog">;
        enctype?: MaybeSpecial<string>;
        novalidate?: MaybeSpecial<boolean>;
        target?: MaybeSpecial<string>;
        autocomplete?: MaybeSpecial<string>;
        name?: MaybeSpecial<string>;
    };
    h1: {};
    h2: {};
    h3: {};
    h4: {};
    h5: {};
    h6: {};
    head: {};
    header: {};
    hgroup: {};
    hr: {};
    html: {
        manifest?: MaybeSpecial<string>;
    };
    i: {};
    iframe: {
        src?: MaybeSpecial<string>;
        srcdoc?: MaybeSpecial<string>;
        name?: MaybeSpecial<string>;
        width?: MaybeSpecial<number | string>;
        height?: MaybeSpecial<number | string>;
        allow?: MaybeSpecial<string>;
        allowfullscreen?: MaybeSpecial<boolean>;
        loading?: MaybeSpecial<"eager" | "lazy">;
        referrerpolicy?: MaybeSpecial<string>;
        sandbox?: MaybeSpecial<string>;
    };
    img: {
        src?: MaybeSpecial<string>;
        alt?: MaybeSpecial<string>;
        srcset?: MaybeSpecial<string>;
        sizes?: MaybeSpecial<string>;
        crossorigin?: MaybeSpecial<"anonymous" | "use-credentials">;
        loading?: MaybeSpecial<"eager" | "lazy">;
        width?: MaybeSpecial<number | string>;
        height?: MaybeSpecial<number | string>;
        decoding?: MaybeSpecial<"sync" | "async" | "auto">;
        referrerpolicy?: MaybeSpecial<string>;
        usemap?: MaybeSpecial<string>;
        ismap?: MaybeSpecial<boolean>;
    };
    input: {
        accept?: MaybeSpecial<string>;
        alt?: MaybeSpecial<string>;
        autocomplete?: MaybeSpecial<string>;
        autofocus?: MaybeSpecial<boolean>;
        checked?: MaybeSpecial<boolean>;
        dirname?: MaybeSpecial<string>;
        disabled?: MaybeSpecial<boolean>;
        form?: MaybeSpecial<string>;
        formaction?: MaybeSpecial<string>;
        formenctype?: MaybeSpecial<string>;
        formmethod?: MaybeSpecial<string>;
        formnovalidate?: MaybeSpecial<boolean>;
        formtarget?: MaybeSpecial<string>;
        height?: MaybeSpecial<number | string>;
        list?: MaybeSpecial<string>;
        max?: MaybeSpecial<number | string>;
        maxlength?: MaybeSpecial<number>;
        min?: MaybeSpecial<number | string>;
        minlength?: MaybeSpecial<number>;
        multiple?: MaybeSpecial<boolean>;
        name?: MaybeSpecial<string>;
        pattern?: MaybeSpecial<string>;
        placeholder?: MaybeSpecial<string>;
        readonly?: MaybeSpecial<boolean>;
        required?: MaybeSpecial<boolean>;
        size?: MaybeSpecial<number>;
        src?: MaybeSpecial<string>;
        step?: MaybeSpecial<number | "any">;
        type?: MaybeSpecial<string>;
        value?: MaybeSpecial<string | number>;
        width?: MaybeSpecial<number | string>;
        capture?: MaybeSpecial<string>;
    };
    ins: {
        cite?: MaybeSpecial<string>;
        dateTime?: MaybeSpecial<string>;
    };
    kbd: {};
    label: {
        for?: MaybeSpecial<string>;
        form?: MaybeSpecial<string>;
    };
    legend: {};
    li: {
        value?: MaybeSpecial<number>;
    };
    link: {
        href?: MaybeSpecial<string>;
        rel?: MaybeSpecial<string>;
        media?: MaybeSpecial<string>;
        hreflang?: MaybeSpecial<string>;
        type?: MaybeSpecial<string>;
        as?: MaybeSpecial<string>;
        crossorigin?: MaybeSpecial<"anonymous" | "use-credentials">;
        imagesizes?: MaybeSpecial<string>;
        imagesrcset?: MaybeSpecial<string>;
        referrerpolicy?: MaybeSpecial<string>;
        sizes?: MaybeSpecial<string>;
    };
    main: {};
    map: {
        name?: MaybeSpecial<string>;
    };
    mark: {};
    menu: {
        type?: MaybeSpecial<string>;
    };
    meta: {
        name?: MaybeSpecial<string>;
        "http-equiv"?: MaybeSpecial<string>;
        content?: MaybeSpecial<string>;
        charset?: MaybeSpecial<string>;
    };
    meter: {
        value?: MaybeSpecial<number>;
        min?: MaybeSpecial<number>;
        max?: MaybeSpecial<number>;
        low?: MaybeSpecial<number>;
        high?: MaybeSpecial<number>;
        optimum?: MaybeSpecial<number>;
    };
    nav: {};
    noscript: {};
    object: {
        data?: MaybeSpecial<string>;
        type?: MaybeSpecial<string>;
        name?: MaybeSpecial<string>;
        form?: MaybeSpecial<string>;
        usemap?: MaybeSpecial<string>;
        typemustmatch?: MaybeSpecial<boolean>;
        width?: MaybeSpecial<number | string>;
        height?: MaybeSpecial<number | string>;
    };
    ol: {
        reversed?: MaybeSpecial<boolean>;
        start?: MaybeSpecial<number>;
        type?: MaybeSpecial<string>;
    };
    optgroup: {
        disabled?: MaybeSpecial<boolean>;
        label?: MaybeSpecial<string>;
    };
    option: {
        value?: MaybeSpecial<string>;
        label?: MaybeSpecial<string>;
        selected?: MaybeSpecial<boolean>;
        disabled?: MaybeSpecial<boolean>;
    };
    output: {
        for?: MaybeSpecial<string>;
        form?: MaybeSpecial<string>;
        name?: MaybeSpecial<string>;
    };
    p: {};
    param: {
        name?: MaybeSpecial<string>;
        value?: MaybeSpecial<string>;
    };
    picture: {};
    pre: {};
    progress: {
        value?: MaybeSpecial<number>;
        max?: MaybeSpecial<number>;
    };
    q: {
        cite?: MaybeSpecial<string>;
    };
    rp: {};
    rt: {};
    ruby: {};
    s: {};
    samp: {};
    script: {
        src?: MaybeSpecial<string>;
        type?: MaybeSpecial<string>;
        async?: MaybeSpecial<boolean>;
        defer?: MaybeSpecial<boolean>;
        crossorigin?: MaybeSpecial<"anonymous" | "use-credentials">;
        nomodule?: MaybeSpecial<boolean>;
        integrity?: MaybeSpecial<string>;
        referrerpolicy?: MaybeSpecial<string>;
    };
    section: {};
    select: {
        name?: MaybeSpecial<string>;
        size?: MaybeSpecial<number>;
        multiple?: MaybeSpecial<boolean>;
        disabled?: MaybeSpecial<boolean>;
        required?: MaybeSpecial<boolean>;
        autofocus?: MaybeSpecial<boolean>;
        form?: MaybeSpecial<string>;
        autocomplete?: MaybeSpecial<string>;
    };
    slot: {};
    small: {};
    source: {
        src?: MaybeSpecial<string>;
        type?: MaybeSpecial<string>;
        media?: MaybeSpecial<string>;
        srcset?: MaybeSpecial<string>;
        sizes?: MaybeSpecial<string>;
    };
    span: {};
    strong: {};
    style: {
        media?: MaybeSpecial<string>;
        type?: MaybeSpecial<string>;
    };
    sub: {};
    summary: {};
    sup: {};
    table: {};
    tbody: {};
    td: {
        colSpan?: MaybeSpecial<number>;
        rowSpan?: MaybeSpecial<number>;
        headers?: MaybeSpecial<string>;
        scope?: MaybeSpecial<string>;
        abbr?: MaybeSpecial<string>;
    };
    template: {};
    textarea: {
        name?: MaybeSpecial<string>;
        rows?: MaybeSpecial<number>;
        cols?: MaybeSpecial<number>;
        placeholder?: MaybeSpecial<string>;
        maxlength?: MaybeSpecial<number>;
        pattern?: MaybeSpecial<string>;
        minlength?: MaybeSpecial<number>;
        required?: MaybeSpecial<boolean>;
        disabled?: MaybeSpecial<boolean>;
        readonly?: MaybeSpecial<boolean>;
        autofocus?: MaybeSpecial<boolean>;
        form?: MaybeSpecial<string>;
        dirname?: MaybeSpecial<string>;
        wrap?: MaybeSpecial<"soft" | "hard">;
    };
    tfoot: {};
    th: {
        colSpan?: MaybeSpecial<number>;
        rowSpan?: MaybeSpecial<number>;
        headers?: MaybeSpecial<string>;
        scope?: MaybeSpecial<string>;
        abbr?: MaybeSpecial<string>;
    };
    thead: {};
    time: {
        dateTime?: MaybeSpecial<string>;
    };
    title: {};
    tr: {};
    track: {
        kind?: MaybeSpecial<string>;
        src?: MaybeSpecial<string>;
        srclang?: MaybeSpecial<string>;
        label?: MaybeSpecial<string>;
        default?: MaybeSpecial<boolean>;
    };
    u: {};
    ul: {};
    varElement: {};
    video: {
        src?: MaybeSpecial<string>;
        poster?: MaybeSpecial<string>;
        width?: MaybeSpecial<number | string>;
        height?: MaybeSpecial<number | string>;
        autoplay?: MaybeSpecial<boolean>;
        controls?: MaybeSpecial<boolean>;
        loop?: MaybeSpecial<boolean>;
        muted?: MaybeSpecial<boolean>;
        playsinline?: MaybeSpecial<boolean>;
        preload?: MaybeSpecial<"auto" | "metadata" | "none">;
    };
    svg: {
        xmlns?: MaybeSpecial<string>;
        viewBox?: MaybeSpecial<string>;
        preserveAspectRatio?: MaybeSpecial<string>;
    };
    g: {
        transform?: MaybeSpecial<string>;
    };
    text: {
        x?: MaybeSpecial<string | number>;
        y?: MaybeSpecial<string | number>;
        dx?: MaybeSpecial<string | number>;
        dy?: MaybeSpecial<string | number>;
        rotate?: MaybeSpecial<string | number>;
        textLength?: MaybeSpecial<string | number>;
        lengthAdjust?: MaybeSpecial<"spacing" | "spacingAndGlyphs">;
    };
    tspan: {
        x?: MaybeSpecial<string | number>;
        y?: MaybeSpecial<string | number>;
        dx?: MaybeSpecial<string | number>;
        dy?: MaybeSpecial<string | number>;
        rotate?: MaybeSpecial<string | number>;
        textLength?: MaybeSpecial<string | number>;
        lengthAdjust?: MaybeSpecial<"spacing" | "spacingAndGlyphs">;
    };
    textPath: {
        href?: MaybeSpecial<string>;
        startOffset?: MaybeSpecial<string | number>;
        method?: MaybeSpecial<"align" | "stretch">;
        spacing?: MaybeSpecial<"auto" | "exact">;
    };
    defs: {};
    symbol: {
        viewBox?: MaybeSpecial<string>;
        preserveAspectRatio?: MaybeSpecial<string>;
        x?: MaybeSpecial<string | number>;
        y?: MaybeSpecial<string | number>;
        width?: MaybeSpecial<string | number>;
        height?: MaybeSpecial<string | number>;
    };
    use: {
        href?: MaybeSpecial<string>;
        x?: MaybeSpecial<string | number>;
        y?: MaybeSpecial<string | number>;
        width?: MaybeSpecial<string | number>;
        height?: MaybeSpecial<string | number>;
    };
    image: {
        href?: MaybeSpecial<string>;
        x?: MaybeSpecial<string | number>;
        y?: MaybeSpecial<string | number>;
        width?: MaybeSpecial<string | number>;
        height?: MaybeSpecial<string | number>;
        preserveAspectRatio?: MaybeSpecial<string>;
    };
    clipPath: {
        clipPathUnits?: MaybeSpecial<"userSpaceOnUse" | "objectBoundingBox">;
    };
    mask: {
        maskUnits?: MaybeSpecial<"userSpaceOnUse" | "objectBoundingBox">;
        maskContentUnits?: MaybeSpecial<"userSpaceOnUse" | "objectBoundingBox">;
        x?: MaybeSpecial<string | number>;
        y?: MaybeSpecial<string | number>;
        width?: MaybeSpecial<string | number>;
        height?: MaybeSpecial<string | number>;
    };
    pattern: {
        x?: MaybeSpecial<string | number>;
        y?: MaybeSpecial<string | number>;
        width?: MaybeSpecial<string | number>;
        height?: MaybeSpecial<string | number>;
        patternUnits?: MaybeSpecial<"userSpaceOnUse" | "objectBoundingBox">;
        patternContentUnits?: MaybeSpecial<"userSpaceOnUse" | "objectBoundingBox">;
        patternTransform?: MaybeSpecial<string>;
        href?: MaybeSpecial<string>;
    };
    linearGradient: {
        x1?: MaybeSpecial<string | number>;
        y1?: MaybeSpecial<string | number>;
        x2?: MaybeSpecial<string | number>;
        y2?: MaybeSpecial<string | number>;
        gradientUnits?: MaybeSpecial<"userSpaceOnUse" | "objectBoundingBox">;
        gradientTransform?: MaybeSpecial<string>;
        spreadMethod?: MaybeSpecial<"pad" | "reflect" | "repeat">;
        href?: MaybeSpecial<string>;
    };
    radialGradient: {
        cx?: MaybeSpecial<string | number>;
        cy?: MaybeSpecial<string | number>;
        r?: MaybeSpecial<string | number>;
        fx?: MaybeSpecial<string | number>;
        fy?: MaybeSpecial<string | number>;
        fr?: MaybeSpecial<string | number>;
        gradientUnits?: MaybeSpecial<"userSpaceOnUse" | "objectBoundingBox">;
        gradientTransform?: MaybeSpecial<string>;
        spreadMethod?: MaybeSpecial<"pad" | "reflect" | "repeat">;
        href?: MaybeSpecial<string>;
    };
    filter: {
        x?: MaybeSpecial<string | number>;
        y?: MaybeSpecial<string | number>;
        width?: MaybeSpecial<string | number>;
        height?: MaybeSpecial<string | number>;
        filterUnits?: MaybeSpecial<"userSpaceOnUse" | "objectBoundingBox">;
        primitiveUnits?: MaybeSpecial<"userSpaceOnUse" | "objectBoundingBox">;
    };
    marker: {
        viewBox?: MaybeSpecial<string>;
        preserveAspectRatio?: MaybeSpecial<string>;
        refX?: MaybeSpecial<string | number>;
        refY?: MaybeSpecial<string | number>;
        markerUnits?: MaybeSpecial<"userSpaceOnUse" | "strokeWidth">;
        markerWidth?: MaybeSpecial<string | number>;
        markerHeight?: MaybeSpecial<string | number>;
        orient?: MaybeSpecial<"auto" | "auto-start-reverse" | number | string>;
    };
    view: {
        viewBox?: MaybeSpecial<string>;
        preserveAspectRatio?: MaybeSpecial<string>;
    };
    path: {
        d?: MaybeSpecial<string>;
        pathLength?: MaybeSpecial<number | string>;
    };
    circle: {
        cx?: MaybeSpecial<string | number>;
        cy?: MaybeSpecial<string | number>;
        r?: MaybeSpecial<string | number>;
    };
    ellipse: {
        cx?: MaybeSpecial<string | number>;
        cy?: MaybeSpecial<string | number>;
        rx?: MaybeSpecial<string | number>;
        ry?: MaybeSpecial<string | number>;
    };
    line: {
        x1?: MaybeSpecial<string | number>;
        y1?: MaybeSpecial<string | number>;
        x2?: MaybeSpecial<string | number>;
        y2?: MaybeSpecial<string | number>;
    };
    polygon: {
        points?: MaybeSpecial<string>;
    };
    polyline: {
        points?: MaybeSpecial<string>;
    };
    stop: {
        offset?: MaybeSpecial<string | number>;
        stopColor?: MaybeSpecial<string>;
        stopOpacity?: MaybeSpecial<string | number>;
    };
    feBlend: {
        in?: MaybeSpecial<string>;
        in2?: MaybeSpecial<string>;
        mode?: MaybeSpecial<string>;
        result?: MaybeSpecial<string>;
    };
    feColorMatrix: {
        in?: MaybeSpecial<string>;
        type?: MaybeSpecial<string>;
        values?: MaybeSpecial<string>;
        result?: MaybeSpecial<string>;
    };
    feComponentTransfer: {
        in?: MaybeSpecial<string>;
        result?: MaybeSpecial<string>;
    };
    feComposite: {
        in?: MaybeSpecial<string>;
        in2?: MaybeSpecial<string>;
        operator?: MaybeSpecial<string>;
        k1?: MaybeSpecial<number>;
        k2?: MaybeSpecial<number>;
        k3?: MaybeSpecial<number>;
        k4?: MaybeSpecial<number>;
        result?: MaybeSpecial<string>;
    };
    feConvolveMatrix: {
        in?: MaybeSpecial<string>;
        order?: MaybeSpecial<string | number>;
        kernelMatrix?: MaybeSpecial<string>;
        divisor?: MaybeSpecial<number>;
        bias?: MaybeSpecial<number>;
        targetX?: MaybeSpecial<number>;
        targetY?: MaybeSpecial<number>;
        edgeMode?: MaybeSpecial<string>;
        preserveAlpha?: MaybeSpecial<boolean>;
        result?: MaybeSpecial<string>;
    };
    feDiffuseLighting: {
        in?: MaybeSpecial<string>;
        surfaceScale?: MaybeSpecial<number>;
        diffuseConstant?: MaybeSpecial<number>;
        kernelUnitLength?: MaybeSpecial<string | number>;
        result?: MaybeSpecial<string>;
    };
    feDisplacementMap: {
        in?: MaybeSpecial<string>;
        in2?: MaybeSpecial<string>;
        scale?: MaybeSpecial<number>;
        xChannelSelector?: MaybeSpecial<string>;
        yChannelSelector?: MaybeSpecial<string>;
        result?: MaybeSpecial<string>;
    };
    feDistantLight: {
        azimuth?: MaybeSpecial<number>;
        elevation?: MaybeSpecial<number>;
    };
    feFlood: {
        floodColor?: MaybeSpecial<string>;
        floodOpacity?: MaybeSpecial<string | number>;
        result?: MaybeSpecial<string>;
    };
    feFuncA: {
        type?: MaybeSpecial<string>;
        tableValues?: MaybeSpecial<string>;
        slope?: MaybeSpecial<number>;
        intercept?: MaybeSpecial<number>;
        amplitude?: MaybeSpecial<number>;
        exponent?: MaybeSpecial<number>;
        offset?: MaybeSpecial<number>;
    };
    feFuncB: {
        type?: MaybeSpecial<string>;
        tableValues?: MaybeSpecial<string>;
        slope?: MaybeSpecial<number>;
        intercept?: MaybeSpecial<number>;
        amplitude?: MaybeSpecial<number>;
        exponent?: MaybeSpecial<number>;
        offset?: MaybeSpecial<number>;
    };
    feFuncG: {
        type?: MaybeSpecial<string>;
        tableValues?: MaybeSpecial<string>;
        slope?: MaybeSpecial<number>;
        intercept?: MaybeSpecial<number>;
        amplitude?: MaybeSpecial<number>;
        exponent?: MaybeSpecial<number>;
        offset?: MaybeSpecial<number>;
    };
    feFuncR: {
        type?: MaybeSpecial<string>;
        tableValues?: MaybeSpecial<string>;
        slope?: MaybeSpecial<number>;
        intercept?: MaybeSpecial<number>;
        amplitude?: MaybeSpecial<number>;
        exponent?: MaybeSpecial<number>;
        offset?: MaybeSpecial<number>;
    };
    feGaussianBlur: {
        in?: MaybeSpecial<string>;
        stdDeviation?: MaybeSpecial<string | number>;
        edgeMode?: MaybeSpecial<string>;
        result?: MaybeSpecial<string>;
    };
    feImage: {
        href?: MaybeSpecial<string>;
        preserveAspectRatio?: MaybeSpecial<string>;
        crossOrigin?: MaybeSpecial<string>;
        result?: MaybeSpecial<string>;
    };
    feMerge: {
        result?: MaybeSpecial<string>;
    };
    feMergeNode: {
        in?: MaybeSpecial<string>;
    };
    feMorphology: {
        in?: MaybeSpecial<string>;
        operator?: MaybeSpecial<"erode" | "dilate">;
        radius?: MaybeSpecial<string | number>;
        result?: MaybeSpecial<string>;
    };
    feOffset: {
        in?: MaybeSpecial<string>;
        dx?: MaybeSpecial<string | number>;
        dy?: MaybeSpecial<string | number>;
        result?: MaybeSpecial<string>;
    };
    fePointLight: {
        x?: MaybeSpecial<number>;
        y?: MaybeSpecial<number>;
        z?: MaybeSpecial<number>;
    };
    feSpecularLighting: {
        in?: MaybeSpecial<string>;
        surfaceScale?: MaybeSpecial<number>;
        specularConstant?: MaybeSpecial<number>;
        specularExponent?: MaybeSpecial<number>;
        kernelUnitLength?: MaybeSpecial<string | number>;
        result?: MaybeSpecial<string>;
    };
    feSpotLight: {
        x?: MaybeSpecial<number>;
        y?: MaybeSpecial<number>;
        z?: MaybeSpecial<number>;
        pointsAtX?: MaybeSpecial<number>;
        pointsAtY?: MaybeSpecial<number>;
        pointsAtZ?: MaybeSpecial<number>;
        specularExponent?: MaybeSpecial<number>;
        limitingConeAngle?: MaybeSpecial<number>;
    };
    feTile: {
        in?: MaybeSpecial<string>;
        result?: MaybeSpecial<string>;
    };
    feTurbulence: {
        baseFrequency?: MaybeSpecial<string | number>;
        numOctaves?: MaybeSpecial<number>;
        seed?: MaybeSpecial<number>;
        stitchTiles?: MaybeSpecial<"stitch" | "noStitch">;
        type?: MaybeSpecial<"fractalNoise" | "turbulence">;
        result?: MaybeSpecial<string>;
    };
    math: {
        display?: MaybeSpecial<"block" | "inline">;
        overflow?: MaybeSpecial<"normal" | "scroll" | "hidden" | "visible">;
    };
    mi: {};
    mn: {};
    mo: {};
    mtext: {};
    ms: {};
    mrow: {};
    mfenced: {
        open?: MaybeSpecial<string>;
        close?: MaybeSpecial<string>;
        separators?: MaybeSpecial<string>;
    };
    msup: {};
    msub: {};
    msubsup: {};
    mfrac: {
        linethickness?: MaybeSpecial<string | number>;
        numalign?: MaybeSpecial<"left" | "center" | "right">;
        denomalign?: MaybeSpecial<"left" | "center" | "right">;
        bevelled?: MaybeSpecial<boolean>;
    };
    msqrt: {};
    mroot: {};
    mtable: {
        align?: MaybeSpecial<string>;
        columnalign?: MaybeSpecial<string>;
        columnspacing?: MaybeSpecial<string>;
        columnwidth?: MaybeSpecial<string>;
        displaystyle?: MaybeSpecial<boolean>;
        frame?: MaybeSpecial<string>;
        framespacing?: MaybeSpecial<string>;
        rowalign?: MaybeSpecial<string>;
        rowspacing?: MaybeSpecial<string>;
    };
    mtr: {
        columnalign?: MaybeSpecial<string>;
        rowalign?: MaybeSpecial<string>;
    };
    mtd: {
        columnalign?: MaybeSpecial<string>;
        rowalign?: MaybeSpecial<string>;
        columnspan?: MaybeSpecial<number>;
        rowspan?: MaybeSpecial<number>;
    };
    mstyle: {
        scriptlevel?: MaybeSpecial<number | string>;
        displaystyle?: MaybeSpecial<boolean>;
    };
    menclose: {
        notation?: MaybeSpecial<string>;
    };
    mmultiscripts: {};
};