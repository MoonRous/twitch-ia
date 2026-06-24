const http = require('http');
const https = require('https');
const url = require('url');

const server = http.createServer(async (req, res) => {
  const params = url.parse(req.url, true).query;
  const user = params.user || 'Viewer';
  const q = params.q || '';

  if (!q) {
    res.end('Escribe !ia [tu pregunta]');
    return;
  }

  const body = JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 150,
    system: 'Eres TwitchGPT. Responde en maximo 2 oraciones cortas, con humor gamer y en español.',
    messages: [{ role: 'user', content: user + ' pregunta: ' + q }]
  });

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        const texto = json.content[0].text;
        res.end('🤖 ' + texto);
      } catch(e) {
        res.end('Error: ' + data);
      }
    });
  });

  apiReq.on('error', e => res.end('Error: ' + e.message));
  apiReq.write(body);
  apiReq.end();
});

server.listen(process.env.PORT || 3000);
