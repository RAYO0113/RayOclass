# 閱讀題組「原文全螢幕」用的源流明體（V136，老師 10/18：「宋體比較好看」）。
# 和 make_font_subset.py 分開：那份只收句意／修辭說明的字；這份收 data/lessons/*.js 裡出現的所有中日韓字（含題幹、選項、講義），
#   只有打開原文頁時瀏覽器才會下載（168_v136-read-js 用的 font-family "RayGenRyuRead"）。
# 用法：python tools/make_font_subset_read.py <源流明體 OTF 所在資料夾>（教學系統專案 tools/fonts/）
#   輸出：fonts/genryumin-read-r.woff2、fonts/genryumin-read-b.woff2、fonts/genryumin-read-chars.txt
#   課文資料新增後重跑再 build（字集沒變就不會產生差異）。需要：pip install --user fonttools brotli
import io, os, re, sys, glob
from fontTools import subset
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
src = sys.argv[1] if len(sys.argv) > 1 else None
if not src: raise SystemExit('用法：python tools/make_font_subset_read.py <OTF 資料夾>')
chars = set()
for f in sorted(glob.glob(os.path.join(ROOT, 'data', 'lessons', '*.js'))):
    t = io.open(f, encoding='utf-8').read()
    t = re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), t)
    chars.update(c for c in t if ord(c) > 0x2E7F)          # 中日韓字、全形標點、注音、圈號
chars.update('，。、；：「」『』！？（）《》〈〉—…─．‧·○□①②③④⑤⑥⑦⑧⑨⑩')
chars.update(chr(c) for c in range(0x20, 0x7F))            # 英數
text = ''.join(sorted(chars))
for w, name in (('R', 'r'), ('B', 'b')):
    opt = subset.Options(); opt.flavor = 'woff2'; opt.layout_features = ['*']; opt.name_IDs = ['*']; opt.notdef_outline = True
    font = subset.load_font(os.path.join(src, 'GenRyuMin2TW-%s.otf' % w), opt)
    s = subset.Subsetter(opt); s.populate(text=text); s.subset(font)
    out = os.path.join(ROOT, 'fonts', 'genryumin-read-%s.woff2' % name)
    subset.save_font(font, out, opt)
    print(out, os.path.getsize(out) // 1024, 'KB')
io.open(os.path.join(ROOT, 'fonts', 'genryumin-read-chars.txt'), 'w', encoding='utf-8', newline='\n').write(text + '\n')
print('字數', len(text))
