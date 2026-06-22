type CSPSourceValue =
    | "'self'"
    | "'none'"
    | "'unsafe-inline'"
    | "'unsafe-eval'"
    | "'strict-dynamic'"
    | "'unsafe-hashes'"
    | "'report-sample'"
    | "'unsafe-allow-redirects'"
    | `'nonce-${string}'`
    | `'sha256-${string}'`
    | `'sha384-${string}'`
    | `'sha512-${string}'`
    | string;

type CSPOptions = {
    defaultSrc?: CSPSourceValue[];
    childSrc?: CSPSourceValue[];
    connectSrc?: CSPSourceValue[];
    fontSrc?: CSPSourceValue[];
    frameSrc?: CSPSourceValue[];
    imgSrc?: CSPSourceValue[];
    manifestSrc?: CSPSourceValue[];
    mediaSrc?: CSPSourceValue[];
    objectSrc?: CSPSourceValue[];
    prefetchSrc?: CSPSourceValue[];
    scriptSrc?: CSPSourceValue[];
    scriptSrcElem?: CSPSourceValue[];
    scriptSrcAttr?: CSPSourceValue[];
    styleSrc?: CSPSourceValue[];
    styleSrcElem?: CSPSourceValue[];
    styleSrcAttr?: CSPSourceValue[];
    workerSrc?: CSPSourceValue[];

    baseUri?: CSPSourceValue[];
    sandbox?: string[];
    formAction?: CSPSourceValue[];
    frameAncestors?: CSPSourceValue[];
    navigateTo?: CSPSourceValue[];

    reportUri?: string[];
    reportTo?: string;

    requireTrustedTypesFor?: ("'script'" | string)[];
    trustedTypes?: (string | "'none'" | "'allow-duplicates'" | "'*'")[];
    upgradeInsecureRequests?: boolean;
    blockAllMixedContent?: boolean;
};

function makeCSPString(cspOptions: CSPOptions): string {
    const parts: string[] = [];

    const addDirective = (name: string, values?: string[]) => {
        if (values && values.length > 0) {
            parts.push(`${name} ${values.join(' ')}`);
        }
    };

    addDirective('default-src', cspOptions.defaultSrc);
    addDirective('child-src', cspOptions.childSrc);
    addDirective('connect-src', cspOptions.connectSrc);
    addDirective('font-src', cspOptions.fontSrc);
    addDirective('frame-src', cspOptions.frameSrc);
    addDirective('img-src', cspOptions.imgSrc);
    addDirective('manifest-src', cspOptions.manifestSrc);
    addDirective('media-src', cspOptions.mediaSrc);
    addDirective('object-src', cspOptions.objectSrc);
    addDirective('prefetch-src', cspOptions.prefetchSrc);
    addDirective('script-src', cspOptions.scriptSrc);
    addDirective('script-src-elem', cspOptions.scriptSrcElem);
    addDirective('script-src-attr', cspOptions.scriptSrcAttr);
    addDirective('style-src', cspOptions.styleSrc);
    addDirective('style-src-elem', cspOptions.styleSrcElem);
    addDirective('style-src-attr', cspOptions.styleSrcAttr);
    addDirective('worker-src', cspOptions.workerSrc);
    addDirective('base-uri', cspOptions.baseUri);
    addDirective('form-action', cspOptions.formAction);
    addDirective('frame-ancestors', cspOptions.frameAncestors);
    addDirective('navigate-to', cspOptions.navigateTo);
    addDirective('sandbox', cspOptions.sandbox);
    addDirective('report-uri', cspOptions.reportUri);
    addDirective('require-trusted-types-for', cspOptions.requireTrustedTypesFor);
    addDirective('trusted-types', cspOptions.trustedTypes);

    if (cspOptions.reportTo) {
        parts.push(`report-to ${cspOptions.reportTo}`);
    }

    if (cspOptions.upgradeInsecureRequests) {
        parts.push('upgrade-insecure-requests');
    }
    if (cspOptions.blockAllMixedContent) {
        parts.push('block-all-mixed-content');
    }

    return parts.join('; ');
}

type StrictTransportSecurityOptions = {
    maxAge: number; // seconds, should be >= 31536000 for preload
    includeSubDomains?: boolean;
    preload?: boolean;
};

function makeHSTSHeader(opts: StrictTransportSecurityOptions): string {
    let header = `max-age=${opts.maxAge}`;
    if (opts.includeSubDomains) header += '; includeSubDomains';
    if (opts.preload) header += '; preload';
    return header;
}

type XFrameOptionsValue = 'DENY' | 'SAMEORIGIN' | `ALLOW-FROM ${string}`;

function makeXFrameOptionsHeader(value: XFrameOptionsValue): string {
    return value;
}

function makeXContentTypeOptionsHeader(): string {
    return 'nosniff';
}

type ReferrerPolicyValue =
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url'
    | '';

function makeReferrerPolicyHeader(policy: ReferrerPolicyValue): string {
    return policy;
}

type PermissionsPolicyOptions = Record<string, string[]>;

function makePermissionsPolicyHeader(policies: PermissionsPolicyOptions): string {
    return Object.entries(policies)
        .map(([feature, origins]) => `${feature}=${origins.join(' ')}`)
        .join(', ');
}

type CrossOriginEmbedderPolicyValue = 'unsafe-none' | 'require-corp' | 'credentialless';
type CrossOriginOpenerPolicyValue = 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';
type CrossOriginResourcePolicyValue = 'same-site' | 'same-origin' | 'cross-origin';

function makeCrossOriginEmbedderPolicyHeader(value: CrossOriginEmbedderPolicyValue): string {
    return value;
}

function makeCrossOriginOpenerPolicyHeader(value: CrossOriginOpenerPolicyValue): string {
    return value;
}

function makeCrossOriginResourcePolicyHeader(value: CrossOriginResourcePolicyValue): string {
    return value;
}

type XDNSPrefetchControlValue = 'on' | 'off';

function makeXDNSPrefetchControlHeader(value: XDNSPrefetchControlValue): string {
    return value;
}

type XXSSProtectionOptions = {
    enable: boolean;
    mode?: 'block';
    report?: string;
};

function makeXXSSProtectionHeader(opts: XXSSProtectionOptions): string {
    if (!opts.enable) return '0';
    let header = '1';
    if (opts.mode === 'block') header += '; mode=block';
    if (opts.report) header += `; report=${opts.report}`;
    return header;
}

export type SecurityHeadersOptions = {
    contentSecurityPolicy?: CSPOptions;
    strictTransportSecurity?: StrictTransportSecurityOptions;
    xFrameOptions?: XFrameOptionsValue;
    xContentTypeOptions?: boolean;        // true = 'nosniff'
    referrerPolicy?: ReferrerPolicyValue;
    permissionsPolicy?: PermissionsPolicyOptions;
    crossOriginEmbedderPolicy?: CrossOriginEmbedderPolicyValue;
    crossOriginOpenerPolicy?: CrossOriginOpenerPolicyValue;
    crossOriginResourcePolicy?: CrossOriginResourcePolicyValue;
    xDnsPrefetchControl?: XDNSPrefetchControlValue;
    xXssProtection?: XXSSProtectionOptions;
};

export function createSecurityHeaders(opts: SecurityHeadersOptions): Record<string, string> {
    const headers: Record<string, string> = {};

    if (opts.contentSecurityPolicy) {
        headers['Content-Security-Policy'] = makeCSPString(opts.contentSecurityPolicy);
    }
    if (opts.strictTransportSecurity) {
        headers['Strict-Transport-Security'] = makeHSTSHeader(opts.strictTransportSecurity);
    }
    if (opts.xFrameOptions) {
        headers['X-Frame-Options'] = makeXFrameOptionsHeader(opts.xFrameOptions);
    }
    if (opts.xContentTypeOptions) {
        headers['X-Content-Type-Options'] = makeXContentTypeOptionsHeader();
    }
    if (opts.referrerPolicy) {
        headers['Referrer-Policy'] = makeReferrerPolicyHeader(opts.referrerPolicy);
    }
    if (opts.permissionsPolicy) {
        headers['Permissions-Policy'] = makePermissionsPolicyHeader(opts.permissionsPolicy);
    }
    if (opts.crossOriginEmbedderPolicy) {
        headers['Cross-Origin-Embedder-Policy'] = makeCrossOriginEmbedderPolicyHeader(opts.crossOriginEmbedderPolicy);
    }
    if (opts.crossOriginOpenerPolicy) {
        headers['Cross-Origin-Opener-Policy'] = makeCrossOriginOpenerPolicyHeader(opts.crossOriginOpenerPolicy);
    }
    if (opts.crossOriginResourcePolicy) {
        headers['Cross-Origin-Resource-Policy'] = makeCrossOriginResourcePolicyHeader(opts.crossOriginResourcePolicy);
    }
    if (opts.xDnsPrefetchControl) {
        headers['X-DNS-Prefetch-Control'] = makeXDNSPrefetchControlHeader(opts.xDnsPrefetchControl);
    }
    if (opts.xXssProtection) {
        headers['X-XSS-Protection'] = makeXXSSProtectionHeader(opts.xXssProtection);
    }

    return headers;
}