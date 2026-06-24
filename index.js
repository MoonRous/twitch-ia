const express = require('express');
const app = express();

app.get('/ia', async (req, res) => {
  const user = req.query.user || 'Viewer';
  const q = req.query.q || '';
  if (!q) return res.send('Escribe !ia [tu pregunta]');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 150,
        system: 'Eres TwitchGPT. Responde en máximo 2 oraciones cortas, con humor gamer y en español.',
        messages: [{ role: 'user', content: `${user} pregunta: ${q}` }]
      })
    });
    const data = await r.json();
    const texto = data?.content?.[0]?.text;
    if (!texto) return res.send('Error: ' + JSON.stringify(data));
    res.send('🤖 ' + texto);
  } catch(e) {
    res.send('Error: ' + e.message);
  }
});

app.listen(process.env.PORT || 3000);
