// Практикум 14: найпростіший сервер на Express для конвертера валют
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Фіксований локальний об'єкт курсів валют (запасний варіант, якщо Frankfurter недоступний); форма така сама, як у відповіді Frankfurter
const ratesData = {
  base: 'USD',
  date: '2026-11-16',
  rates: { USD: 1, EUR: 0.92, UAH: 41.5, GBP: 0.79, PLN: 3.95 }
};

// GET /api/rates - без параметрів віддає весь об'єкт курсів, з параметрами from і to - рахує суму на сервері
app.get('/api/rates', (req, res) => {
  const { from, to } = req.query;

  if (from === undefined && to === undefined) {
    return res.json(ratesData);
  }

  const fromCode = String(from).toUpperCase();
  const toCode = String(to).toUpperCase();
  const fromRate = ratesData.rates[fromCode];
  const toRate = ratesData.rates[toCode];

  if (fromRate === undefined || toRate === undefined) {
    return res.status(404).json({ error: 'Валюту не знайдено' });
  }

  const amount = Number(req.query.amount) || 1;
  const rate = toRate / fromRate;

  res.json({
    from: fromCode,
    to: toCode,
    amount,
    rate: Math.round(rate * 10000) / 10000,
    result: Math.round(amount * rate * 100) / 100
  });
});

// Будь-який інший шлях під /api - 404 з JSON-повідомленням
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Не знайдено' });
});

// Роздаємо статичні файли застосунку (index.html, css, script.js) з кореня проєкту - той самий сервер і той самий порт, що й API
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => console.log(`Сервер запущено на http://localhost:${PORT}`));