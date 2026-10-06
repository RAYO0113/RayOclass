// 列出 data/lessons/*.js 中句意／修辭說明用到的字（make_font_subset.py 呼叫；輸出 JSON 字串）
const fs = require('fs'), vm = require('vm'), path = require('path');
const dir = path.join(__dirname, '..', 'data', 'lessons');
const FIELDS = ['mean', 'mean2', 'meanShort', 'mean2Short', 'rhet', 'rhetShort'];
const set = new Set(); let n = 0;
const take = v => { for (const ch of JSON.stringify(v).replace(/<[^>]+>/g, '')) set.add(ch); };
const walk = o => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') for (const k in o) (FIELDS.includes(k) ? take : walk)(o[k]); };
fs.readdirSync(dir).filter(f => /^\d+\.js$/.test(f)).sort().forEach(f => {
  const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), c);
  walk((c.window.TB_LESSONS[0][1] || {}).textPages || []); n++;
});
process.stdout.write(JSON.stringify({ n, chars: [...set].join('') }));
