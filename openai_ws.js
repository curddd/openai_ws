const WebSocket = require('ws');
const https = require('https');
const fs = require('fs');
const { OpenAI } = require('openai');

const SSL_CERT_PATH = '/etc/ssl/CERT.pem';
const SSL_KEY_PATH = '/etc/ssl/private/KEY.key';

const OPENAI_API_KEY = 'sk-proj-';
const MODEL = 'gpt-3.5-turbo';
const PORT = 64321;

let cert, key;

try {
  cert = fs.readFileSync(SSL_CERT_PATH);
  key = fs.readFileSync(SSL_KEY_PATH);
} catch (err) {
  console.error('Error reading SSL certificate or key:', err);
  process.exit(1);
}

const server = https.createServer({
  cert: cert,
  key: key,
});

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', async (data) => {
    let message;
    if (data instanceof Buffer) {
      // Convert the ArrayBuffer to string
      message = data.toString('utf-8');
    } else if (typeof data === 'string') {
      message = data;
    } else {
      console.error('Unknown message type:', typeof data);
      return;
    }


    try {
      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'system', content: message }],
      });

      ws.send(completion.choices[0].message.content);
    } catch (err) {
      console.error('Error with OpenAI API:', err);
      ws.send('Error processing your request.');
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server is running on wss://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
