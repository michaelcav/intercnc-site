"""Generate responsive assets; originals remain available for enlargement."""
from pathlib import Path
import subprocess
import sys
sys.path.insert(0, str(Path(__file__).parent / '.tools-media'))
from PIL import Image
import imageio_ffmpeg

assets = Path(__file__).parent / 'assets'
for name in ['itmc-650', 'itmc-800', 'itmc-1100', 'itb-420', 'itf-2242', 'convencional', 'inclinado']:
    with Image.open(assets / (name + '.webp')) as image:
        for width in [480, 800]:
            resized = image.copy()
            resized.thumbnail((width, width), Image.Resampling.LANCZOS)
            destination = assets / f'{name}-{width}.webp'
            resized.save(destination, 'WEBP', quality=80, method=6)
            print(destination.name, destination.stat().st_size)

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
for name in ['hero-poster.jpg', 'category-poster.jpg']:
    with Image.open(assets / name) as image:
        image.thumbnail((1600, 1000), Image.Resampling.LANCZOS)
        image.save(assets / name, quality=77, optimize=True, progressive=True)

for source, destination, width in [
    ('categorias-usinagem.webm', 'categorias-usinagem.mp4', 1280),
    ('usinagem.mp4', 'usinagem-mobile.mp4', 720),
    ('usinagem.mp4', 'usinagem-desktop.mp4', 1280),
]:
    subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y',
                    '-i', str(assets / source), '-an', '-vf', f'scale={width}:-2',
                    '-c:v', 'libx264', '-threads', '2', '-preset', 'medium', '-crf', '28',
                    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                    str(assets / destination)], check=True)
    print(destination, (assets / destination).stat().st_size)
