#!/usr/bin/env bash
# compiles src/image/c/opt.c (stb_image + stb_image_resize + stb_image_write + libwebp)
# into a self-contained WASM module: src/image/opt.wasm
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
C_DIR="$ROOT/src/image/c"
OUT="$ROOT/src/image/opt.wasm"
WORK="$ROOT/.temp/wasm"

LIBWEBP_VERSION="1.4.0"
LIBWEBP_URL="https://github.com/webmproject/libwebp/archive/refs/tags/v${LIBWEBP_VERSION}.tar.gz"
WASI_LIBC_VERSION="v0.1-alpha"
WASI_LIBC_URL="https://github.com/WebAssembly/wasi-libc/releases/download/${WASI_LIBC_VERSION}/wasi-sysroot.tar.xz"

command -v clang >/dev/null 2>&1 || { echo "clang not found." >&2; exit 1; }
command -v wasm-ld >/dev/null 2>&1 || { echo "wasm-ld not found." >&2; exit 1; }

TARGET="wasm32-wasip1"
if ! clang --target="$TARGET" --print-target-triple >/dev/null 2>&1; then
    TARGET="wasm32-wasi"
fi

mkdir -p "$WORK"

if [ ! -d "$WORK/libwebp" ]; then
    curl -fsSL "$LIBWEBP_URL" -o "$WORK/libwebp.tar.gz"
    tar -xzf "$WORK/libwebp.tar.gz" -C "$WORK"
    mv "$WORK/libwebp-${LIBWEBP_VERSION}" "$WORK/libwebp"
    cp "$C_DIR/libwebp-config.h" "$WORK/libwebp/src/webp/config.h"
fi

if [ ! -d "$WORK/sysroot" ]; then
    curl -fsSL "$WASI_LIBC_URL" -o "$WORK/wasi-sysroot.tar.xz"
    tar -xJf "$WORK/wasi-sysroot.tar.xz" -C "$WORK"
fi

SYSROOT="$WORK/sysroot"
LIBDIR="$(find "$SYSROOT/lib" -maxdepth 1 -type d -name 'wasm32-*' | head -1)"
[ -n "$LIBDIR" ] || { echo "wasi-libc sysroot missing wasm32 lib dir" >&2; exit 1; }

FLAGS="-O3 -DNDEBUG -DHAVE_CONFIG_H -ffreestanding -fno-stack-protector -nostdlib"
INCS="--sysroot=$SYSROOT -I$C_DIR -I$C_DIR/third_party -I$WORK/libwebp -I$WORK/libwebp/src"

OBJDIR="$WORK/obj"
rm -rf "$OBJDIR"
mkdir -p "$OBJDIR"

compile() {
    clang --target="$TARGET" $FLAGS $INCS -c "$1" -o "$OBJDIR/$(basename "$1" .c).o"
}

for f in "$WORK"/libwebp/src/enc/*.c "$WORK"/libwebp/src/utils/*.c; do compile "$f"; done

for f in sharpyuv sharpyuv_cpu sharpyuv_csp sharpyuv_dsp sharpyuv_gamma; do
    compile "$WORK/libwebp/sharpyuv/$f.c"
done
for f in alpha_processing cost cpu dec dec_clip_tables enc filters lossless lossless_enc \
         rescaler ssim upsampling yuv; do
    compile "$WORK/libwebp/src/dsp/$f.c"
done
compile "$C_DIR/opt.c"

clang --target="$TARGET" -O3 -nostdlib \
    -Wl,--no-entry \
    -Wl,--export=optimize \
    -Wl,--export=malloc \
    -Wl,--export=free \
    -Wl,--export-memory \
    -Wl,--initial-memory=16777216 \
    -Wl,--max-memory=134217728 \
    -L"$LIBDIR" -lc -lm \
    -o "$OUT" "$OBJDIR"/*.o

echo "Built $OUT ($(wc -c < "$OUT") bytes)"
