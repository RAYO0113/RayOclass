# RayOclass 建置：src/ 是正本 → 產生 index.html＋dist/。
# 用法：python tools/build.py
# 目前做：CSS 依 src/index.src.html 裡的順序接成 dist/app.css（只在第一個 src/css 的位置放一個 <link>）。
#   - 029 的 @import Google 字型：與 index 開頭 <link> 重複（開頭的權重還更多），合併時移除（@import 在檔案中間本來就無效）。
import io, os, re, hashlib
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
def rd(p): return io.open(os.path.join(ROOT, p), encoding='utf-8', newline='').read()
def wr(p, s):
    os.makedirs(os.path.dirname(os.path.join(ROOT, p)) or ROOT, exist_ok=True)
    with io.open(os.path.join(ROOT, p), 'w', encoding='utf-8', newline='') as f: f.write(s)

src = rd('src/index.src.html')
links = list(re.finditer(r'<link rel="stylesheet"(?: id="[^"]*")? href="(src/css/[^"]+)">\n?', src))
parts = []
for m in links:
    css = rd(m.group(1))
    css2 = re.sub(r"^@import url\('https://fonts\.googleapis\.com/[^']*'\);\n", '/* （建置：@import Google 字型已移除，index.html 開頭已載入） */\n', css, flags=re.M)
    if re.search(r'^\s*@import', css2, re.M): raise SystemExit('還有其他 @import：' + m.group(1))
    parts.append('/* ════ %s ════ */\n%s%s' % (m.group(1), css2, '' if css2.endswith('\n') else '\n'))
app_css = ''.join(parts)
# 字型檔（fonts/，給 dist/app.css 用的相對路徑 ../fonts/）帶內容雜湊（V119）
def _font(m):
    fp = os.path.join(ROOT, 'fonts', m.group(1))
    if not os.path.exists(fp): raise SystemExit('找不到字型檔：fonts/' + m.group(1))
    return 'url("../fonts/%s?v=%s")' % (m.group(1), hashlib.sha256(open(fp, 'rb').read()).hexdigest()[:8])
app_css = re.sub(r'url\("\.\./fonts/([\w.-]+)"\)', _font, app_css)
ver = hashlib.sha256(app_css.encode()).hexdigest()[:8]
out = src
first = True
for m in links:
    out = out.replace(m.group(0), ('<link rel="stylesheet" href="dist/app.css?v=%s">\n' % ver) if first else '', 1)
    first = False
if 'src/css/' in out: raise SystemExit('仍有 src/css 連結')
wr('dist/app.css', app_css)

# ── JS：除了 KEEP 這幾個（head 裡的兩段、有全域宣告的兩個主程式），其餘依原順序接成 dist/app.js，放在最後一個 <script> 的位置。
#    每段包 try/catch：一段出錯不會中斷後面；錯誤用 setTimeout 重新丟出，Console 與 window.onerror 照樣看得到。
#    合併前提（已用 scripts/RayOclass/classify_js.js 檢查）：這些檔頂層只有運算式（IIFE），沒有 var/let/const/function 宣告。
KEEP = {'src/js/010_v49-ink-fix.js', 'src/js/012_v50-apple-pencil-priority.js', 'src/js/015_main.js', 'src/js/018_main.js'}
tags = list(re.finditer(r'<script(?: id="[^"]*")? src="(src/js/[^"]+)"></script>\n?', out))
bund = [m for m in tags if m.group(1) not in KEEP]
js_parts = []
for m in bund:
    code = rd(m.group(1))
    js_parts.append('/* ════ %s ════ */\ntry {\n%s%s} catch (e) { setTimeout(function () { throw e; }); }\n' % (m.group(1), code, '' if code.endswith('\n') else '\n'))
app_js = ''.join(js_parts)
jver = hashlib.sha256(app_js.encode()).hexdigest()[:8]
last = bund[-1]
for m in bund:
    out = out.replace(m.group(0), ('<script src="dist/app.js?v=%s"></script>\n' % jver) if m is last else '', 1)
for k in KEEP:
    out = out.replace('src="%s"' % k, 'src="%s?v=%s"' % (k, hashlib.sha256(rd(k).encode()).hexdigest()[:8]), 1)
wr('dist/app.js', app_js)
# 課文資料檔也帶內容雜湊，更新課文後平板不會吃到舊快取（V119）
def _les(m):
    return '<script src="%s?v=%s"></script>' % (m.group(1), hashlib.sha256(rd(m.group(1)).encode()).hexdigest()[:8])
out, nles = re.subn(r'<script src="(data/lessons/\d+\.js)"></script>', _les, out)
if nles == 0: raise SystemExit('找不到課文資料檔 <script>')
print('JS：%d 檔 → dist/app.js（%d 位元組，v=%s）；獨立 %d 檔' % (len(bund), len(app_js.encode()), jver, len(KEEP)))
wr('index.html', out)
print('建置完成：CSS %d 檔 → dist/app.css（%d 位元組，v=%s）；index.html %d 位元組' % (len(links), len(app_css.encode()), ver, len(out.encode())))
