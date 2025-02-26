
enum TokenType {
    Keyword = "text-amber-100 font-semibold",
    Identifier = "text-orange-300",
    FunctionCall = "text-red-300",
    Number = "text-blue-400",
    String = "text-green-200",
    Comment = "text-gray-400",
    Punctuation = "text-gray-400",
    Boolean = "text-blue-200",
    Operator = "",
    Whitespace = "",
    Unknown = "",
}

interface Token {
    type: TokenType;
    value: string;
    position: number;
}

const tokenize = (input: string): Token[] => {
    const tokens: Token[] = [];
    const length = input.length;
    let index = 0;

    const keywords = new Set([
        "if",
        "else",
        "for",
        "while",
        "function",
        "return",
        "class",
        "const",
        "let",
        "var",
        "interface",
        "extends",
        "implements",
        "export",
        "import",
        "from",
    ]);

    const operatorChars = new Set([
        "+",
        "-",
        "*",
        "/",
        "%",
        "=",
        ">",
        "<",
        "!",
        "&",
        "|",
        "^",
        "~",
        "?",
        ":",
    ]);

    const punctuationChars = new Set([
        ";",
        ",",
        ".",
        "(",
        ")",
        "{",
        "}",
        "[",
        "]",
    ]);

    const peek = (offset = 1): string =>
        index + offset < length ? input[index + offset] : "";

    const readWhile = (predicate: (char: string) => boolean): string => {
        const start = index;
        while (index < length && predicate(input[index])) {
            index++;
        }
        return input.slice(start, index);
    };

    const readString = (quoteType: string): string => {
        let value = input[index++];
        while (index < length && input[index] !== quoteType) {
            if (input[index] === "\\") {
                value += input[index++];
                if (index < length) {
                    value += input[index++];
                }
            } else {
                value += input[index++];
            }
        }
        if (index < length) {
            value += input[index++];
        }
        return value;
    };

    const readLineComment = (): string => {
        const start = index;
        index += 2;
        while (index < length && input[index] !== "\n") {
            index++;
        }
        return input.slice(start, index);
    };

    const readBlockComment = (): string => {
        const start = index;
        index += 2;
        while (index < length && !(input[index] === "*" && peek() === "/")) {
            index++;
        }
        if (index < length) {
            index += 2;
        }
        return input.slice(start, index);
    };

    while (index < length) {
        const char = input[index];
        const startPos = index;

        if (/\s/.test(char)) {
            const value = readWhile((c) => /\s/.test(c));
            tokens.push({ type: TokenType.Whitespace, value, position: startPos });
            continue;
        }

        if (char === "/") {
            if (peek() === "/") {
                const value = readLineComment();
                tokens.push({ type: TokenType.Comment, value, position: startPos });
                continue;
            } else if (peek() === "*") {
                const value = readBlockComment();
                tokens.push({ type: TokenType.Comment, value, position: startPos });
                continue;
            }
        }

        if (char === '"' || char === "'") {
            const value = readString(char);
            tokens.push({ type: TokenType.String, value, position: startPos });
            continue;
        }

        if (/\d/.test(char)) {
            const value = readWhile((c) => /[\d\.]/.test(c));
            tokens.push({ type: TokenType.Number, value, position: startPos });
            continue;
        }

        if (/[a-zA-Z_$]/.test(char)) {
            const value = readWhile((c) => /[a-zA-Z0-9_$]/.test(c));
            let type = TokenType.Identifier;
            if (keywords.has(value)) {
                type = TokenType.Keyword;
            } else if (value === "true" || value === "false") {
                type = TokenType.Boolean;
            }

            let tempIndex = index;
            while (tempIndex < length && /\s/.test(input[tempIndex])) {
                tempIndex++;
            }
            if (tempIndex < length && input[tempIndex] === '(') {
                type = TokenType.FunctionCall;
            }

            tokens.push({ type, value, position: startPos });
            continue;
        }

        if (operatorChars.has(char)) {
            let value = char;
            index++;
            if (index < length && operatorChars.has(input[index])) {
                value += input[index++];
            }
            tokens.push({ type: TokenType.Operator, value, position: startPos });
            continue;
        }

        if (punctuationChars.has(char)) {
            tokens.push({ type: TokenType.Punctuation, value: char, position: startPos });
            index++;
            continue;
        }

        tokens.push({ type: TokenType.Unknown, value: char, position: startPos });
        index++;
    }

    return tokens;
};

const escapeHtml = (text: string): string =>
    text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

export const highlightCode = (code: string): string => {
    const tokens = tokenize(code);
    return tokens
        .map((token) =>
            token.type === TokenType.Whitespace
                ? token.value
                : `<span class="${token.type}">${escapeHtml(token.value)}</span>`
        )
        .join("");
};

