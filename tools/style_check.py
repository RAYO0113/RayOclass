# 全站樣式檢查（美化第 0 批，2026-11-16）。規範：教學系統專案 docs/規格_全站視覺規範.md
#
# 用法（在倉庫根目錄）：
#   python tools/style_check.py 檔案 [檔案…]     嚴格檢查：新做或整頁換過的頁面，必須 0 項才算過
#   python tools/style_check.py --ratchet         全倉庫與基準比：每個檔每一類的數字只能少、不能多；新檔必須 0
#   python tools/style_check.py --baseline        重寫基準 dev/style_baseline.json（只有老師同意一批上線後才重寫）
#   加 --root 路徑 可以檢查別的倉庫（例：學霸網 stu115），色票仍讀本倉庫的 tokens.css
#
# 檢查五類：
#   color   色票以外的色碼（色票＝tokens.css 裡出現過的顏色，加上純黑、純白）
#   font    明體以外的字體（font-family 要用 var(--rk-ming) 或 inherit）
#   radius  三種以外的圓角（var(--rk-r-s)、var(--rk-r)、var(--rk-r-seal)，另准 0 與 50%）
#   px      字級寫死 px（font-size 要用 em 或 var()）
#   imp     !important
# 某一行真的有理由例外：在那一行寫 rk-allow（CSS 用註解 /* rk-allow：原因 */，HTML 用屬性 data-rk-allow="原因"）。
# 結束碼：0＝過，1＝沒過。只讀檔，不改任何檔案。
import io, json, os, re, sys

HERE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CATS = ['color', 'font', 'radius', 'px', 'imp']
NAME = {'color': '色票以外的色碼', 'font': '明體以外的字體', 'radius': '規定以外的圓角', 'px': '字級寫死 px', 'imp': '!important'}
SKIP_DIRS = {'.git', 'dist', 'node_modules', 'fonts', 'img', 'data'}
SKIP_FILES = {'index.html', '_base.html'}          # 根目錄這兩個是 tools/build.py 產生的，正本在 src/

HEX = re.compile(r'#([0-9a-fA-F]{3,8})\b')
FUNC = re.compile(r'\b(rgba?|hsla?)\(\s*([^()]*?)\s*\)')
NUM3 = re.compile(r'^\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\b')


def rd(p):
    return io.open(p, encoding='utf-8', newline='').read()


def norm_hex(h):
    h = h.lower()
    if len(h) in (3, 4): h = ''.join(c * 2 for c in h[:3])
    elif len(h) in (6, 8): h = h[:6]
    else: return None
    return h


def colors_in(text):
    """回傳 [(位置, 原字串, 正規化後的 rrggbb 或 None)]。var(...) 組成的 rgb()/rgba() 不算。"""
    out = []
    for m in HEX.finditer(text):
        n = norm_hex(m.group(1))
        if n: out.append((m.start(), m.group(0), n))
    for m in FUNC.finditer(text):
        arg = m.group(2)
        if 'var(' in arg: continue
        if m.group(1).startswith('hsl'): out.append((m.start(), m.group(0), None)); continue
        t = NUM3.match(arg)
        if t: out.append((m.start(), m.group(0), '%02x%02x%02x' % tuple(min(255, int(x)) for x in t.groups())))
    return out


def palette():
    css = re.sub(r'/\*.*?\*/', '', rd(os.path.join(HERE, 'tokens.css')), flags=re.S)
    pal = {'000000', 'ffffff'}
    for _, _, n in colors_in(css):
        if n: pal.add(n)
    for m in re.finditer(r'--rk-paper\s*:\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)', css):      # 紙色寫成三個數
        pal.add('%02x%02x%02x' % tuple(int(x) for x in m.groups()))
    return pal


def blank(m):       # 換成等長空白、保留換行，行號才不會跑掉
    return re.sub(r'[^\n]', ' ', m.group(0))


def css_chunks(path, text):
    """回傳 [(起始行號, css 文字)]。.css 整檔；.html 取 <style> 內容與 style="" 屬性。"""
    if path.lower().endswith('.css'): return [(1, text)]
    out = []
    for m in re.finditer(r'<style\b[^>]*>(.*?)</style>', text, flags=re.S | re.I):
        out.append((text.count('\n', 0, m.start(1)) + 1, m.group(1)))
    for m in re.finditer(r'\sstyle\s*=\s*"([^"]*)"', text, flags=re.I):
        ln = text.count('\n', 0, m.start(1)) + 1
        line = text.split('\n')[ln - 1]
        out.append((ln, m.group(1) + (' /* rk-allow */' if 'rk-allow' in line else '')))
    return out


RADIUS_OK = {'0', '50%', 'var(--rk-r-s)', 'var(--rk-r)', 'var(--rk-r-seal)', 'inherit'}


def check(path, pal, is_tokens=False):
    """回傳 {類別: [(行號, 說明)]}"""
    res = {c: [] for c in CATS}
    try: text = rd(path)
    except Exception as e:
        res['color'].append((0, '讀不到檔案：%s' % e)); return res
    for ln0, css in css_chunks(path, text):
        allow = set()
        for i, line in enumerate(css.split('\n')):
            if 'rk-allow' in line: allow.add(i)
        css = re.sub(r'/\*.*?\*/', blank, css, flags=re.S)
        css_nf = re.sub(r'@font-face\s*\{[^}]*\}', blank, css)          # @font-face 裡的 font-family 是定義，不算
        lines = css.split('\n')

        def hit(cat, pos, msg):
            i = css.count('\n', 0, pos)
            if i in allow: return
            res[cat].append((ln0 + i, msg))

        if not is_tokens:
            for pos, raw, n in colors_in(css):
                if n is None or n not in pal: hit('color', pos, raw)
        for m in re.finditer(r'font-family\s*:\s*([^;}]+)', css_nf):
            v = m.group(1).strip()
            if is_tokens and v.startswith('var(--rk-'): continue
            if 'var(--rk-ming)' in v or v in ('inherit', 'var(--ming)'): continue
            hit('font', m.start(), 'font-family: ' + v[:60])
        for m in re.finditer(r'(?<![-\w])font\s*:\s*([^;}]+)', css_nf):
            v = m.group(1).strip()
            if v == 'inherit' or 'var(--rk-ming)' in v: continue
            hit('font', m.start(), 'font: ' + v[:60])
        for m in re.finditer(r'border(?:-(?:top|bottom)-(?:left|right))?-radius\s*:\s*([^;}]+)', css):
            v = re.sub(r'\s*!important', '', m.group(1)).strip()
            toks = [t for t in re.split(r'[\s/]+', v) if t]
            if all(t in RADIUS_OK for t in toks): continue
            hit('radius', m.start(), 'border-radius: ' + v[:50])
        for m in re.finditer(r'font-size\s*:\s*([^;}]+)', css):
            v = m.group(1)
            if re.search(r'(?<![\w.])\d*\.?\d+px', v) and 'var(' not in v and 'clamp(' not in v:
                hit('px', m.start(), 'font-size: ' + v.strip()[:40])
        for m in re.finditer(r'!important', css):
            hit('imp', m.start(), '!important')
    return res


def walk(root):
    out = []
    for d, ds, fs in os.walk(root):
        ds[:] = sorted(x for x in ds if x not in SKIP_DIRS and not x.startswith('.'))
        for f in sorted(fs):
            if not f.lower().endswith(('.css', '.html')): continue
            p = os.path.join(d, f)
            rel = os.path.relpath(p, root).replace('\\', '/')
            if '/' not in rel and f in SKIP_FILES: continue
            if rel == 'tokens.css': continue
            out.append(rel)
    return out


def main():
    a = sys.argv[1:]
    root = HERE
    if '--root' in a:
        i = a.index('--root'); root = os.path.abspath(a[i + 1]); del a[i:i + 2]
    pal = palette()
    base_p = os.path.join(root, 'dev', 'style_baseline.json')

    if '--baseline' in a or '--ratchet' in a:
        cur = {}
        for rel in walk(root):
            r = check(os.path.join(root, rel), pal)
            cur[rel] = {c: len(r[c]) for c in CATS}
        tot = {c: sum(v[c] for v in cur.values()) for c in CATS}
        if '--baseline' in a:
            os.makedirs(os.path.dirname(base_p), exist_ok=True)
            with io.open(base_p, 'w', encoding='utf-8', newline='\n') as f:
                json.dump({'total': tot, 'files': cur}, f, ensure_ascii=False, indent=1, sort_keys=True); f.write('\n')
            print('基準已寫入 dev/style_baseline.json：%d 個檔' % len(cur))
            print('  '.join('%s %d' % (NAME[c], tot[c]) for c in CATS))
            return 0
        if not os.path.exists(base_p):
            print('還沒有基準檔，先跑：python tools/style_check.py --baseline'); return 1
        base = json.load(io.open(base_p, encoding='utf-8'))
        bad = 0
        for rel, v in sorted(cur.items()):
            b = base['files'].get(rel)
            for c in CATS:
                was = b[c] if b else 0
                if v[c] > was:
                    bad += 1
                    print('✗ %s　%s：%d → %d%s' % (rel, NAME[c], was, v[c], '' if b else '（新檔，必須是 0）'))
        print('合計　' + '  '.join('%s %d→%d' % (NAME[c], base['total'][c], tot[c]) for c in CATS))
        print('沒過：%d 項變多了' % bad if bad else '通過：沒有任何一類變多')
        return 1 if bad else 0

    if not a:
        print(__doc__ or '用法見檔頭說明'); print('用法：python tools/style_check.py 檔案…　或　--ratchet　或　--baseline'); return 1
    bad = 0
    for p in a:
        full = p if os.path.isabs(p) else os.path.join(os.getcwd(), p)
        r = check(full, pal, is_tokens=os.path.basename(p) == 'tokens.css')
        n = sum(len(r[c]) for c in CATS)
        bad += n
        print('%s %s：%d 項' % ('✗' if n else '✓', p, n))
        for c in CATS:
            for ln, msg in r[c]: print('    第 %d 行　%s　%s' % (ln, NAME[c], msg))
    print('沒過：共 %d 項' % bad if bad else '通過')
    return 1 if bad else 0


if __name__ == '__main__':
    try: sys.stdout.reconfigure(encoding='utf-8')
    except Exception: pass
    sys.exit(main())
