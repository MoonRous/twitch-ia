const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  const q = url.parse(req.url, true).query;
  const user = q.user || 'Viewer';
  const pregunta = q.q || '';

  if (!pregunta) {
    res.writeHead(200);
    res.end('Escribe !ia [pregunta]');
    return;
  }

  const body = JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 150,
    system: 'Eres TwitchGPT. Responde en maximo 2 oraciones con humor gamer en español.',
    messages: [{ role: 'user', content: user + ' pregunta: ' + pregunta }]
  });

  const req2 = https.request({
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    }
  }, (r) => {
    let data = '';
    r.on('data', c => data += c);
    r.on('end', () => {
      try {
        const json = JSON.parse(data);
        res.writeHead(200);
        res.end('🤖 ' + json.content[0].text);
      } catch(e) {
        res.writeHead(200);
        res.end('Error: ' + data);
      }
    });
  });

  req2.on('error', e => {
    res.writeHead(200);
    res.end('Error: ' + e.message);
  });

  req2.write(body);
  req2.end();

}).listen(PORT, '0.0.0.0', () => {
  console.log('Servidor corriendo en puerto ' + PORT);
});
