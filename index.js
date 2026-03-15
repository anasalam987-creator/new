const express = require(‘express’);
const cors = require(‘cors’);
const OpenAI = require(‘openai’);

const app = express();
app.use(cors());
app.use(express.json({ limit: ‘20mb’ }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get(’/’, (req, res) => {
res.json({ status: ‘ok’ });
});

app.post(’/analyze’, async (req, res) => {
try {
const image = req.body.image;
if (!image) return res.status(400).json({ error: ‘No image’ });

```
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  max_tokens: 400,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'image_url',
        image_url: {
          url: 'data:image/jpeg;base64,' + image,
          detail: 'high'
        }
      },
      {
        type: 'text',
        text: 'Extract data from this Uber/Careem screenshot. Return ONLY JSON: {"time":"HH:MM from top clock","price":0.0,"rating":0.0,"service":"black","tripType":"normal","tripDist":0.0,"pickupDist":0.0,"route":"from to"}. service=corporate if Business Black, comfort if Comfort, else black. tripType=exclusive if Exclusive, airport if airport, boost if Boost+.'
      }
    ]
  }]
});

const text = response.choices[0].message.content.trim();
const match = text.match(/\{[\s\S]*\}/);
if (!match) return res.status(422).json({ error: 'No JSON', raw: text });

res.json({ success: true, data: JSON.parse(match[0]) });
```

} catch (err) {
res.status(500).json({ error: err.message });
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(’Running on port ’ + PORT));
