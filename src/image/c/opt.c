#include <stdlib.h>
#include <string.h>

#define STBI_NO_STDIO
#define STB_IMAGE_IMPLEMENTATION
#define STB_IMAGE_WRITE_IMPLEMENTATION
#define STB_IMAGE_RESIZE_IMPLEMENTATION

#include "third_party/stb_image.h"
#include "third_party/stb_image_resize.h"
#include "third_party/stb_image_write.h"
#include "webp/encode.h"

typedef struct {
    unsigned char *out;
    int cap;
    int len;
    int overflow;
} out_buffer;

static void buf_write(void *context, void *data, int size) {
    out_buffer *b = (out_buffer *)context;

    if (b->len + size > b->cap) {
        b->overflow = 1;

        return;
    }

    memcpy(b->out + b->len, data, (size_t)size);

    b->len += size;
}

int optimize(unsigned char *in, int in_len, unsigned char *out, int out_cap, int dest_width, int format, int quality) {
    int w = 0, h = 0, n = 0;

    unsigned char *pixels = stbi_load_from_memory(in, in_len, &w, &h, &n, 4);

    if (pixels == NULL || w <= 0 || h <= 0) {
        stbi_image_free(pixels);

        return 0;
    }

    unsigned char *src = pixels;
    int sw = w, sh = h;

    if (dest_width > 0 && dest_width < w) {
        int dw = dest_width;
        int dh = (h * dw + w / 2) / w;

        if (dh <= 0) dh = 1;

        unsigned char *resized = (unsigned char *)malloc((size_t)dw * (size_t)dh * 4);

        if (resized == NULL) {
            stbi_image_free(pixels);

            return 0;
        }

        if (stbir_resize_uint8(pixels, w, h, 0, resized, dw, dh, 0, 4) == 0) {
            free(resized);
            stbi_image_free(pixels);

            return 0;
        }

        src = resized;
        sw = dw;
        sh = dh;
    }

    out_buffer b = { out, out_cap, 0, 0 };

    int ok = 0;

    if (format == 0) {
        if (quality < 0) quality = 0;
        if (quality > 100) quality = 100;

        size_t size = 0;

        unsigned char *webp = NULL;

        size = WebPEncodeRGBA(src, sw, sh, sw * 4, (float)quality, &webp);

        if (size > 0 && webp != NULL) {
            if ((int)size <= out_cap) {
                memcpy(out, webp, size);
                b.len = (int)size;
                ok = 1;
            } else {
                b.overflow = 1;
            }

            WebPFree(webp);
        }
    } else if (format == 1) {
        ok = stbi_write_png_to_func(buf_write, &b, sw, sh, 4, src, sw * 4);
    } else if (format == 2) {
        unsigned char *rgb = (unsigned char *)malloc((size_t)sw * (size_t)sh * 3);

        if (rgb != NULL) {
            for (int i = 0; i < sw * sh; i++) {
                unsigned char r = src[i * 4 + 0];
                unsigned char g = src[i * 4 + 1];
                unsigned char bl = src[i * 4 + 2];
                unsigned char a = src[i * 4 + 3];

                unsigned char inv = (unsigned char)(255 - a);

                rgb[i * 3 + 0] = (unsigned char)((r * a + 255 * inv) / 255);
                rgb[i * 3 + 1] = (unsigned char)((g * a + 255 * inv) / 255);
                rgb[i * 3 + 2] = (unsigned char)((bl * a + 255 * inv) / 255);
            }

            ok = stbi_write_jpg_to_func(buf_write, &b, sw, sh, 3, rgb, quality);

            free(rgb);
        }
    }

    if (src != pixels) free(src);
    stbi_image_free(pixels);

    if (b.overflow) return 0;

    return ok ? b.len : 0;
}