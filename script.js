// Для практикуму 10 обрано Vue 3: його можна підключити одним CDN-тегом без збірки, а шаблони в HTML-стилі простіші для початку, ніж JSX із Babel.

console.log('script.js підключено');

const API_URL = 'https://api.frankfurter.dev/v1/latest?from=USD&to=EUR';

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

// Практикум 10: ручний DOM-код форми й історії конвертацій (практикуми 7-8) замінено
// Vue-компонентом ConverterForm (див. нижче), тому цей блок закоментовано.
/*
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
*/

const ratesInfo = document.querySelector('#rates-info');
const ratesStatus = document.querySelector('#rates-status');
const ratesError = document.querySelector('#rates-error');
const refreshButton = document.querySelector('#refresh-button');

// Отримує курс валюти з Frankfurter API (https://api.frankfurter.dev) і виводить його на сторінку, помилки показує користувачу
async function loadData() {
  ratesStatus.textContent = 'Завантаження…';
  ratesError.textContent = '';

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      const error = new Error(`Сервер відповів кодом ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    console.log(data);

    renderRates(data.rates);
    ratesInfo.textContent = `Базова валюта: ${data.base}, дата: ${data.date}`;
  } catch (error) {
    if (error.status === 422 || error.status === 404) {
      ratesError.textContent = 'Перевірте код валюти';
    } else {
      ratesError.textContent = 'Не вдалося отримати курси. Спробуйте пізніше.';
    }
    console.error(error);
  } finally {
    ratesStatus.textContent = '';
  }
}

loadData();

refreshButton.addEventListener('click', loadData);

// Компонент форми конвертації: власний стан amount, fromUnit, toUnit; result обчислюється автоматично
const ConverterForm = {
  props: ['rates'],
  data() {
    return {
      amount: '',
      fromUnit: 'USD',
      toUnit: 'EUR'
    };
  },
  computed: {
    codes() {
      return Object.keys(this.rates);
    },
    result() {
      if (this.amount === '' || this.amount <= 0) {
        return null;
      }
      const value = this.amount * (this.rates[this.toUnit] / this.rates[this.fromUnit]);
      return Math.round(value * 100) / 100;
    }
  },
  template: `
    <form @submit.prevent>
      <label for="vue-amount">Значення</label>
      <input type="number" id="vue-amount" v-model.number="amount" min="0.01" step="any">

      <div class="unit-row">
        <div class="unit-field">
          <label for="vue-from">З одиниці</label>
          <select id="vue-from" v-model="fromUnit">
            <option v-for="code in codes" :key="code" :value="code">{{ code }}</option>
          </select>
        </div>

        <div class="unit-field">
          <label for="vue-to">В одиницю</label>
          <select id="vue-to" v-model="toUnit">
            <option v-for="code in codes" :key="code" :value="code">{{ code }}</option>
          </select>
        </div>
      </div>

      <p>
        Результат:
        <span v-if="result !== null">{{ amount }} {{ fromUnit }} = {{ result }} {{ toUnit }}</span>
        <span v-else>—</span>
      </p>
    </form>
  `
};

// Кореневий застосунок Vue: зберігає курси в реактивному стані й передає їх у ConverterForm через props
Vue.createApp({
  components: { ConverterForm },
  data() {
    return {
      rates: { USD: 1, EUR: 0.92, UAH: 41.5 }
    };
  }
}).mount('#app');