# 課文畫卷自動檢查。規範：教學系統專案 docs/規格_課文畫卷製作規範.md §10
# 用法（在倉庫根目錄）：python tools/hj_check.py <課代號>      例：python tools/hj_check.py changgan
# 做四件事，全部過才算過（結束碼 0）：
#   1. 樣式檢查：hj/index.html 必須 0 項（tools/style_check.py）
#   2. 用無頭瀏覽器開 hj/index.html?l=<課>&selftest=1，在 iPad（1194×834）與手機（375×812）各把每一步走一遍：
#      建卷有沒有報錯（找不到注釋／字義／補充框／年齡表的詞）、修辭引句和課文是否一致、每一步該出字卡還是看畫、
#      字有沒有超出字卡、有沒有左右超出、有沒有殘留的原始標記
#   3. 字集：設定檔與引擎用到的字，源流明體字集裡都要有（沒有就要重跑 tools/make_font_subset_read.py）
#   4. 設定檔每一題提問都要有回答 a 與來源 src；回答裡不可以有「參考回答」
# 「提醒」不算沒過（回答太長要滑動、哪幾段還沒有新畫），但要寫進交接。
# 只讀檔，不改任何檔案。需要 Edge 或 Chrome。
import functools, http.server, io, json, os, re, socket, subprocess, sys, tempfile, threading

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BROWSERS = [r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe', r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
            r'C:\Program Files\Google\Chrome\Application\chrome.exe', r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe']


def rd(p):
    return io.open(p, encoding='utf-8').read()


def serve():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return port


def selftest(exe, port, key, w, h):
    # 11/17：有的電腦 Edge 無頭模式連不到 127.0.0.1（整頁空白）→ 換下一個找得到的瀏覽器再試
    res = None
    for b in [exe] + [x for x in BROWSERS if x != exe and os.path.exists(x)]:
        res = _selftest1(b, port, key, w, h)
        if not res.get('_empty'): break
    res.pop('_empty', None)
    return res


def _selftest1(exe, port, key, w, h):
    prof = tempfile.mkdtemp(prefix='hjcheck_')
    url = 'http://127.0.0.1:%d/hj/index.html?l=%s&selftest=1' % (port, key)
    out = subprocess.run([exe, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--user-data-dir=' + prof, '--window-size=%d,%d' % (w, h),
                          '--virtual-time-budget=60000', '--dump-dom', url], capture_output=True, timeout=180).stdout.decode('utf-8', 'replace')
    m = re.search(r'<pre id="selftest" hidden[^>]*>(.*?)</pre>', out, re.S)      # 要有 hidden：原始碼註解裡也有 <pre id="selftest"> 這串字
    if not m:
        msg = re.sub(r'<[^>]+>', '', out)[-300:].strip()
        return {'errors': ['頁面沒有跑完自我檢查（可能整頁報錯）：' + msg], 'warnings': [], '_empty': not out.strip()}
    import html
    return json.loads(html.unescape(m.group(1)))


def main():
    try: sys.stdout.reconfigure(encoding='utf-8')
    except Exception: pass
    if len(sys.argv) < 2: print('用法：python tools/hj_check.py <課代號>'); return 1
    key = re.sub(r'[^\w-]', '', sys.argv[1]); bad = 0
    cfg_p = os.path.join(ROOT, 'hj', 'lessons', key + '.js')
    if not os.path.exists(cfg_p): print('✗ 找不到設定檔 hj/lessons/%s.js' % key); return 1
    cfg = rd(cfg_p)

    # 1. 樣式
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'style_check.py'), 'hj/index.html'], cwd=ROOT, capture_output=True)
    ok = r.returncode == 0; bad += not ok
    print('%s 樣式檢查 hj/index.html' % ('✓' if ok else '✗'));
    if not ok: print(r.stdout.decode('utf-8', 'replace'))

    # 2. 走每一步
    exe = next((b for b in BROWSERS if os.path.exists(b)), None)
    if not exe: print('✗ 找不到 Edge 或 Chrome，沒辦法走步驟'); bad += 1
    else:
        port = serve()
        for name, w, h in (('iPad 1194×834', 1194, 834), ('手機 375×812', 375, 812)):
            res = selftest(exe, port, key, w, h)
            ok = not res['errors']; bad += not ok
            print('%s %s：%s 段、%s 步，錯誤 %d、提醒 %d' % ('✓' if ok else '✗', name, res.get('segs', '?'), res.get('steps', '?'), len(res['errors']), len(res['warnings'])))
            for e in res['errors']: print('    ✗ ' + e)
            for e in res['warnings']: print('    提醒　' + e)

    # 3. 字集
    chars = set(rd(os.path.join(ROOT, 'fonts', 'genryumin-read-chars.txt')))
    miss = sorted({c for c in cfg + rd(os.path.join(ROOT, 'hj', 'index.html')) if ord(c) > 0x2E7F and c not in chars})
    ok = not miss; bad += not ok
    print('%s 字集%s' % ('✓' if ok else '✗', '' if ok else '：缺 %d 個字「%s」→ 重跑 python tools/make_font_subset_read.py <源流明體資料夾>' % (len(miss), ''.join(miss))))

    # 4. 提問都要有回答與來源
    qs = re.findall(r"\{\s*kind:\s*'(?:open|choice)'.*?\}(?=\s*[,\]])", cfg, re.S)
    prob = []
    for q in qs:
        title = (re.search(r"q:\s*'([^']*)'", q) or [None, '?'])[1][:16]
        if not re.search(r"\ba:\s*'[^']+'", q): prob.append('「%s…」沒有回答 a' % title)
        if not re.search(r"\bsrc:\s*'[^']+'", q): prob.append('「%s…」沒有來源 src' % title)
        if '參考回答' in q: prob.append('「%s…」裡有「參考回答」四個字' % title)
    ok = not prob; bad += not ok
    print('%s 提問 %d 題都有回答與來源' % ('✓' if ok else '✗', len(qs)))
    for e in prob: print('    ✗ ' + e)

    print('沒過：%d 類有問題' % bad if bad else '通過')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
