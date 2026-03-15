const express = require(‘express’);
const cors = require(‘cors’);
const OpenAI = require(‘openai’);

const app = express();
app.use(cors());
app.use(express.json({ limit: ‘20mb’ }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get(’/’, (req, res) => res.json({ status: ‘ok’, message: ‘Uber Trip Analyzer API’ }));

app.post(’/analyze’, async (req, res) => {
try {
const { image } = req.body; // base64 JPEG
if (!image) return res.status(400).json({ error: ‘No image provided’ });

```
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  max_tokens: 400,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${image}`, detail: 'high' }
      },
      {
        type: 'text',
        text: 'From this Uber/Careem trip request screenshot, extract and return ONLY this JSON (no markdown, no explanation):\n{"time":"HH:MM from the clock at the very top of the screen","price":0.0,"rating":0.0,"service":"black","tripType":"normal","tripDist":0.0,"pickupDist":0.0,"route":"pickup address to destination address"}\n\nRules:\n- time: read the system clock at the top of the phone screen (e.g. 6:59, 10:14)\n- service: "corporate" if Business Black or Black Corporate, "comfort" if Comfort, else "black"\n- tripType: "exclusive" if Exclusive/حصري, "airport" if destination is airport, "boost" if Boost+, else "normal"\n- tripDist: trip distance in km (number only)\n- pickupDist: pickup distance in km (number only)\nReturn ONLY the JSON object.'
      }
    ]
  }]
});

const text = response.choices[0].message.content.trim();
const match = text.match(/\{[\s\S]*\}/);
if (!match) return res.status(422).json({ error: 'Could not extract JSON', raw: text });

const parsed = JSON.parse(match[0]);
res.json({ success: true, data: parsed });
```

} catch (err) {
console.error(err);
res.status(500).json({ error: err.message });
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
