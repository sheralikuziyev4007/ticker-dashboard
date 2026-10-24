# Ticker — крипто-дашборд (React + CoinGecko API)

[![CI](https://github.com/sheralikuziyev4007/ticker-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/sheralikuziyev4007/ticker-dashboard/actions/workflows/ci.yml)

**Демо:** <https://ticker-dashboard-zeta.vercel.app/>

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
│   ├── ErrorState.jsx        // сообщение об ошибке + кнопка "Повторить"
│   ├── CompareModal.jsx      // сравнение до 5 монет на одном PriceChart
│   ├── CurrencySwitcher.jsx  // USD / EUR / RUB / UZS
│   ├── MarketOverview.jsx    // GlobalStatsCards + FearGreedCard (+ StatCard)
│   ├── TabBar.jsx            // разделы: Избранное / Рынок / Портфель / Алерты
│   ├── FavoritesView.jsx     // раздел «Избранное»
│   ├── MarketView.jsx        // раздел «Рынок»: бесконечная прокрутка, сортировка, фильтры
│   ├── MarketControls.jsx    // сортировка (кап./24ч/объём) + фильтр Растут/Падают
│   ├── GainersLosers.jsx     // лидеры роста и падения
│   ├── InfiniteScrollTrigger.jsx // подгрузка страниц (IntersectionObserver + кнопка)
│   ├── CoinPicker.jsx        // поиск и выбор монеты
│   ├── PortfolioTracker.jsx  // раздел «Портфель» (+ PortfolioForm/Summary/Table)
│   ├── PriceAlerts.jsx       // раздел «Алерты» (+ AlertForm/AlertList/NotificationPermission)
│   └── AlertToasts.jsx       // уведомления на странице (запасной вариант)
│   (рядом с компонентами лежат их тесты, например DateRangeFilter.test.jsx)
├── hooks/
│   ├── useCurrencies.js      // список валют, автообновление 60с
│   ├── useHistoricalData.js  // история цены для графика (period или date range)
│   ├── useFavorites.js       // избранное в localStorage
│   ├── useDebounce.js        // debounce для поиска
│   ├── useMultiHistoricalData.js // история нескольких монет (сравнение)
│   ├── useMarketCoins.js     // постраничная загрузка рынка
│   ├── useGlobalStats.js     // капитализация, объём, доминация BTC
│   ├── useFearGreed.js       // индекс страха и жадности
│   ├── useExchangeRates.js   // курсы USD → EUR/RUB/UZS
│   ├── usePortfolio.js       // портфель в localStorage
│   ├── usePriceAlerts.js     // алерты в localStorage
│   └── useAlertWatcher.js    // фоновая проверка алертов раз в минуту
├── context/
│   └── CurrencyContext.jsx   // выбранная валюта, курс, форматтеры
├── utils/
│   ├── api.js                // обёртка над fetch + простой кэш
│   ├── exportToCsv.js        // генерация и скачивание CSV через Blob
│   ├── currency.js           // список валют, форматирование сумм
│   ├── mergeSeries.js        // склейка рядов для сравнения монет
│   ├── marketSort.js         // сортировка и фильтры
│   ├── portfolio.js          // расчёт стоимости и прибыли/убытка
│   ├── alerts.js             // условия срабатывания алертов
│   └── notify.js             // обёртка над Notification API
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

- **Сравнение монет** — кнопка «⇄ Сравнить» в шапке: до 5 монет на одном
  `PriceChart`, режимы «% изменения» (удобно для монет с разным масштабом цен) и «Цена».
- **Портфель** — монета, количество и цена покупки; общая стоимость, вложения
  и прибыль/убыток считаются по текущим ценам. Данные только в `localStorage`.
- **Ценовые алерты** — условие «цена выше/ниже», проверка раз в минуту в фоне,
  системное уведомление (Notification API) + toast на странице как запасной вариант.
- **Валюты** — USD / EUR / RUB / UZS. Данные CoinGecko запрашиваются в USD и
  конвертируются на клиенте по курсу [open.er-api.com](https://open.er-api.com);
  если курс не загрузился, используются приблизительные значения (помечено в UI).
- **Рынок** — топ монет с бесконечной прокруткой (по 50, до 250), сортировка
  по капитализации / изменению за 24ч / объёму, фильтр «Растут / Падают»,
  блок лидеров роста и падения. Сортировка работает по уже загруженным монетам.
- **Обзор рынка** — общая капитализация, объём, доминация BTC и индекс
  страха и жадности ([alternative.me](https://alternative.me/crypto/fear-and-greed-index/)).

## Бонус (не обязательно, но заложено в структуру)

Легко добавить: React Query вместо кастомных hooks (интерфейс `useCurrencies`/
`useHistoricalData` уже разделяет данные и состояние загрузки), светлая тема
(все цвета — Tailwind-токены в `tailwind.config.js`).

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
