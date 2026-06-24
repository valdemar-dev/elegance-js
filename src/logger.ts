import { getConfig } from "./config"

export const c = {
    reset:   "\x1b[0m",
    bold:    "\x1b[1m",
    dim:     "\x1b[2m",
    italic:  "\x1b[3m",
    red:     "\x1b[31m",
    green:   "\x1b[32m",
    yellow:  "\x1b[33m",
    blue:    "\x1b[34m",
    cyan:    "\x1b[36m",
    magenta: "\x1b[35m",
    white:   "\x1b[37m",
    gray:    "\x1b[90m",
} as const

export type ConsoleOptions = {
    suppressEleganceLogs?: boolean,
    clearConsoleOnRebuilds?: boolean,
}

const config = await getConfig();

export type ColorKey = keyof typeof c

function paint(text: string, ...styles: ColorKey[]): string {
    return styles.map(k => c[k]).join('') + text + c.reset
}

type Level = 'info' | 'success' | 'warn' | 'error' | 'debug'

const LEVELS: Record<Level, { icon: string; badge: string; color: ColorKey }> = {
    info:    { icon: '!', badge: 'info',  color: 'cyan'    },
    success: { icon: '✓', badge: 'ok',    color: 'green'   },
    warn:    { icon: '⚠', badge: 'warn',  color: 'yellow'  },
    error:   { icon: '✗', badge: 'error', color: 'red'     },
    debug:   { icon: '◆', badge: 'debug', color: 'magenta' },
}

const MSG_INDENT = '         '

export interface LogOptions {
    /** A secondary, dimmed line printed beneath the message. */
    detail?: string
    /** Prepend an HH:MM:SS timestamp to each line. */
    timestamp?: boolean
}

function emit(level: Level, msg: string, opts: LogOptions = {}): void {
    if (config.console.suppressEleganceLogs) {
        return;
    }

    const { icon, badge, color } = LEVELS[level]
    const fn = level === 'error' ? console.error : console.log

    const ts = opts.timestamp
        ? paint(new Date().toTimeString().slice(0, 8), 'gray') + '  '
        : ''

    fn(`  ${ts}${paint(icon, color)}  ${paint(badge.padEnd(6), color, 'bold')}${msg}`)

    if (opts.detail) {
        const tsGap = opts.timestamp ? '          ' : '' // "HH:MM:SS  " = 10
        fn(`  ${tsGap}${MSG_INDENT}${paint(opts.detail, 'dim')}`)
    }
}

export const logger = {
    info   (msg: string, opts?: LogOptions): void { emit('info',    msg, opts) },
    success(msg: string, opts?: LogOptions): void { emit('success', msg, opts) },
    warn   (msg: string, opts?: LogOptions): void { emit('warn',    msg, opts) },
    error  (msg: string, opts?: LogOptions): void { emit('error',   msg, opts) },
    debug  (msg: string, opts?: LogOptions): void { emit('debug',   msg, opts) },

    gap(): void {
        if (config.console.suppressEleganceLogs) {
            return;
        }
        
        console.log('')
    },

    divider(label?: string): void {
        if (config.console.suppressEleganceLogs) {
            return;
        }

        const W = 54
        if (label) {
            const dashes = '─'.repeat(Math.max(2, W - label.length - 4))
            console.log('  ' + paint(`── ${label} ${dashes}`, 'gray'))
        } else {
            console.log('  ' + paint('─'.repeat(W), 'gray'))
        }
    },

    field(key: string, value: string, color: ColorKey = 'cyan'): void {
        if (config.console.suppressEleganceLogs) {
            return;
        }

        const k = paint(key.padEnd(10), color)
        console.log(`  ${MSG_INDENT}${k}  ${value}`)
    },
}