// ============================================================
// nicheConfigs.js — методологическая база инструмента
// ============================================================
// Этот файл заполняется данными из JSON-экспорта формы Жени.
// Когда Женя пришлёт JSON — вставляешь сюда его данные.
//
// Структура одной ниши:
// {
//   id, name, icon, desc,
//   params: [{ name, unit, example }],   — входные параметры
//   formulaShort,                         — краткая формула
//   formulaLong,                          — расшифровка
//   kfus: [{ name, why, weight }],        — КФУ в порядке влияния
//   benchmarks: [{ metric, weak, normal, strong }],
//   levers: [{ action, months, flag }],
//   wrdp: { mechanism, falseDriver, scalingMistake,
//           firstOrderLevers, secondOrderLevers },
//   gptHint, mistake1, mistake2
// }
// ============================================================

export const nicheConfigs = {
  marketplace: {
    id: 'marketplace',
    name: 'Маркетплейс',
    icon: '🛒',
    desc: 'Wildberries, Ozon, Яндекс Маркет',
    params: [
      { key: 'revenue',       name: 'Среднемесячная выручка',                              unit: '₽',   example: '1 800 000' },
      { key: 'orderMargin',   name: 'Маржа с заказа (после комиссии МП + логистики + рекламы)', unit: '%', example: '18' },
      { key: 'avgCheck',      name: 'Средний чек',                                          unit: '₽',   example: '2 400' },
      { key: 'conversion',    name: 'Конверсия карточки в заказ',                           unit: '%',   example: '3.2' },
      { key: 'turnover',      name: 'Оборачиваемость товара',                               unit: 'дн',  example: '45' },
      { key: 'drr',           name: 'ДРР / TACoS (реклама к выручке)',                      unit: '%',   example: '12' },
      { key: 'redemption',    name: 'Выкуп (% оплаченных заказов)',                         unit: '%',   example: '82' },
      { key: 'costRatio',     name: 'Себестоимость / цена продажи',                         unit: '%',   example: '38' },
      { key: 'skuCount',      name: 'Количество активных SKU',                              unit: 'шт',  example: '120' },
      { key: 'payroll',       name: 'ФОТ команды / мес',                                    unit: '₽',   example: '180 000' },
    ],
    formulaShort: 'Прибыль = (Спрос × Покрытие × Позиция × Конверсия × Чек) × Маржа − Постоянные косты',
    formulaLong: `Спрос — реальный поисковый спрос на товар в категории
Покрытие — есть ли товар под этот спрос в наличии
Позиция — насколько хорошо видна карточка в поиске
Конверсия — % посетителей, оформивших заказ
Маржа с заказа = (Цена − Себестоимость − Комиссия МП − Логистика − Реклама) / Цена
Постоянные косты = ФОТ + аренда + прочая операционка`,
    kfus: [
      { name: 'Маржа с заказа (contribution)',  why: 'Если отрицательная — масштабирование только увеличивает убыток. Всё остальное вторично.', weight: 'high' },
      { name: 'Оборачиваемость капитала',        why: 'Деньги заморожены в товаре. Чем быстрее оборот — тем выше доходность вложений.',          weight: 'high' },
      { name: 'Покрытие прибыльного спроса',    why: 'Нет товара под спрос = теряешь позиции и деньги. Важно: прибыльного спроса.',              weight: 'medium' },
      { name: 'Рекламная эффективность (ДРР)',  why: 'Высокий ДРР съедает маржу. Рост без оптимизации рекламы = рост затрат.',                  weight: 'medium' },
    ],
    benchmarks: [
      { metric: 'Маржа с заказа',       weak: '< 10%',    normal: '10–20%',  strong: '> 25%'  },
      { metric: 'Оборачиваемость',      weak: '> 90 дн',  normal: '45–90 дн', strong: '< 45 дн' },
      { metric: 'ДРР / TACoS',          weak: '> 20%',    normal: '10–20%',  strong: '< 10%'  },
      { metric: 'Рентабельность',       weak: '< 8%',     normal: '8–15%',   strong: '> 20%'  },
    ],
    levers: [
      { action: 'Найти товарную нишу с маржой с заказа 25%+',   months: '3', flag: 'real' },
      { action: 'Снизить ДРР через семантику и ставки',          months: '2', flag: 'real' },
      { action: 'Перейти на FBS для снижения стоимости хранения', months: '2', flag: 'real' },
      { action: 'Вывести убыточные SKU из ассортимента',         months: '1', flag: 'real' },
      { action: 'Удвоить число прибыльных SKU',                  months: '6', flag: 'hard' },
    ],
    wrdp: {
      mechanism: 'маржа с заказа × скорость оборота товара × покрытие прибыльного спроса',
      falseDriver: '«больше SKU = больше прибыль» — при низкой марже больше SKU = больше убыток',
      scalingMistake: 'Масштабируют выручку при отрицательной марже с заказа, надеясь «потом оптимизировать»',
      firstOrderLevers: '1. Маржа с каждого заказа — если отрицательная, всё остальное вторично\n2. Оборачиваемость — скорость возврата вложенного в товар капитала\n3. Покрытие прибыльного спроса — есть ли нужный товар в нужный момент',
      secondOrderLevers: '1. Позиция карточки в поиске — видимость без рекламных затрат\n2. ДРР/TACoS — сколько выручки стоит реклама\n3. Конверсия карточки — качество контента, отзывы, фото',
    },
    gptHint: 'На маркетплейсах главная ловушка — гнаться за выручкой при отрицательной марже с заказа. Ключевой рычаг — выбор прибыльной товарной ниши, а не масштабирование убыточного ассортимента.',
    mistake1: 'Масштабировать при отрицательной марже с заказа',
    mistake2: 'Не считать реальную стоимость хранения и возвратов',
  },

  // TODO: заполнить из JSON-экспорта формы Жени
  infobiz: {
    id: 'infobiz', name: 'Инфобиз', icon: '🎓', desc: 'Онлайн-курсы, наставничество, подписки',
    params: [], formulaShort: '', formulaLong: '', kfus: [], benchmarks: [], levers: [], wrdp: {}, gptHint: '', mistake1: '', mistake2: '',
  },
  broker: {
    id: 'broker', name: 'Брокерка', icon: '🏠', desc: 'Агентства недвижимости, страхование, ипотека',
    params: [], formulaShort: '', formulaLong: '', kfus: [], benchmarks: [], levers: [], wrdp: {}, gptHint: '', mistake1: '', mistake2: '',
  },
  production: {
    id: 'production', name: 'Производство', icon: '⚙️', desc: 'Производство, товарный бизнес',
    params: [], formulaShort: '', formulaLong: '', kfus: [], benchmarks: [], levers: [], wrdp: {}, gptHint: '', mistake1: '', mistake2: '',
  },
  b2b: {
    id: 'b2b', name: 'Услуги B2B', icon: '💼', desc: 'Агентства, консалтинг, сервис',
    params: [], formulaShort: '', formulaLong: '', kfus: [], benchmarks: [], levers: [], wrdp: {}, gptHint: '', mistake1: '', mistake2: '',
  },
}

export const nicheList = Object.values(nicheConfigs)
