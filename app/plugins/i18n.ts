import { createI18n } from "vue-i18n"

const messages = {
  ru: {
    nav: {
      home: "Главная",
      settings: "Настройки",
      localization: "Язык",
      help: "Помощь"
    },
    help: {
      tooltip: "Справка в приложении (F1 — раздел по текущему экрану)",
      contextHint: "Клавиша F1 открывает встроенную справку: тема соответствует открытой странице.",
      pageTitle: "Справка",
      missingPage: "Страница справки не найдена."
    },
    home: {
      title: "Последние новости",
      subtitle: "Актуальные новости из RSS-лент",
      loading: "Загрузка новостей...",
      noNews: "Новости не найдены",
      noNewsText: "Попробуйте обновить страницу позже",
      refresh: "Обновить",
      retry: "Повторить попытку",
      cached: "кэш",
      new: "новых",
      clearCache: "Очистить кэш",
      clearCacheConfirm: "Вы уверены, что хотите очистить все кэшированные новости?",
      lastUpdate: "Последнее обновление",
      search: "Поиск новостей...",
      searchResults: "Найдено"
    },
    settings: {
      title: "Настройки",
      sources: "Источники",
      filters: "Фильтры",
      locale: "Язык",
      clearCache: "Очистить кэш",
      grouping: "Группировка",
      similarityThreshold: "Порог схожести",
      similarityDesc: "Новости с похожими заголовками (схожесть ≥ {value}%) будут объединены",
      autoRefresh: "Автообновление",
      autoRefreshDesc: "Периодически подгружать новости, пока открыта главная",
      refreshInterval: "Интервал (мин.)"
    },
    sources: {
      title: "Источники новостей",
      addRss: "Добавить RSS ленту",
      addRssDesc: "URL RSS ленты",
      activeRss: "Активные источники",
      noSource: "Источники не добавлены"
    },
    filters: {
      title: "Настройка фильтров",
      addFilter: "Добавить новый фильтр",
      addFilterNameDesc: "Название фильтра",
      addFilterWords: "Ключевые слова",
      addFilterWordsDesc: "Введите слова и нажмите Enter",
      addFilterMode: "Режим фильтра",
      addFilterModeDesc: "Если включено - новости с этими словами будут скрыты, иначе фильтр будет использоваться для определения направленности новостей",
      addFilterLimiter: "Порог срабатывания (0-1)",
      addFilterLimiterDesc: "Если сумма совпавших слов >= порога, фильтр сработает",
      addFilterBtn: "Добавить фильтр",
      activeFilter: "Активные фильтры",
      noFilter: "Фильтры не добавлены",
      activeFilterBlock: "Блокирует",
      activeFilterClassify: "Классифицирует",
      activeFilterLimiter: "Порог: "
    },
    common: {
      save: "Сохранить",
      cancel: "Отмена",
      delete: "Удалить",
      add: "Добавить",
      close: "Закрыть"
    }
  },
  en: {
    nav: {
      home: "Home",
      settings: "Settings",
      localization: "Language",
      help: "Help"
    },
    help: {
      tooltip: "In-app help (F1 — topic for this screen)",
      contextHint: "F1 opens built-in help for the current screen.",
      pageTitle: "Help",
      missingPage: "Help page not found."
    },
    home: {
      title: "Latest News",
      subtitle: "Current news from RSS feeds",
      loading: "Loading news...",
      noNews: "No news found",
      noNewsText: "Try refreshing the page later",
      refresh: "Refresh",
      retry: "Retry",
      cached: "cached",
      new: "new",
      clearCache: "Clear cache",
      clearCacheConfirm: "Are you sure you want to clear all cached news?",
      lastUpdate: "Last update",
      search: "Search news...",
      searchResults: "Found"
    },
    settings: {
      title: "Settings",
      sources: "Sources",
      filters: "Filters",
      telegram: "Telegram",
      locale: "Language",
      clearCache: "Clear cache",
      grouping: "Grouping",
      similarityThreshold: "Similarity Threshold",
      similarityDesc: "News with similar headlines (similarity ≥ {value}%) will be merged",
      autoRefresh: "Auto-refresh",
      autoRefreshDesc: "Periodically fetch news while the home page is open",
      refreshInterval: "Interval (min)"
    },
    sources: {
      title: "News Sources",
      addRss: "Add RSS Feed",
      addRssDesc: "RSS Feed URL",
      activeRss: "Active Sources",
      noSource: "No sources added"
    },
    filters: {
      title: "Filter Settings",
      addFilter: "Add New Filter",
      addFilterNameDesc: "Filter Name",
      addFilterWords: "Keywords",
      addFilterWordsDesc: "Enter words and press Enter",
      addFilterMode: "Filter Mode",
      addFilterModeDesc: "If enabled, news containing these words will be hidden. Otherwise, the filter will be used to categorize the news.",
      addFilterLimiter: "Activation Threshold (0-1)",
      addFilterLimiterDesc: "If the number of matched words >= threshold, the filter will trigger.",
      addFilterBtn: "Add Filter",
      activeFilter: "Active Filters",
      noFilter: "No filters added",
      activeFilterBlock: "Blocks",
      activeFilterClassify: "Classifies",
      activeFilterLimiter: "Threshold: "
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      add: "Add",
      close: "Close"
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: "ru",
  fallbackLocale: "ru",
  messages,
  globalInjection: true
})

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(i18n)
  return { provide: { i18n } }
})
