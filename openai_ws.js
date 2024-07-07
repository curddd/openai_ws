const WebSocket = require('ws');
const https = require('https');
const fs = require('fs');
const openAI = require("openai");

const SSL_CERT_PATH = 'path/to/your/cert.pem';
const SSL_KEY_PATH = 'path/to/your/key.pem';

const OPENAI_API_KEY = "your-openai-api-key";
const MODEL = "gpt-3.5-turbo";
const PORT = 8080;

const server = https.createServer({
	cert: fs.readFileSync(SSL_CERT_PATH),
	key: fs.readFileSync(SSL_KEY_PATH)
});

const openai = new openAI({ apiKey: OPENAI_API_KEY });


const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {

	ws.on('message', async (message) => {


		const completion = await openai.chat.completions.create({
			messages: [{ role: "system", content: message }],
			model: MODEL,
		});
		ws.send(completion.choices[0]);
	});


});

server.listen(PORT, () => {
	console.log(`WebSocket server is running on wss://localhost:${PORT}`);
});
