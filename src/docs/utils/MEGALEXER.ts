
enum TokenType {
    Keyword = "text-amber-100 font-semibold",
    Identifier = "text-orange-300",
    Number = "text-blue-400",
    String = "text-green-200",
    FunctionCall = "text-orange-300",
    Comment = "text-gray-400",
    Punctuation = "text-gray-400",
    Operator = "",
    Whitespace = "",
    Unknown = "",
    ObjectKey = "",
    ObjectValue = "",
}

interface Token {
    type: TokenType;
    value: string;
    position: number;
}

class Lexer {
    private input: string;
    private index: number;
    private length: number;
    private keywords = new Set([
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
        "type",
        "extends",
        "implements",
        "export"
    ]);

    constructor(input: string) {
        this.input = input;
        this.index = 0;
        this.length = input.length;
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];
        const operatorChars = new Set([
            "+", "-", "*", "/", "%", "=", ">", "<", "!", "&", "|", "^", "~", "?", ":"
        ]);
        const punctuationChars = new Set([
            ";", ",", ".", "(", ")", "{", "}", "[", "]"
        ]);

        while (this.index < this.length) {
            const currentChar = this.input[this.index];

            if (/\s/.test(currentChar)) {
                const value = this.readWhile((c) => /\s/.test(c));
                tokens.push({ type: TokenType.Whitespace, value, position: this.index });
                continue;
            }

            if (currentChar === "/") {
                if (this.peek() === "/") {
                    const value = this.readLineComment();
                    tokens.push({ type: TokenType.Comment, value, position: this.index });
                    continue;
                } else if (this.peek() === "*") {
                    const value = this.readBlockComment();
                    tokens.push({ type: TokenType.Comment, value, position: this.index });
                    continue;
                }
            }

            if (currentChar === '"' || currentChar === "'") {
                const value = this.readString(currentChar);
                tokens.push({ type: TokenType.String, value, position: this.index });
                continue;
            }

            if (/\d/.test(currentChar)) {
                const value = this.readWhile((c) => /[\d\.]/.test(c));
                tokens.push({ type: TokenType.Number, value, position: this.index });
                continue;
            }

            if (/[a-zA-Z_$]/.test(currentChar)) {
                const value = this.readWhile((c) => /[a-zA-Z0-9_$]/.test(c));
                const type = this.keywords.has(value) ? TokenType.Keyword : TokenType.Identifier;
                tokens.push({ type, value, position: this.index });
                continue;
            }

            if (operatorChars.has(currentChar)) {
                let value = currentChar;
                this.index++;
                if (this.index < this.length && operatorChars.has(this.input[this.index])) {
                    value += this.input[this.index++];
                }
                tokens.push({ type: TokenType.Operator, value, position: this.index });
                continue;
            }

            if (punctuationChars.has(currentChar)) {
                tokens.push({ type: TokenType.Punctuation, value: currentChar, position: this.index + 1 });
                this.index++;
                continue;
            }

            tokens.push({ type: TokenType.Unknown, value: currentChar, position: this.index + 1 });
            this.index++;
        }
        return tokens;
    }

    private readWhile(predicate: (char: string) => boolean): string {
        const start = this.index;
        while (this.index < this.length && predicate(this.input[this.index])) {
            this.index++;
        }
        return this.input.slice(start, this.index);
    }

    private readLineComment(): string {
        let value = this.input[this.index] + this.input[this.index + 1];
        this.index += 2;
        while (this.index < this.length && this.input[this.index] !== "\n") {
            value += this.input[this.index++];
        }
        return value;
    }

    private readBlockComment(): string {
        let value = this.input[this.index] + this.input[this.index + 1];
        this.index += 2;
        while (this.index < this.length && !(this.input[this.index] === "*" && this.peek() === "/")) {
            value += this.input[this.index++];
        }
        if (this.index < this.length) {
            value += this.input[this.index++] + this.input[this.index++];
        }
        return value;
    }

    private readString(quoteType: string): string {
        let value = this.input[this.index++];
        while (this.index < this.length && this.input[this.index] !== quoteType) {
            if (this.input[this.index] === "\\") {
                value += this.input[this.index++];
                if (this.index < this.length) {
                    value += this.input[this.index++];
                }
            } else {
                value += this.input[this.index++];
            }
        }
        if (this.index < this.length) {
            value += this.input[this.index++];
        }
        return value;
    }

    private peek(offset: number = 1): string {
        return this.index + offset < this.length ? this.input[this.index + offset] : "";
    }
}

function postProcessTokens(tokens: Token[]): Token[] {
    const processed: Token[] = [];
    let insideObject = false;
    const braceStack: Token[] = [];

    const nextNonWhitespace = (i: number): Token | undefined => {
        let j = i + 1;
        while (j < tokens.length && tokens[j].type === TokenType.Whitespace) {
            j++;
        }
        return tokens[j];
    };

    const prevNonWhitespace = (i: number): Token | undefined => {
        let j = i - 1;
        while (j >= 0 && tokens[j].type === TokenType.Whitespace) {
            j--;
        }
        return tokens[j];
    };

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];

        if (token.type === TokenType.Punctuation) {
            if (token.value === "{") {
                braceStack.push(token);
                insideObject = true;
            } else if (token.value === "}") {
                braceStack.pop();
                if (braceStack.length === 0) {
                    insideObject = false;
                }
            }
        }

        if (token.type === TokenType.Identifier) {
            const next = nextNonWhitespace(i);
            if (next && next.type === TokenType.Punctuation && next.value === "(") {
                token = { ...token, type: TokenType.FunctionCall };
            }
        }

        if (insideObject && (token.type === TokenType.Identifier || token.type === TokenType.String)) {
            const next = nextNonWhitespace(i);
            if (next && next.type === TokenType.Punctuation && next.value === ":") {
                token = { ...token, type: TokenType.ObjectKey };
            }
        }

        if (insideObject) {
            const prev = prevNonWhitespace(i);
            if (prev && prev.type === TokenType.Punctuation && prev.value === ":") {
                if (token.type !== TokenType.Punctuation || (token.value !== "," && token.value !== "}")) {
                    token = { ...token, type: TokenType.ObjectValue };
                }
            }
        }

        processed.push(token);
    }
    return processed;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function highlightCode(code: string): string {
    const lexer = new Lexer(code);
    let tokens = lexer.tokenize();
    tokens = postProcessTokens(tokens);
    return tokens
        .map((token) =>
            token.type === TokenType.Whitespace
                ? token.value
                : `<span class="${token.type}">${escapeHtml(token.value)}</span>`
        )
        .join("");
}

