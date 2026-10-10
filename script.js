console.log('script.js підключено');

const rates = { USD: 1, EUR: 0.92, UAH: 41.5 };

// Виводить у консоль усі валюти та їхні курси з об'єкта
function printRates(ratesObj) {
  for (const code of Object.keys(ratesObj)) {
    console.log(`${code}: ${ratesObj[code]}`);
  }
}

printRates(rates);

const LARGE_AMOUNT_THRESHOLD = 1000;

// Перевіряє, чи результат конвертації перевищує поріг, і виводить «велика сума» або повідомлення про те, що порога не досягнуто
function classifyAmount(result) {
  if (result > LARGE_AMOUNT_THRESHOLD) {
    console.log(`${result} — велика сума`);
  } else {
    console.log(`${result} — не перевищує поріг`);
  }
}

classifyAmount(4150);
classifyAmount(92);

// Стрілкова функція: повертає суму, помножену на курс
const convert = (amount, rate) => amount * rate;

const resultEur = convert(100, rates.EUR);
console.log(`100 USD = ${resultEur} EUR`);