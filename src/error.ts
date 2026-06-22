import { relative } from "node:path"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RichErrorOptions {
    title:        string
    message?:     string
    description?: string
    hint?:        string
    origin?:      string
    meta?:        Record<string, unknown>
    cause?:       unknown
    doShowStack:  boolean
}

export type RichError = Error & RichErrorOptions

export function richError(opts: RichErrorOptions): RichError {
    const message = opts.message ?? opts.title
    const err     = new Error(message) as RichError

    err.title       = opts.title;
    err.description = opts.description!;
    err.hint        = opts.hint!;
    err.origin      = relative(process.cwd(), opts.origin ?? "");
    err.meta        = opts.meta!;
    err.doShowStack = opts.doShowStack;

    if (opts.cause   !== undefined) (err as any).cause = opts.cause;
    if (opts.message !== undefined) err.message = opts.message;

    if (typeof (Error as any).captureStackTrace === 'function') {
        (Error as any).captureStackTrace(err, richError);
    } else if (err.stack) {
        err.stack = err.stack
            .split('\n')
            .filter((l, i) => i === 0 || !l.includes('richError'))
            .join('\n');
    }

    return err;
}

export function isRichError(value: unknown): value is RichError {
    return value instanceof Error && 'title' in value;
}

const ansi = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    dim:     '\x1b[2m',
    red:     '\x1b[31m',
    yellow:  '\x1b[33m',
    cyan:    '\x1b[36m',
    magenta: '\x1b[35m',
    gray:    '\x1b[90m',
} as const

type AnsiKey = keyof typeof ansi;
type Painter  = (text: string, ...keys: AnsiKey[]) => string;

export interface FormatOptions {
    colors?:        boolean;
    maxCauseDepth?: number;
}

const BOX_W  = 56;

const I1 = '  ';
const I2 = '    ';
const I3 = '      ';

export function formatError(err: unknown, opts: FormatOptions = {}): string {
    const { colors = true, maxCauseDepth = 4 } = opts

    const paint: Painter = colors
        ? (text, ...keys) => keys.map(k => ansi[k]).join('') + text + ansi.reset
        : (text)          => text

    const out: string[] = ['']
    out.push(...banner(paint))
    out.push('')
    renderNode(err, 0, out, paint, maxCauseDepth)
    out.push('')
    return out.join('\n')
}

export function printError(err: unknown, opts?: FormatOptions): void {
    console.error(formatError(err, opts))
}

function banner(paint: Painter): string[] {
    const W = BOX_W

    const top = paint(`╭${'─'.repeat(W)}╮`, 'red')
    const bot = paint(`╰${'─'.repeat(W)}╯`, 'red')

    const rawLabel = '  ✗  ERROR'
    const pad = ' '.repeat(W - rawLabel.length)
    const mid =
        paint('│', 'red') +
        '  ' + paint('✗', 'red', 'bold') +
        '  ' + paint('ERROR', 'red', 'bold') +
        pad +
        paint('│', 'red')

    return [top, mid, bot]
}

function renderNode(
    error:     unknown,
    depth:     number,
    out:       string[],
    paint:     Painter,
    maxDepth:  number,
): void {
    if (depth > maxDepth) {
        out.push(`${I2}${paint('↳  … further causes omitted', 'dim')}`)
        return
    }

    if (error === null || error === undefined || typeof error !== 'object') {
        const label = typeof error === 'string'
            ? error
            : (error === null || error === undefined)
                ? String(error)
                : `(${typeof error}) ${String(error)}`
        const indent = depth === 0 ? I1 : I2
        out.push(`${indent}${paint('⚠', 'yellow', 'bold')}  ${paint(label, 'dim')}`)
        return
    }

    const err  = error as Error & RichErrorOptions
    const rich = isRichError(err)

    const titleText = rich
        ? err.title
        : `${(err as any).constructor?.name ?? 'Error'}: ${(err as any).message}`

    const titleIndent = depth === 0 ? I1 : I2
    out.push(
        `${titleIndent}${paint('⚠', 'yellow', 'bold')}  ${paint(titleText, 'bold')}`
    )

    const fi  = depth === 0 ? I2 : I3   // field indent
    const si  = depth === 0 ? I3 : I3 + '  '  // stack/meta row indent

    if (rich && err.description) {
        out.push('')
        out.push(`${fi}${err.description}`)
    }

    if (rich && err.origin) {
        out.push(`${fi}${paint(err.origin, 'gray')}`)
    }

    const hasFields = rich && (err.hint || err.origin)
    if (hasFields) out.push('')

    const cause = (err as any).cause
    if (cause !== undefined) {
        out.push('')

        if (typeof cause === "string" && cause.startsWith("\\")) {
            out.push(paint(cause.slice(1)))
        } else {
            out.push(`${fi}${paint(cause)}`)
        }
    }

    if (rich && err.hint) {
        out.push('')

        if (err.hint.startsWith("\\")) {
            out.push(paint(err.hint.slice(1), 'yellow'))
        } else {
            out.push(`${fi}${paint(err.hint, 'yellow')}`)
        }

    }

    const showStack = (err.stack || err.cause instanceof Error) && (rich ? err.doShowStack : depth > 0)
    if (showStack) {
        const stack = err.cause instanceof Error ? cause.stack : err.stack;

        const frames = stack!.split('\n').slice(1).filter(Boolean);
        
        if (frames.length > 0) {
            out.push('')
            out.push(`${fi}${paint('Stack', 'gray')}`)
            for (const frame of frames) {
                out.push(`${si}${paint('╎', 'dim')}  ${paint(frame.trim(), 'dim')}`)
            }
        }
    }
}
