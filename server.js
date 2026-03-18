const express = require(‘express’);
const cors = require(‘cors’);
const OpenAI = require(‘openai’);
const path = require(‘path’);

const app = express();
app.use(cors());
app.use(express.json({ limit: ‘20mb’ }));
app.use(express.static(path.join(__dirname, ‘public’)));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory storage (persists while server is running)
// For production with multiple restarts, use a database
let trips = [];

// ── Health check ──
app.get(’/api/health’, (req, res) => {
res.json({ status: ‘ok’, trips: trips.length });
});

// ── Get all trips ──
app.get(’/api/trips’, (req, res) => {
res.json({ success: true, trips });
});

// ── Add trip ──
app.post(’/api/trips’, (req, res) => {
const trip = req.body;
if (!trip || !trip.price || !trip.dist) {
return res.status(400).json({ error: ‘Missing required fields’ });
}
trip.id = Date.now() + Math.random();
trips.unshift(trip);
res.json({ success: true, trip });
});

// ── Delete trip ──
app.delete(’/api/trips/:id’, (req, res) => {
const id = parseFloat(req.params.id);
trips = trips.filter(t => t.id !== id);
res.json({ success: true });
});

// ── Analyze image with OpenAI ──
app.post(’/api/analyze’, async (req, res) => {
try {
const { image } = req.body;
if (!image) return res.status(400).json({ error: ‘No image provided’ });

```
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  max_tokens: 500,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'image_url',
        image_url: { url: 'data:image/jpeg;base64,' + image, detail: 'high' }
      },
      {
        type: 'text',
        text: 'Extract trip data from this Uber/Careem screenshot. Return ONLY a JSON object, no markdown.\nFormat: {"time":"HH:MM from the clock at top of screen","price":0.0,"rating":0.0,"service":"black","tripType":"normal","tripDist":0.0,"pickupDist":0.0,"route":"pickup to destination"}\nRules: service=corporate if Business Black or Black Corporate, comfort if Comfort, else black. tripType=exclusive if Exclusive or حصري, airport if airport, boost if Boost+, else normal. Return ONLY JSON.'
      }
    ]
  }]
});

const text = response.choices[0].message.content.trim();
const s = text.indexOf('{');
const e = text.lastIndexOf('}');
if (s === -1 || e === -1) return res.status(422).json({ error: 'No JSON in response', raw: text });

const data = JSON.parse(text.substring(s, e + 1));
res.json({ success: true, data });
```

} catch (err) {
console.error(err.message);
res.status(500).json({ error: err.message });
}
});

// ── Serve frontend for all other routes ──
app.get(’*’, (req, res) => {
res.sendFile(path.join(__dirname, ‘public’, ‘index.html’));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(’Server running on port ’ + PORT));
