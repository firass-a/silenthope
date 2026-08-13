from PIL import Image, ImageFilter
import os

src = r"C:\Users\ASUS\.cursor\projects\d-webprototypes-silent-hope\assets\c__Users_ASUS_AppData_Roaming_Cursor_User_workspaceStorage_5ba595b1303993010ae21a1d0fa42933_images_image-7f5fd57d-84f6-409a-9895-6358d2180b8f.png"
out_dir = r"d:\webprototypes\silent hope\public\brand"
os.makedirs(out_dir, exist_ok=True)

im = Image.open(src).convert("RGBA")
w, h = im.size
pixels = im.load()

corners = [pixels[2, 2], pixels[w - 3, 2], pixels[2, h - 3], pixels[w - 3, h - 3]]
br = sum(c[0] for c in corners) / 4
bg = sum(c[1] for c in corners) / 4
bb = sum(c[2] for c in corners) / 4
print("bg sample", br, bg, bb, "size", w, h)


def dist(r, g, b):
    return ((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2) ** 0.5


# Build alpha carefully — keep purple/gold, kill off-white plate
for y in range(h):
    for x in range(w):
        r, g, b, _a = pixels[x, y]
        d = dist(r, g, b)
        luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
        chroma = max(r, g, b) - min(r, g, b)

        # Gold sparkle is high chroma yellow — always keep
        is_gold = r > 180 and g > 140 and b < 140 and chroma > 40
        # Purple brand ink — keep
        is_purple = b > r and chroma > 18 and luma < 240

        if is_gold or is_purple:
            pixels[x, y] = (r, g, b, 255)
        elif luma > 238 and chroma < 16:
            pixels[x, y] = (r, g, b, 0)
        elif d < 22 and chroma < 14:
            pixels[x, y] = (r, g, b, 0)
        elif d < 40 and chroma < 22:
            alpha = int(max(0, min(255, (d - 22) / 18 * 220)))
            pixels[x, y] = (r, g, b, alpha)
        else:
            pixels[x, y] = (r, g, b, 255)

# Decontaminate semi-transparent edge pixels toward brand purple (reduce white fringe)
px = im.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if 0 < a < 240:
            # blend away background contamination
            t = a / 255
            # assume bg roughly corners
            r2 = int((r - br * (1 - t)) / max(t, 0.001))
            g2 = int((g - bg * (1 - t)) / max(t, 0.001))
            b2 = int((b - bb * (1 - t)) / max(t, 0.001))
            px[x, y] = (
                max(0, min(255, r2)),
                max(0, min(255, g2)),
                max(0, min(255, b2)),
                a,
            )

bbox = im.getbbox()
if bbox:
    pad = 32
    left = max(0, bbox[0] - pad)
    top = max(0, bbox[1] - pad)
    right = min(w, bbox[2] + pad)
    bottom = min(h, bbox[3] + pad)
    im = im.crop((left, top, right, bottom))

# Light sharpen only opaque core
rgb = im.convert("RGB")
sharp = rgb.filter(ImageFilter.UnsharpMask(radius=1.0, percent=90, threshold=3))
r_ch, g_ch, b_ch = sharp.split()
a_ch = im.split()[3]
im = Image.merge("RGBA", (r_ch, g_ch, b_ch, a_ch))

target_w = 720
master = im.resize(
    (target_w, int(im.height * target_w / im.width)),
    Image.Resampling.LANCZOS,
)

# Clean near-zero alpha
px = master.load()
mw, mh = master.size
for y in range(mh):
    for x in range(mw):
        r, g, b, a = px[x, y]
        if a < 8:
            px[x, y] = (0, 0, 0, 0)

master.save(os.path.join(out_dir, "logo.png"), "PNG", optimize=True)

icon_size = 256
icon = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
scale = min((icon_size - 24) / master.width, (icon_size - 24) / master.height)
nw, nh = int(master.width * scale), int(master.height * scale)
resized = master.resize((nw, nh), Image.Resampling.LANCZOS)
icon.paste(resized, ((icon_size - nw) // 2, (icon_size - nh) // 2), resized)
icon.save(os.path.join(out_dir, "logo-icon.png"), "PNG", optimize=True)

for size, name in [(32, "favicon-32.png"), (48, "favicon-48.png"), (180, "apple-touch-icon.png")]:
    icon.resize((size, size), Image.Resampling.LANCZOS).save(
        os.path.join(out_dir, name), "PNG", optimize=True
    )

print("saved", out_dir, "master", master.size)
