const SOURCES = [
  { label: '百度热点', url: 'https://api.vvhan.com/api/hotlist/baiduHot' },
  { label: '知乎热榜', url: 'https://api.vvhan.com/api/hotlist/zhihuHot' },
  { label: '今日头条', url: 'https://api.vvhan.com/api/hotlist/toutiaoHot' }
];

async function fetchOne(src) {
  const res = await fetch(src.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const text = await res.text();
  if (!res.ok) throw new Error('http ' + res.status + ': ' + text.slice(0, 200));
  const json = JSON.parse(text);
  const arr = json.data || json.result || [];
  if (!arr.length) throw new Error('empty array, raw: ' + text.slice(0, 200));
  const first = arr[0];
  return {
    source: src.label,
    title: first.title || first.name || '（无标题）',
    url: first.url || first.link || first.mobilUrl || ''
  };
}

exports.handler = async function () {
  const results = await Promise.all(
    SOURCES.map(src => fetchOne(src).then(r => ({ ok: true, r })).catch(e => ({ ok: false, error: e.message, source: src.label })))
  );
  const items = results.filter(r => r.ok).map(r => r.r);
  const errors = results.filter(r => !r.ok);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ items, errors })
  };
};
