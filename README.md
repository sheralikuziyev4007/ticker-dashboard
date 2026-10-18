# Ticker — крипто-дашборд (React + CoinGecko API)

[![CI](https://github.com/sheralikuziyev4007/ticker-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/sheralikuziyev4007/ticker-dashboard/actions/workflows/ci.yml)

**Демо:** [<https://sheralikuziyev4007.github.io/ticker-dashboard/>](https://ticker-dashboard-zeta.vercel.app/)

Дашборд для отслеживания курсов криптовалют на реальном публичном API
[CoinGecko](https://www.coingecko.com/en/api) — без моковых данных, без бэкенда.

## Запуск

Требуется Node.js 22+ (версия указана в `.nvmrc`).

```bash
git clone https://github.com/sheralikuziyev4007/ticker-dashboard.git
cd ticker-dashboard
npm install
npm run dev
```

Откроется на `http://localhost:5173`.

Для продакшн-сборки:

```bash
npm run build
npm run preview
```

Проверить, что всё работает (smoke-тесты на моках API — рендер списка,
открытие графика, поиск, избранное, error/retry):

```bash
npm run test
```

## Стек

- **React 18** (функциональные компоненты + hooks)
- **Vite** — сборка и дев-сервер
- **Tailwind CSS** — стилизация
- **Recharts** — график цены
- **CoinGecko API** — данные (без ключа для базовых эндпоинтов)

## Структура проекта

```
src/
├── components/
│   ├── TickerTape.jsx        // бегущая строка с избранными монетами (шапка)
│   ├── CurrencyCard.jsx      // карточка одной валюты
│   ├── CurrencyList.jsx      // сетка карточек + loading/error/empty состояния
│   ├── CoinDetailModal.jsx   // модалка с графиком при клике на карточку
│   ├── PriceChart.jsx        // график (Recharts), area chart
│   ├── DateRangeFilter.jsx   // переключатель периода + date range picker
│   ├── SearchBar.jsx         // поиск монет с debounce
│   ├── ExportButton.jsx      // экспорт текущих данных графика в CSV
│   ├── LoadingState.jsx      // skeleton-загрузчик
│   └── ErrorState.jsx        // сообщение об ошибке + кнопка "Повторить"
│   (рядом с компонентами лежат их тесты, например DateRangeFilter.test.jsx)
├── hooks/
│   ├── useCurrencies.js      // список валют, автообновление 60с
│   ├── useHistoricalData.js  // история цены для графика (period или date range)
│   ├── useFavorites.js       // избранное в localStorage
│   └── useDebounce.js        // debounce для поиска
├── utils/
│   ├── api.js                // обёртка над fetch + простой кэш
│   └── exportToCsv.js        // генерация и скачивание CSV через Blob
└── App.jsx
public/favicon.svg
.github/workflows/
├── ci.yml                    // npm ci → тесты → сборка на каждый push и PR
└── deploy-pages.yml          // автодеплой на GitHub Pages из ветки main
```

## Возможности

- **Реальный API** — все данные идут из CoinGecko, `fetch` + `async/await`,
  ошибки ловятся через `try/catch` внутри `utils/api.js`.
- **Автообновление** — `useCurrencies` обновляет список каждые 60 секунд
  плюс кнопка "Обновить" в шапке.
- **График с периодами** — 24ч / 7д / 30д / 1г, переключается в `DateRangeFilter`,
  данные тянутся через `/market_chart`.
- **Фильтр по датам** — свой диапазон дат через `<input type="date">`,
  данные тянутся через `/market_chart/range`; выбранный день "до" входит в диапазон
  целиком, проверка "от" не позже "до", кнопка ✕ сбрасывает диапазон.
- **Поиск и избранное** — `SearchBar` ищет по `/search` с debounce 350мс,
  избранное хранится в `localStorage` через `useFavorites`.
- **Экспорт в CSV** — `exportToCsv.js`, чистый клиент, `Blob` + `URL.createObjectURL`.
- **Loading/Error/Empty состояния** — skeleton при загрузке, понятное сообщение
  об ошибке с кнопкой "Повторить", отдельное сообщение для пустого результата.
- **Отмена запросов** — `AbortController` в обоих hooks (`useCurrencies`,
  `useHistoricalData`), плюс в поиске.
- **Кэширование** — простой in-memory кэш на 30 секунд в `utils/api.js`,
  чтобы не дублировать одинаковые запросы.
- **Ленивая загрузка** — модалка с графиком (и Recharts) подгружается только
  при первом открытии, стартовый бандл остаётся лёгким.

## Бонус (не обязательно, но заложено в структуру)

Легко добавить: React Query вместо кастомных hooks (интерфейс `useCurrencies`/
`useHistoricalData` уже разделяет данные и состояние загрузки), сравнение
нескольких монет на одном `PriceChart` (принять массив coin id вместо одного),
светлая тема (все цвета — Tailwind-токены в `tailwind.config.js`).

## Деплой

**GitHub Pages (настроено).** В репозитории: *Settings → Pages → Source:
GitHub Actions*. После этого каждый push в `main` запускает
`.github/workflows/deploy-pages.yml`: тесты → сборка → публикация.
Сайт будет доступен по адресу
<https://sheralikuziyev4007.github.io/ticker-dashboard/>.

**Vercel / Netlify.** Импортируйте репозиторий — подойдут настройки по умолчанию
(build: `npm run build`, output: `dist`). В `vite.config.js` задан
`base: './'`, поэтому сборка работает и в корне домена, и в подпути.

## Лицензия

[MIT](LICENSE)

## Примечание об API

CoinGecko имеет лимит запросов для бесплатного тарифа (rate limit). Если
видите ошибку 429 — подождите минуту, приложение уже обрабатывает этот случай
отдельным сообщением.
