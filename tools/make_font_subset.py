# 句意／修辭說明框用的「源流明體」小字型檔（只取資料裡用到的字）。
# 用法：python tools/make_font_subset.py <源流明體 OTF 所在資料夾>
#   字型：源流明體 GenRyuMin2 TW v2.100（ButTaiwan，SIL OFL 1.1；官方 GitHub release GenRyuMin2TW-otf.zip）
#   字集：data/lessons/*.js 每句的 mean / mean2 / meanShort / mean2Short / rhet / rhetShort（去 HTML 標籤）＋常用標點＋說明框按鈕文字
#   輸出：fonts/genryumin-r.woff2（400）、fonts/genryumin-b.woff2（700）、fonts/genryumin-chars.txt（字集，方便 diff）
#   課文資料新增說明後，重跑本程式再 build（字集沒變就不會產生差異）。需要：pip install --user fonttools brotli
import io, os, sys, json, glob
from fontTools import subset
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
src = sys.argv[1] if len(sys.argv) > 1 else None
if not src: raise SystemExit('用法：python tools/make_font_subset.py <OTF 資料夾>')
import subprocess, shutil
NODE = shutil.which('node')
env = dict(os.environ)
if not NODE:   # 家中電腦沒裝 Node：用 VS Code 內建的
    NODE = os.path.expandvars(r'%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe'); env['ELECTRON_RUN_AS_NODE'] = '1'
r = json.loads(subprocess.run([NODE, os.path.join(ROOT, 'tools', 'font_chars.js')], capture_output=True, check=True, env=env).stdout.decode('utf-8'))
n = r['n']
chars = set(r['chars']) | set('，。、；：？！「」『』（）《》〈〉…—─・．,.;:?!()[]0123456789０１２３４５６７８９→←↔＝＋－ 詳短補充免抄')
chars = sorted(c for c in chars if c not in '\\"\n\r\t')
os.makedirs(os.path.join(ROOT, 'fonts'), exist_ok=True)
io.open(os.path.join(ROOT, 'fonts', 'genryumin-chars.txt'), 'w', encoding='utf-8', newline='\n').write(''.join(chars) + '\n')
for w, name in (('R', 'genryumin-r.woff2'), ('B', 'genryumin-b.woff2')):
    cand = glob.glob(os.path.join(src, '**', 'GenRyuMin2TW-%s.otf' % w), recursive=True)
    if len(cand) != 1: raise SystemExit('找不到（或找到多個）GenRyuMin2TW-%s.otf：%r' % (w, cand))
    opt = subset.Options(); opt.flavor = 'woff2'; opt.layout_features = ['*']; opt.name_IDs = ['*']; opt.notdef_outline = True
    fnt = subset.load_font(cand[0], opt)
    s = subset.Subsetter(opt); s.populate(text=''.join(chars)); s.subset(fnt)
    out = os.path.join(ROOT, 'fonts', name); subset.save_font(fnt, out, opt)
    print('%s：%d 字 → %s（%d 位元組）' % (w, len(chars), 'fonts/' + name, os.path.getsize(out)))
print('讀了 %d 課' % n)
