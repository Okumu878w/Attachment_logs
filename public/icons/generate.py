# Generate SVG icons with letter "S" for AttachLog PWA
import os

def make_svg(size):
    font_size = int(size * 0.52)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  <rect width="{size}" height="{size}" rx="{int(size*0.22)}" fill="#1C1917"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
    font-family="Georgia, serif" font-size="{font_size}" font-weight="700" fill="#D97706">S</text>
</svg>'''

sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for s in sizes:
    with open(f'/home/claude/attachlog/attachlog/public/icons/icon-{s}x{s}.svg', 'w') as f:
        f.write(make_svg(s))
    print(f'Created icon-{s}x{s}.svg')

# Also create a favicon
with open('/home/claude/attachlog/attachlog/public/favicon.svg', 'w') as f:
    f.write(make_svg(32))
print('Created favicon.svg')
