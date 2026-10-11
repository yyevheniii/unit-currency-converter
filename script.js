console.log('script.js підключено');

const rates = { USD: 1, EUR: 0.92, UAH: 41.5 };

const listContainer = document.querySelector('#rates-list');

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

const BIG_RATE_THRESHOLD = 10;

// Виводить курси валют на сторінку: для кожної валюти створює li, додає атрибут data-rate і клас big-rate та оновлює лічильник
function renderRates(ratesObj) {
  listContainer.innerHTML = '';

  for (const [code, rate] of Object.entries(ratesObj)) {
    const item = document.createElement('li');
    item.textContent = `${code}: ${rate}`;

    item.dataset.rate = rate;
    if (rate > BIG_RATE_THRESHOLD) {
      item.classList.add('big-rate');
    }

    listContainer.append(item);
  }

  const ratesCount = document.querySelector('#rates-count');
  ratesCount.textContent = `Кількість валют: ${listContainer.children.length}`;
}

renderRates(rates);

const form = document.querySelector('#converter-form');
const amountInput = document.querySelector('#amount-input');
const fromSelect = document.querySelector('#from-unit');
const toSelect = document.querySelector('#to-unit');
const resultOutput = document.querySelector('#result');
const historyList = document.querySelector('#history-list');

const conversionHistory = [];

// Виводить історію конвертацій на сторінку списком
function renderHistory(historyArr) {
  historyList.innerHTML = '';

  for (const entry of historyArr) {
    const item = document.createElement('li');
    item.textContent = `${entry.amount} ${entry.from} = ${entry.result} ${entry.to}`;
    historyList.append(item);
  }
}

// Обробник submit: додає конвертацію в історію без перезавантаження сторінки
form.addEventListener('submit', event => {
  event.preventDefault();

  const amount = Number(amountInput.value);
  const from = fromSelect.value.toUpperCase();
  const to = toSelect.value.toUpperCase();

  const entry = {
    amount,
    from,
    to,
    result: Math.round(convert(amount, rates[to] / rates[from]) * 100) / 100
  };
  conversionHistory.push(entry);

  renderHistory(conversionHistory);

  form.reset();
});

// Обробник input: власна перевірка, що сума додатна
amountInput.addEventListener('input', () => {
  if (amountInput.value !== '' && Number(amountInput.value) <= 0) {
    amountInput.setCustomValidity('Сума має бути додатною');
  } else {
    amountInput.setCustomValidity('');
  }
});

// Перераховує результат і оновлює #result без сабміту форми
function updateResult() {
  const amount = Number(amountInput.value);

  if (amountInput.value === '' || amount <= 0) {
    resultOutput.textContent = 'Результат: —';
    return;
  }

  
  const from = fromSelect.value.toUpperCase();
  const to = toSelect.value.toUpperCase();
  const result = Math.round(convert(amount, rates[to] / rates[from]) * 100) / 100;
  resultOutput.textContent = `Результат: ${amount} ${from} = ${result} ${to}`;
}

// Обробники change: миттєвий перерахунок при зміні одиниці
fromSelect.addEventListener('change', updateResult);
toSelect.addEventListener('change', updateResult);