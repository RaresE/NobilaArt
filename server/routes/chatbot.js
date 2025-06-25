const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { Op } = require('sequelize');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/suggest-product', async (req, res) => {
  const { message } = req.body;

  const extractPrompt = `
Extrage dimensiunile (lungime, latime, inaltime) din urmatorul mesaj, daca exista, si raspunde DOAR cu un JSON de forma {"lungime":..., "latime":..., "inaltime":...}. 
Daca nu exista, raspunde DOAR cu null, fara niciun alt text sau explicatie.
Mesaj: "${message}"
`;
  let dims;
  try {
    const aiResp = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: extractPrompt }],
      temperature: 0
    });
    console.log('AI extract response:', aiResp.choices[0].message.content); // DEBUG
    dims = JSON.parse(aiResp.choices[0].message.content);
  } catch (e) {
    console.error('Eroare la extragere dimensiuni:', e);
    return res.json({ reply: "Nu am putut înțelege dimensiunile. Te rog să le scrii clar (ex: 200x80x40 cm)." });
  }

  if (!dims || !dims.lungime || !dims.latime || !dims.inaltime) {
    return res.json({ reply: "Te rog să specifici dimensiunile spațiului (lungime, lățime, înălțime)." });
  }

  const products = await Product.findAll({ 
    where: { 
      stock: { [Op.gt]: 0 },
      isVisible: true 
    } 
  });
  const suggestions = products.filter(p => {
    if (!p.dimensions) return false;
    const dimsProd = p.dimensions.match(/(\d+)\s*[xX]\s*(\d+)\s*[xX]\s*(\d+)/);
    if (!dimsProd) return false;
    const pl = Number(dimsProd[1]);
    const pw = Number(dimsProd[2]);
    const ph = Number(dimsProd[3]);
    return pl <= dims.lungime && pw <= dims.latime && ph <= dims.inaltime;
  });

  if (suggestions.length === 0) {
    return res.json({ reply: 'Nu am găsit produse pe stoc care să se potrivească acestor dimensiuni.' });
  }

  const productList = suggestions.map(p => `- ${p.name} (${p.dimensions})`).join("\n");
  const suggestPrompt = `Clientul are un spațiu de ${dims.lungime}x${dims.latime}x${dims.inaltime} cm. Iată produsele disponibile care se potrivesc:\n${productList}\nFormulează un răspuns prietenos și scurt pentru client, recomandând unul sau mai multe produse din listă.`;

  try {
    const aiResp2 = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: suggestPrompt }],
      temperature: 0.7
    });
    const reply = aiResp2.choices[0].message.content;
    return res.json({ reply });
  } catch (e) {
    console.error('Eroare la generarea sugestiei:', e);
    return res.json({ reply: "A apărut o eroare la generarea sugestiei. Încearcă din nou." });
  }
});

module.exports = router; 