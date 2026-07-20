// 这段代码运行在 Netlify 的服务器上，不是浏览器里，所以不受 CORS 限制，
// 可以随便请求第三方接口，然后把结果原样转发给前端。
const SOURCES = [
  { label: '百度热点', url: 'https://api.vvhan.com/api/hotlist/baiduHot' },
  { label: '知乎热榜', url: 'https://api.vvhan.com/api/hotlist/zhihuHot' },
  { label: '今日头条', url: 'https://api.vvhan.com/api/hotlist/toutiao' }
];

async function fetchOne(src) {
  const res = await fetch(src.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error('http ' + res.status);
  const json = await res.json();
  const arr = json.data || json.result || [];
  if (!arr.length) throw new Error('empty');
  const first = arr[0];
  return {
    source: src.label,
    title: first.title || first.name || '（无标题）',
    url: first.url || first.link || first.mobilUrl || ''
  };
}

exports.handler = async function () {
  const results = await Promise.all(
    SOURCES.map(src => fetchOne(src).catch(() => null))
  );
  const items = results.filter(Boolean);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      // 缓存半小时，减少重复请求第三方接口的次数
      'Cache-Control': 'public, max-age=1800'
    },
    body: JSON.stringify({ items })
  };
};
