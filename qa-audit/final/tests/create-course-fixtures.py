"""Create clearly labelled synthetic learning media for isolated provider tests."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess, json, hashlib

root = Path('qa-audit/.runtime/final-hosted/QA_TEST_course_media').resolve()
root.mkdir(parents=True, exist_ok=True)
video = root / 'QA_TEST_Python_Basics.mp4'
if video.exists():
    raise SystemExit('Fixture already exists; preserving it.')
font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 28)
small = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 20)
slides = [
 ('1. Variables and arithmetic', ['price = 20', 'quantity = 3', 'total = price * quantity', 'print(total)  # output: 60']),
 ('2. Lists and loops', ['numbers = [2, 4, 6]', 'for number in numbers:', '    print(number * 2)', '# outputs: 4, 8, 12']),
 ('3. Functions', ['def double(value):', '    return value * 2', 'print(double(7))', '# output: 14']),
]
frames=[]
for i,(title,lines) in enumerate(slides):
    frame=root/f'QA_TEST_slide_{i+1}.png'
    image=Image.new('RGB',(960,540),'#0c1422');draw=ImageDraw.Draw(image)
    draw.text((48,36),'QA_TEST / PYTHON BASICS',font=small,fill='#00ff88')
    draw.text((48,95),title,font=font,fill='white')
    for j,line in enumerate(lines):draw.text((48,185+j*55),line,font=font,fill='#d5e3f5')
    draw.text((48,475),'Synthetic test content. Not a published course.',font=small,fill='#aabbcc')
    image.save(frame);frames.append(frame)
source=root/'QA_TEST_concat.txt'
source.write_text(''.join("file '"+frame.as_posix()+"'\nduration 12\n" for frame in frames)+"file '"+frames[-1].as_posix()+"'\n",encoding='utf-8')
ffmpeg=Path('qa-audit/.runtime/video-libs/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe').resolve()
subprocess.run([str(ffmpeg),'-n','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',str(source),'-vf','fps=24','-c:v','libx264','-preset','ultrafast','-threads','2','-b:v','8M','-minrate','8M','-maxrate','8M','-bufsize','16M','-x264-params','nal-hrd=cbr:force-cfr=1','-pix_fmt','yuv420p','-movflags','+faststart',str(video)],check=True)
(root/'QA_TEST_material.txt').write_text('QA_TEST Python basics\n\n'+'\n\n'.join(title+'\n'+'\n'.join(lines) for title,lines in slides)+'\n',encoding='utf-8')
(root/'QA_TEST_captions.srt').write_text('1\n00:00:00,000 --> 00:00:12,000\nQA_TEST Variables: 20 times 3 equals 60.\n\n2\n00:00:12,000 --> 00:00:24,000\nQA_TEST Loop doubles list values to 4, 8, 12.\n\n3\n00:00:24,000 --> 00:00:36,000\nQA_TEST Function double returns value times 2.\n',encoding='utf-8')
report={'fixture':'QA_TEST synthetic Python video','bytes':video.stat().st_size,'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'durationSeconds':36,'purpose':'Real provider upload/analysis probe; not a 2 GiB boundary transfer.'}
(root/'QA_TEST_metadata.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report))
