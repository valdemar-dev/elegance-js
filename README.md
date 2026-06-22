# Elegance

Elegance is a TypeScript framework for web applications. It provides file‑system routing, reactive state, server‑side rendering, and client‑side interactivity in a single codebase.

## Features

- Ridiculous speed: Up to ~24x faster build times compared to Next.JS, and up to ~1400x raw RPS on API Routes.
- Optimized: 4KB client runtime
- File‑system routing: pages and API endpoints are defined by the directory structure.
- TSX support: use TSX with no runtime overhead.
- Server & Client hybrid: You can write server & client-code in 1 file with no issues.
- Reactive: atoms and components with automatic dependency tracking.
- Dynamic rendering: opt into per‑request rendering or statically enumerate paths.
- Server Actions: Inline API routes into your page files for faster development times.
- Middleware: scoped request processing with the ability to pass data to downstream handlers.
- Built‑in bundling: code splitting and advanced dead‑code elimination (DCE).
- API routes: define `GET`, `POST`, `PUT`, `DELETE`, and `OPTIONS` handlers.

## Quick Start

```bash
npx create-elegance-app my-app
cd my-app
npx elegance
```

Visit `http://localhost:3000` to see the default page.

## Example

A simple counter:

```tsx
const counter = state(0);

export default function CounterPage() {
    return div(
        button({
            onClick: () => counter.value++,
        }, 
            `Counter: ${counter.value}`
        )
    );
}
```

A reusable component version:

```tsx
const Counter = component({
    atoms: {
        counter: 0,
    },
    view(_, { counter }) {
        return button({
            onClick: () => counter.value++,
        }, 
            `Counter: ${counter.value}`
        );
    }
});

export default function Page() {
    return Counter();
}
```

## Project Structure

```
my-app/
├── pages/
│   ├── page.tsx          # / (home)
│   ├── about/
│   │   └── page.tsx      # /about
│   ├── api/
│   │   └── route.ts      # /api/*
│   ├── [slug]/
│   │   └── page.tsx      # dynamic routes
│   └── middleware.ts     # global middleware
└── ...
```

## Documentation

Full documentation is available via [Our Website](https://elegance.js.org/)

## License

MIT