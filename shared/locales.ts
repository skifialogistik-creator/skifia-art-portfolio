import { z } from "zod";
import { defaultSiteContent, siteContentSchema, type SiteContent } from "./siteContent";

export const localeOrder = ["ru", "uk", "pl"] as const;
export type Locale = (typeof localeOrder)[number];

export const localeLabels: Record<Locale, string> = {
  ru: "RU",
  uk: "UA",
  pl: "PL",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && (localeOrder as readonly string[]).includes(value));
}

export function localeFromNavigator(language?: string | null): Locale {
  const normalized = (language ?? "").toLowerCase();
  if (normalized.startsWith("uk")) return "uk";
  if (normalized.startsWith("pl")) return "pl";
  return "ru";
}

export type SiteContentBundle = {
  defaultLocale: Locale;
  locales: Record<Locale, SiteContent>;
};

export const siteContentBundleSchema = z.object({
  defaultLocale: z.enum(localeOrder),
  locales: z.object({
    ru: siteContentSchema,
    uk: siteContentSchema,
    pl: siteContentSchema,
  }),
});

export type UiCopy = {
  menuOpen: string;
  menuClose: string;
  storefrontKicker: string;
  storefrontDescription: string;
  storefrontHint: string;
  storefrontOpen: string;
  storefrontSold: string;
  storefrontAvailable: string;
  storefrontRequest: string;
  storefrontRequestPlaceholder: string;
  storefrontTitle: string;
  storefrontTitleAccent: string;
  siteLabel: string;
  hostPlaceholder: string;
  decorativeReady: string;
  decorativeFuture: string;
  decorativeDirection: string;
  resultLabel: string;
  emailLabel: string;
  whatsappLabel: string;
  telegramLabel: string;
  inquiry: {
    eyebrow: string;
    title: string;
    description: string;
    selected: string;
    fullName: string;
    fullNamePlaceholder: string;
    contact: string;
    contactPlaceholder: string;
    comment: string;
    commentPlaceholder: string;
    consent: string;
    submit: string;
    sending: string;
    accepted: string;
    acceptedText: string;
    close: string;
    validation: string;
    error: string;
  };
  projectsKicker: string;
  contacts: string;
  privacy: string;
  privacyTitle: string;
  privacyDescription: string;
  privacyAdmin: string;
  availabilitySold: string;
  availabilityForSale: string;
  heroPhrases: string[];
  form: {
    stepLabel: string;
    steps: Array<[string, string, string]>;
    startIntro: string;
    fields: Record<string, string>;
    placeholders: Record<string, string>;
    validation: string[];
    selectBudget: string;
    selectAll: string;
    sourceTelegram: string;
    contactTelegram: string;
    contactWhatsapp: string;
    contactPhone: string;
    contactEmail: string;
    yes: string;
    no: string;
    help: string;
    submit: string;
    next: string;
    previous: string;
    sending: string;
    required: string;
    accepted: string;
    acceptedTitle: string;
    acceptedText: string;
    requestNumber: string;
    downloadAgain: string;
    savedNotice: string;
    pdfFontError: string;
    saveError: string;
    privacyFallback: string;
    options: Record<string, string>;
  };
};

const ru: UiCopy = {
  menuOpen: "Открыть меню",
  menuClose: "Закрыть меню",
  storefrontKicker: "готовые решения / в наличии",
  storefrontDescription: "Выберите понравившуюся основу, откройте сайт и оставьте заявку. Карточка переворачивается, чтобы показать детали и перейти к просмотру.",
  storefrontHint: "наведите или коснитесь",
  storefrontOpen: "Открыть",
  storefrontSold: "Продан",
  storefrontAvailable: "В продаже",
  storefrontRequest: "Оставить заявку",
  storefrontRequestPlaceholder: "Ссылка появится",
  storefrontTitle: "Сайты",
  storefrontTitleAccent: "в наличии.",
  siteLabel: "сайт",
  hostPlaceholder: "ваш-сайт.ru",
  decorativeReady: "готово\nк запуску",
  decorativeFuture: "будущее\nна\nэкране",
  decorativeDirection: "визуальное\nнаправление",
  resultLabel: "результат",
  emailLabel: "E-mail",
  whatsappLabel: "WhatsApp",
  telegramLabel: "Telegram",
  inquiry: { eyebrow: "готовый сайт", title: "Заявка на", description: "Оставьте контакты — я свяжусь с вами по поводу этого сайта и расскажу о следующем шаге.", selected: "Вы выбрали", fullName: "Ваше имя", fullNamePlaceholder: "Как к вам обращаться", contact: "Telegram, телефон или e-mail", contactPlaceholder: "@username, +48… или name@email.com", comment: "Комментарий", commentPlaceholder: "Например: хочу узнать сроки передачи и можно ли изменить тексты", consent: "Согласен(на) на сохранение контакта, чтобы получить ответ по этой заявке.", submit: "Оставить заявку", sending: "Отправляем", accepted: "Заявка принята", acceptedText: "Спасибо! Заявка на сайт сохранена. Я отвечу по указанному контакту.", close: "Закрыть", validation: "Укажите имя, контакт и подтвердите согласие на обработку заявки.", error: "Не удалось отправить заявку. Попробуйте ещё раз." },
  projectsKicker: "Ваша коллекция опубликованных работ",
  contacts: "Контакты",
  privacy: "Политика конфиденциальности",
  privacyTitle: "Политика конфиденциальности",
  privacyDescription: "Контактные данные и порядок обработки обращений.",
  privacyAdmin: "Администратор данных",
  availabilitySold: "Уже продан",
  availabilityForSale: "В продаже",
  heroPhrases: ["я создаю сайты", "я создаю бренды", "я создаю решения", "я создаю будущее"],
  form: {
    stepLabel: "Шаг",
    steps: [["01", "О проекте", "Контакты и основа бизнеса"], ["02", "Цели", "Кому и зачем нужен сайт"], ["03", "Структура", "Страницы и полезные функции"], ["04", "Визуальный язык", "Стиль, цвета и ориентиры"], ["05", "Организация", "Срок, бюджет и запуск"]],
    startIntro: "Начнём с фактов. На основе этих ответов можно сформировать структуру, оффер и правильную логику первого экрана.",
    fields: { fullName: "Ваше имя", companyName: "Компания / проект", projectType: "Тип проекта", projectStage: "Стадия проекта", email: "E-mail", phone: "Телефон / мессенджер", businessDescription: "О бизнесе в двух–трёх предложениях", offers: "Что вы предлагаете клиенту", geography: "География работы", contactPreference: "Как удобнее связаться", leadSource: "Источник обращения", audience: "Кто ваш идеальный клиент", audienceTypes: "Кто входит в вашу аудиторию", primaryScenarios: "Главный сценарий посетителя", goals: "Какие задачи должен решать сайт", mainGoal: "Какой результат вы хотите увидеть через 3–6 месяцев", whyChoose: "Почему клиенты выбирают именно вас", currentSiteState: "Текущее состояние сайта", requiredPages: "Какие страницы важны", features: "Какие функции пригодятся", availableMaterials: "Что уже есть из материалов", contentReadiness: "Насколько готов контент", styleWords: "Каким должен ощущаться сайт", colorDirection: "Цветовое направление", colorNotes: "Пожелания по цветам", references: "Сайты, бренды или изображения-ориентиры", deadline: "Желаемый срок запуска", budgetRange: "Ориентир по бюджету", comment: "Дополнительный комментарий" },
    placeholders: { fullName: "Как к вам обращаться", companyName: "Например, Studio Forma", phone: "+48 ... или @telegram", businessDescription: "Чем занимаетесь, как давно работаете, в чём специфика вашей работы?", offers: "Ключевые услуги, товары, форматы работы, диапазон цен", geography: "Город, страна, онлайн", audience: "Кто эти люди, с какой задачей приходят, что для них важно при выборе?", mainGoal: "Например: стабильные заявки из поиска, понятный образ бренда, меньше однотипных вопросов", whyChoose: "Опыт, подход, скорость, технология, гарантия, команда или ваша история", deadline: "Например, до 15 октября", colorNotes: "Любимые / нежелательные цвета, фирменные коды, ассоциации или настроение", references: "Вставьте ссылки и поясните, что в них нравится: сетка, фото, шрифт, подача, ритм" },
    validation: ["Заполните имя, компанию, тип и стадию проекта, e-mail, телефон, описание бизнеса, услуги и географию.", "Опишите аудиторию, выберите тип аудитории, главный сценарий, хотя бы одну задачу и результат сайта.", "Выберите хотя бы одну страницу и оцените готовность контента.", "Выберите характер и цветовое направление будущего сайта.", "Укажите ориентир по сроку и бюджету, затем подтвердите согласие на обработку заявки."],
    selectBudget: "Выберите диапазон", selectAll: "Выберите все подходящие варианты.", sourceTelegram: "Telegram", contactTelegram: "Telegram", contactWhatsapp: "WhatsApp", contactPhone: "Телефон", contactEmail: "E-mail", yes: "Всё готово", no: "Нужна помощь", help: "Нужна помощь", submit: "Отправить заявку", next: "Дальше", previous: "Назад", sending: "Отправляем…", required: "Обязательное поле", accepted: "Заявка принята", acceptedTitle: "У вас есть точка опоры для будущего сайта.", acceptedText: "Заявка сохранена, а PDF-резюме уже скачивается. Сохраните номер заявки — по нему удобно ссылаться на заполненный бриф.", requestNumber: "Номер заявки", downloadAgain: "Скачать PDF ещё раз", savedNotice: "Заявка сохранена в базе, а уведомление о новом брифе отправлено владельцу проекта.", pdfFontError: "Не удалось подготовить шрифт для PDF.", saveError: "Не удалось сохранить заявку. Пожалуйста, повторите попытку.", privacyFallback: "Данные из формы используем только для связи с вами и подготовки предложения.", options: { landing: "Лендинг", company: "Сайт компании", shop: "Интернет-магазин", catalog: "Каталог", service: "Сервис / личный кабинет", portfolio: "Портфолио", blog: "Блог / медиа", other: "Другое", idea: "Только идея", working: "Бизнес уже работает", outdated: "Сайт устарел", leads: "Сайт есть — нужны заявки", restart: "Нужен перезапуск проекта", private: "Частные клиенты", companies: "Компании", premium: "Премиум-сегмент", local: "Локальные клиенты", international: "Международная аудитория", partners: "Специалисты / партнёры", apply: "Оставить заявку", book: "Записаться", buy: "Купить", calculate: "Рассчитать стоимость", cases: "Посмотреть кейсы", message: "Написать в мессенджер", calm: "Спокойный", premiumStyle: "Премиальный", bold: "Смелый", minimal: "Минималистичный", tech: "Технологичный", warm: "Тёплый и человечный", editorial: "Editorial", expressive: "Экспрессивный", newSite: "Нужен новый сайт", redesign: "Есть сайт, нужен редизайн", contentReady: "Всё готово", contentHelp: "Нужно помочь со структурой и текстом", trustColor: "Доверьтесь вашему предложению", lightColor: "Светлая, воздушная палитра", darkColor: "Тёмная, статусная палитра", contrastColor: "Контрастная и энергичная палитра", brandColors: "Есть фирменные цвета — использовать их" }
  }
};

const uk: UiCopy = {
  ...ru,
  menuOpen: "Відкрити меню", menuClose: "Закрити меню", storefrontTitle: "Сайти", storefrontTitleAccent: "у наявності.", siteLabel: "сайт", hostPlaceholder: "ваш-сайт.ua", decorativeReady: "готово\nдо запуску", decorativeFuture: "майбутнє\nна\nекрані", decorativeDirection: "візуальний\nнапрям", resultLabel: "результат", emailLabel: "E-mail", whatsappLabel: "WhatsApp", telegramLabel: "Telegram", inquiry: { ...ru.inquiry, eyebrow: "готовий сайт", title: "Заявка на", description: "Залиште контакти — я зв’яжуся з вами щодо цього сайту та розповім про наступний крок.", selected: "Ви обрали", fullName: "Ваше ім’я", fullNamePlaceholder: "Як до вас звертатися", contact: "Telegram, телефон або e-mail", contactPlaceholder: "@username, +48… або name@email.com", comment: "Коментар", commentPlaceholder: "Наприклад: хочу дізнатися терміни передачі та чи можна змінити тексти", consent: "Погоджуюся на збереження контакту, щоб отримати відповідь щодо цієї заявки.", submit: "Залишити заявку", sending: "Надсилаємо", accepted: "Заявку прийнято", acceptedText: "Дякуємо! Заявку на сайт збережено. Я відповім за вказаним контактом.", close: "Закрити", validation: "Вкажіть ім’я, контакт і підтвердьте згоду на обробку заявки.", error: "Не вдалося надіслати заявку. Спробуйте ще раз." }, storefrontKicker: "готові рішення / у наявності", storefrontDescription: "Оберіть основу, відкрийте сайт і залиште заявку. Картка перевертається, щоб показати деталі та перейти до перегляду.", storefrontHint: "наведіть або торкніться", storefrontOpen: "Відкрити", storefrontSold: "Продано", storefrontAvailable: "У продажу", storefrontRequest: "Залишити заявку", storefrontRequestPlaceholder: "Посилання з’явиться", projectsKicker: "Ваша колекція опублікованих робіт", contacts: "Контакти", privacy: "Політика конфіденційності", privacyTitle: "Політика конфіденційності", privacyDescription: "Контактні дані та порядок обробки звернень.", privacyAdmin: "Адміністратор даних", availabilitySold: "Вже продано", availabilityForSale: "У продажу", heroPhrases: ["я створюю сайти", "я створюю бренди", "я створюю рішення", "я створюю майбутнє"],
  form: { ...ru.form, stepLabel: "Крок", steps: [["01", "Про проєкт", "Контакти та основа бізнесу"], ["02", "Цілі", "Кому і навіщо потрібен сайт"], ["03", "Структура", "Сторінки та корисні функції"], ["04", "Візуальна мова", "Стиль, кольори та орієнтири"], ["05", "Організація", "Термін, бюджет і запуск"]], startIntro: "Почнемо з фактів. На основі цих відповідей можна сформувати структуру, пропозицію та логіку першого екрана.", fields: { ...ru.form.fields, fullName: "Ваше ім’я", companyName: "Компанія / проєкт", projectType: "Тип проєкту", projectStage: "Стадія проєкту", phone: "Телефон / месенджер", businessDescription: "Про бізнес у двох–трьох реченнях", offers: "Що ви пропонуєте клієнту", geography: "Географія роботи", contactPreference: "Як зручніше зв’язатися", audience: "Хто ваш ідеальний клієнт", audienceTypes: "Хто входить до вашої аудиторії", primaryScenarios: "Головний сценарій відвідувача", goals: "Які завдання має вирішувати сайт", mainGoal: "Який результат ви хочете побачити через 3–6 місяців", whyChoose: "Чому клієнти обирають саме вас", currentSiteState: "Поточний стан сайту", requiredPages: "Які сторінки важливі", features: "Які функції знадобляться", availableMaterials: "Що вже є з матеріалів", contentReadiness: "Наскільки готовий контент", styleWords: "Яким має відчуватися сайт", colorDirection: "Кольоровий напрям", colorNotes: "Побажання щодо кольорів", references: "Сайти, бренди або зображення-орієнтири", deadline: "Бажаний термін запуску", budgetRange: "Орієнтир за бюджетом", comment: "Додатковий коментар" }, placeholders: { ...ru.form.placeholders, fullName: "Як до вас звертатися", companyName: "Наприклад, Studio Forma", businessDescription: "Чим займаєтеся, як давно працюєте, у чому особливість вашої роботи?", offers: "Основні послуги, товари, формати роботи, діапазон цін", geography: "Місто, країна, онлайн", audience: "Хто ці люди, з яким завданням приходять, що для них важливо під час вибору?", mainGoal: "Наприклад: стабільні заявки з пошуку, зрозумілий образ бренду, менше типових запитань", whyChoose: "Досвід, підхід, швидкість, технологія, гарантія, команда або ваша історія", deadline: "Наприклад, до 15 жовтня", colorNotes: "Улюблені / небажані кольори, коди бренду, асоціації або настрій", references: "Вставте посилання та поясніть, що подобається: сітка, фото, шрифт, подача, ритм" }, validation: ["Заповніть ім’я, компанію, тип і стадію проєкту, e-mail, телефон, опис бізнесу, послуги та географію.", "Опишіть аудиторію, оберіть її тип, головний сценарій, хоча б одне завдання та результат сайту.", "Оберіть хоча б одну сторінку та оцініть готовність контенту.", "Оберіть характер і кольоровий напрям майбутнього сайту.", "Вкажіть орієнтир за терміном і бюджетом, потім підтвердьте згоду на обробку заявки."], selectBudget: "Оберіть діапазон", selectAll: "Оберіть усі відповідні варіанти.", sourceTelegram: "Telegram", contactTelegram: "Telegram", contactWhatsapp: "WhatsApp", contactPhone: "Телефон", contactEmail: "E-mail", yes: "Усе готово", no: "Потрібна допомога", help: "Потрібна допомога", submit: "Надіслати заявку", next: "Далі", previous: "Назад", sending: "Надсилаємо…", required: "Обов’язкове поле", accepted: "Заявку прийнято", acceptedTitle: "У вас є опора для майбутнього сайту.", acceptedText: "Заявку збережено, а PDF-резюме вже завантажується. Збережіть номер заявки — за ним зручно посилатися на заповнений бриф.", requestNumber: "Номер заявки", downloadAgain: "Завантажити PDF ще раз", savedNotice: "Заявку збережено в базі, а повідомлення про новий бриф надіслано власнику проєкту.", pdfFontError: "Не вдалося підготувати шрифт для PDF.", saveError: "Не вдалося зберегти заявку. Будь ласка, повторіть спробу.", privacyFallback: "Дані з форми використовуємо лише для зв’язку з вами та підготовки пропозиції.", options: { ...ru.form.options, landing: "Лендінг", company: "Сайт компанії", shop: "Інтернет-магазин", service: "Сервіс / особистий кабінет", portfolio: "Портфоліо", blog: "Блог / медіа", other: "Інше", idea: "Лише ідея", working: "Бізнес уже працює", outdated: "Сайт застарів", leads: "Сайт є — потрібні заявки", restart: "Потрібен перезапуск проєкту", private: "Приватні клієнти", companies: "Компанії", local: "Локальні клієнти", international: "Міжнародна аудиторія", partners: "Фахівці / партнери", apply: "Залишити заявку", book: "Записатися", buy: "Купити", calculate: "Розрахувати вартість", cases: "Переглянути кейси", message: "Написати в месенджер", calm: "Спокійний", premiumStyle: "Преміальний", bold: "Сміливий", minimal: "Мінімалістичний", tech: "Технологічний", warm: "Теплий і людяний", expressive: "Експресивний", newSite: "Потрібен новий сайт", redesign: "Є сайт, потрібен редизайн", contentReady: "Усе готово", contentHelp: "Потрібна допомога зі структурою та текстом", trustColor: "Довіртеся вашій пропозиції", lightColor: "Світла, легка палітра", darkColor: "Темна, статусна палітра", contrastColor: "Контрастна й енергійна палітра", brandColors: "Є фірмові кольори — використати їх" } } }

const pl: UiCopy = {
  ...ru,
  menuOpen: "Otwórz menu", menuClose: "Zamknij menu", storefrontTitle: "Strony", storefrontTitleAccent: "dostępne.", siteLabel: "strona", hostPlaceholder: "twoja-strona.pl", decorativeReady: "gotowe\ndo startu", decorativeFuture: "przyszłość\nna\nekranie", decorativeDirection: "kierunek\nwizualny", resultLabel: "rezultat", emailLabel: "E-mail", whatsappLabel: "WhatsApp", telegramLabel: "Telegram", inquiry: { ...ru.inquiry, eyebrow: "gotowa strona", title: "Zapytanie o", description: "Zostaw kontakt — skontaktuję się w sprawie tej strony i opowiem o kolejnym kroku.", selected: "Wybrano", fullName: "Imię i nazwisko", fullNamePlaceholder: "Jak się do Ciebie zwracać", contact: "Telegram, telefon lub e-mail", contactPlaceholder: "@username, +48… lub name@email.com", comment: "Komentarz", commentPlaceholder: "Na przykład: chcę poznać termin przekazania i dowiedzieć się, czy można zmienić teksty", consent: "Zgadzam się na zapisanie kontaktu, aby otrzymać odpowiedź w sprawie tego zapytania.", submit: "Wyślij zapytanie", sending: "Wysyłamy", accepted: "Zapytanie przyjęte", acceptedText: "Dziękuję! Zapytanie dotyczące strony zostało zapisane. Odpowiem na podany kontakt.", close: "Zamknij", validation: "Podaj imię i kontakt oraz potwierdź zgodę na przetwarzanie danych.", error: "Nie udało się wysłać zapytania. Spróbuj ponownie." }, storefrontKicker: "gotowe rozwiązania / dostępne", storefrontDescription: "Wybierz bazę, otwórz stronę i wyślij zapytanie. Karta odwraca się, aby pokazać szczegóły i przejść do podglądu.", storefrontHint: "najedź lub dotknij", storefrontOpen: "Otwórz", storefrontSold: "Sprzedane", storefrontAvailable: "Na sprzedaż", storefrontRequest: "Wyślij zapytanie", storefrontRequestPlaceholder: "Link pojawi się później", projectsKicker: "Twoja kolekcja opublikowanych realizacji", contacts: "Kontakt", privacy: "Polityka prywatności", privacyTitle: "Polityka prywatności", privacyDescription: "Dane kontaktowe i sposób obsługi zapytań.", privacyAdmin: "Administrator danych", availabilitySold: "Już sprzedane", availabilityForSale: "Na sprzedaż", heroPhrases: ["tworzę strony", "tworzę marki", "tworzę rozwiązania", "tworzę przyszłość"],
  form: { ...ru.form, stepLabel: "Krok", steps: [["01", "O projekcie", "Kontakt i podstawa biznesu"], ["02", "Cele", "Dla kogo i po co jest strona"], ["03", "Struktura", "Podstrony i przydatne funkcje"], ["04", "Język wizualny", "Styl, kolory i inspiracje"], ["05", "Organizacja", "Termin, budżet i start"]], startIntro: "Zacznijmy od faktów. Na podstawie odpowiedzi stworzymy strukturę, ofertę i właściwą logikę pierwszego ekranu.", fields: { ...ru.form.fields, fullName: "Imię i nazwisko", companyName: "Firma / projekt", projectType: "Typ projektu", projectStage: "Etap projektu", phone: "Telefon / komunikator", businessDescription: "O firmie w dwóch–trzech zdaniach", offers: "Co oferujesz klientowi", geography: "Obszar działania", contactPreference: "Jak najwygodniej się skontaktować", audience: "Kim jest idealny klient", audienceTypes: "Kto należy do grupy odbiorców", primaryScenarios: "Główny scenariusz odwiedzającego", goals: "Jakie zadania ma realizować strona", mainGoal: "Jaki rezultat chcesz zobaczyć za 3–6 miesięcy", whyChoose: "Dlaczego klienci wybierają właśnie Ciebie", currentSiteState: "Obecny stan strony", requiredPages: "Które podstrony są ważne", features: "Które funkcje się przydadzą", availableMaterials: "Jakie materiały już masz", contentReadiness: "Gotowość treści", styleWords: "Jaki ma być charakter strony", colorDirection: "Kierunek kolorystyczny", colorNotes: "Uwagi dotyczące kolorów", references: "Strony, marki lub obrazy jako inspiracja", deadline: "Planowany termin startu", budgetRange: "Orientacyjny budżet", comment: "Dodatkowy komentarz" }, placeholders: { ...ru.form.placeholders, fullName: "Jak się do Ciebie zwracać", companyName: "Na przykład Studio Forma", businessDescription: "Czym się zajmujesz, jak długo działasz i co wyróżnia Twoją pracę?", offers: "Główne usługi, produkty, sposób pracy, zakres cen", geography: "Miasto, kraj, online", audience: "Kim są te osoby, z jakim problemem przychodzą i co jest dla nich ważne?", mainGoal: "Na przykład: stałe zapytania z wyszukiwarki, wyraźny wizerunek marki, mniej powtarzalnych pytań", whyChoose: "Doświadczenie, podejście, szybkość, technologia, gwarancja, zespół lub historia", deadline: "Na przykład do 15 października", colorNotes: "Ulubione / niepożądane kolory, kody marki, skojarzenia lub nastrój", references: "Wklej linki i napisz, co Ci się podoba: siatka, zdjęcia, font, sposób prezentacji, rytm" }, validation: ["Uzupełnij imię, firmę, typ i etap projektu, e-mail, telefon, opis firmy, ofertę i obszar działania.", "Opisz odbiorców, wybierz ich typ, główny scenariusz, przynajmniej jeden cel i rezultat strony.", "Wybierz przynajmniej jedną podstronę i określ gotowość treści.", "Wybierz charakter i kierunek kolorystyczny przyszłej strony.", "Podaj termin i budżet, a następnie potwierdź zgodę na przetwarzanie zgłoszenia."], selectBudget: "Wybierz zakres", selectAll: "Wybierz wszystkie pasujące opcje.", sourceTelegram: "Telegram", contactTelegram: "Telegram", contactWhatsapp: "WhatsApp", contactPhone: "Telefon", contactEmail: "E-mail", yes: "Wszystko gotowe", no: "Potrzebuję pomocy", help: "Potrzebuję pomocy", submit: "Wyślij zapytanie", next: "Dalej", previous: "Wstecz", sending: "Wysyłamy…", required: "Pole wymagane", accepted: "Zapytanie przyjęte", acceptedTitle: "Masz już punkt wyjścia dla przyszłej strony.", acceptedText: "Zapytanie zostało zapisane, a podsumowanie PDF jest pobierane. Zachowaj numer zgłoszenia — ułatwi odwołanie do briefu.", requestNumber: "Numer zgłoszenia", downloadAgain: "Pobierz PDF ponownie", savedNotice: "Zapytanie zapisano w bazie, a właściciel projektu otrzymał powiadomienie o nowym briefie.", pdfFontError: "Nie udało się przygotować fontu do PDF.", saveError: "Nie udało się zapisać zapytania. Spróbuj ponownie.", privacyFallback: "Dane z formularza wykorzystujemy wyłącznie do kontaktu i przygotowania oferty.", options: { ...ru.form.options, landing: "Landing page", company: "Strona firmowa", shop: "Sklep internetowy", service: "Serwis / panel klienta", portfolio: "Portfolio", blog: "Blog / media", other: "Inne", idea: "Dopiero pomysł", working: "Firma już działa", outdated: "Strona jest przestarzała", leads: "Strona istnieje — potrzebne są zapytania", restart: "Potrzebny restart projektu", private: "Klienci indywidualni", companies: "Firmy", local: "Klienci lokalni", international: "Odbiorcy międzynarodowi", partners: "Specjaliści / partnerzy", apply: "Wyślij zapytanie", book: "Umów się", buy: "Kup", calculate: "Oblicz cenę", cases: "Zobacz realizacje", message: "Napisz w komunikatorze", calm: "Spokojny", premiumStyle: "Premium", bold: "Odważny", minimal: "Minimalistyczny", tech: "Technologiczny", warm: "Ciepły i ludzki", editorial: "Editorial", expressive: "Ekspresyjny", newSite: "Potrzebna nowa strona", redesign: "Jest strona — potrzebny redesign", contentReady: "Wszystko gotowe", contentHelp: "Potrzebuję pomocy ze strukturą i tekstem", trustColor: "Zaufaj swojej ofercie", lightColor: "Jasna, lekka paleta", darkColor: "Ciemna, elegancka paleta", contrastColor: "Kontrastowa, energetyczna paleta", brandColors: "Są kolory marki — użyj ich" } } }

export const uiCopy: Record<Locale, UiCopy> = { ru, uk, pl };
export function getUiCopy(locale: Locale): UiCopy { return uiCopy[locale] ?? uiCopy.ru; }

const localizedContentOverrides: Record<Exclude<Locale, "ru">, Partial<SiteContent>> = {
  uk: {
    branding: { siteName: "Skifia Art", navAbout: "Про мене", navServices: "Послуги", navProjects: "Проєкти", navContact: "Контакт", footerNote: "Дизайн, розробка та запуск сайтів із характером." },
    hero: { lineOne: "Привіт,", lineTwo: "я створюю", lineThree: "сайти", note: "Дизайн і розробка сайтів, які хочеться розглядати та відкривати знову.", ctaLabel: "Обговорити проєкт" },
    about: { eyebrow: "Про мене / 02", tag: "дизайн із характером", lineOne: "Готова", lineTwo: "обговорити", accentWord: "ваш", lineThree: "проєкт.", description: "Я перетворюю ідею на сайт із характером: вибудовую структуру, візуальну мову та зрозумілий шлях від першого екрана до заявки. Технічні деталі беру на себе, щоб у вас залишався час на проєкт.", ctaLabel: "Заповнити бриф" },
    services: { eyebrow: "Послуги / 03", ctaLabel: "Почати проєкт", statOneLabel: "СТРАТЕГІЯ\nІ СЕНС", statTwoLabel: "ДИЗАЙН\nІ СИСТЕМА", statThreeLabel: "КОД\nІ ЗАПУСК", annotationOne: "Структура, візуал і розробка — щоб сайт точно передавав характер вашого проєкту.", annotationTwo: "Від першого сенсу та прототипу — до запущеного сайту, яким легко керувати.", annotationThree: "Готую інтерфейс, тестую деталі та запускаю сайт без складної технічної рутини.", headlineOne: "СМІЛИВІ", headlineTwo: "САЙТИ", headlineThree: "ПІД КЛЮЧ" },
    closing: { eyebrow: "Є ідея? Зберімо її в робочий сайт.", lineOne: "Час зробити", lineTwo: "щось помітне.", ctaLabel: "Почати" },
    brief: { label: "Заявка на сайт", title: "Розкажіть про проєкт так, щоб він став цікавішим.", intro: "Не потрібно добирати технічні слова. Відповідайте як зручно: це допоможе побачити ваш характер, майбутню структуру та сильні візуальні ходи.", privacyNote: "Дані з форми використовуємо лише для зв’язку з вами та підготовки пропозиції. Адміністратор даних — Jednoosobowa działalność gospodarcza Serhii Zerniashenko, NIP 5732970568." },
    projects: [{ number: "01", name: "Skifia", category: "Лендінг / вантажні перевезення", description: "Лендінг транспортних послуг для польської компанії Skifia — інформативний перший екран, структура послуг, онлайн-калькулятор вартості та форма заявки. Підтримка 4 мов: PL / EN / UA / RU.", url: "https://skifia.online/", coverUrl: "/manus-storage/skifia-hero-real_8a891d4d.png", price: "Ціна за запитом", availability: "available", visual: "violet" }, { number: "02", name: "Ваш другий кейс", category: "Бренд / промо-сайт", description: "Покажіть характер роботи: спокійний сервіс, сміливий продукт або особистий бренд.", url: "", coverUrl: "", price: "Ціна за запитом", availability: "available", visual: "lime" }, { number: "03", name: "Ваш третій кейс", category: "Інтернет-проєкт / сервіс", description: "Додайте проєкт, коли він з’явиться — картка вже підготовлена.", url: "", coverUrl: "", price: "Ціна за запитом", availability: "available", visual: "coral" }]
  },
  pl: {
    branding: { siteName: "Skifia Art", navAbout: "O mnie", navServices: "Usługi", navProjects: "Projekty", navContact: "Kontakt", footerNote: "Projektowanie, tworzenie i uruchamianie stron z charakterem." },
    hero: { lineOne: "Cześć,", lineTwo: "tworzę", lineThree: "strony", note: "Projektuję i tworzę strony, które chce się oglądać i odwiedzać ponownie.", ctaLabel: "Porozmawiajmy o projekcie" },
    about: { eyebrow: "O mnie / 02", tag: "design z charakterem", lineOne: "Chętnie", lineTwo: "omówię", accentWord: "Twój", lineThree: "projekt.", description: "Zamieniam pomysł w stronę z charakterem: buduję strukturę, język wizualny i prostą ścieżkę od pierwszego ekranu do zapytania. Biorę na siebie techniczne szczegóły, aby Tobie zostało więcej czasu na projekt.", ctaLabel: "Wypełnij brief" },
    services: { eyebrow: "Usługi / 03", ctaLabel: "Zacznijmy projekt", statOneLabel: "STRATEGIA\nI SENS", statTwoLabel: "DESIGN\nI SYSTEM", statThreeLabel: "KOD\nI START", annotationOne: "Struktura, wizual i development — aby strona dokładnie oddawała charakter Twojego projektu.", annotationTwo: "Od pierwszego sensu i prototypu — do uruchomionej strony, którą łatwo zarządzać.", annotationThree: "Przygotowuję interfejs, testuję detale i uruchamiam stronę bez trudnej rutyny technicznej.", headlineOne: "ODWAŻNE", headlineTwo: "STRONY", headlineThree: "POD KLUCZ" },
    closing: { eyebrow: "Masz pomysł? Zamieńmy go w działającą stronę.", lineOne: "Czas zrobić", lineTwo: "coś zauważalnego.", ctaLabel: "Zacznijmy" },
    brief: { label: "Zapytanie o stronę", title: "Opowiedz o projekcie tak, aby stał się jeszcze ciekawszy.", intro: "Nie musisz używać technicznych słów. Odpowiedz po swojemu — pomoże to zobaczyć charakter, przyszłą strukturę i mocne kierunki wizualne.", privacyNote: "Dane z formularza wykorzystujemy tylko do kontaktu i przygotowania oferty. Administratorem danych jest Jednoosobowa działalność gospodarcza Serhii Zerniashenko, NIP 5732970568." },
    projects: [{ number: "01", name: "Skifia", category: "Landing page / transport", description: "Landing page usług transportowych dla polskiej firmy Skifia — informacyjny pierwszy ekran, struktura usług, kalkulator ceny online i formularz zapytania. Obsługa 4 języków: PL / EN / UA / RU.", url: "https://skifia.online/", coverUrl: "/manus-storage/skifia-hero-real_8a891d4d.png", price: "Cena na zapytanie", availability: "available", visual: "violet" }, { number: "02", name: "Twój drugi case", category: "Marka / strona promocyjna", description: "Pokaż charakter pracy: spokojny serwis, odważny produkt lub markę osobistą.", url: "", coverUrl: "", price: "Cena na zapytanie", availability: "available", visual: "lime" }, { number: "03", name: "Twój trzeci case", category: "Projekt internetowy / serwis", description: "Dodaj projekt, gdy się pojawi — karta jest już przygotowana.", url: "", coverUrl: "", price: "Cena na zapytanie", availability: "available", visual: "coral" }]
  }
};

export function localizeSiteContent(base: SiteContent, locale: Locale): SiteContent {
  if (locale === "ru") return base;
  const overrides = localizedContentOverrides[locale];
  return {
    ...base,
    ...overrides,
    branding: { ...base.branding, ...overrides.branding },
    hero: { ...base.hero, ...overrides.hero },
    about: { ...base.about, ...overrides.about },
    services: { ...base.services, ...overrides.services },
    closing: { ...base.closing, ...overrides.closing },
    brief: { ...base.brief, ...overrides.brief },
    projects: overrides.projects ?? base.projects,
  };
}

export const defaultUiCopy = uiCopy.ru;

export function createDefaultSiteContentBundle(base: SiteContent = defaultSiteContent): SiteContentBundle {
  return {
    defaultLocale: "ru",
    locales: {
      ru: base,
      uk: localizeSiteContent(base, "uk"),
      pl: localizeSiteContent(base, "pl"),
    },
  };
}

export function isSiteContentBundle(value: unknown): value is SiteContentBundle {
  return Boolean(value && typeof value === "object" && "locales" in value && (value as { locales?: unknown }).locales && typeof (value as { locales: unknown }).locales === "object");
}

export function normalizeSiteContentBundle(value: SiteContent | SiteContentBundle | unknown): SiteContentBundle {
  if (isSiteContentBundle(value)) {
    const raw = value as Partial<SiteContentBundle>;
    const base = raw.locales?.ru ?? defaultSiteContent;
    return {
      defaultLocale: raw.defaultLocale && isLocale(raw.defaultLocale) ? raw.defaultLocale : "ru",
      locales: {
        ru: raw.locales?.ru ?? base,
        uk: raw.locales?.uk ?? localizeSiteContent(base, "uk"),
        pl: raw.locales?.pl ?? localizeSiteContent(base, "pl"),
      },
    };
  }
  return createDefaultSiteContentBundle((value as SiteContent | undefined) ?? defaultSiteContent);
}
