/*
 * Design: «Ночной контроль». Тёмная графитово-фиолетовая система с магентовыми
 * статусами превращает страницу в понятный маршрут владения цифровым проектом.
 */
import { useEffect, useState } from "react";
import BriefApplication from "@/components/BriefApplication";
import InteractiveHero from "@/components/InteractiveHero";
import ProjectPathGame from "@/components/ProjectPathGame";
import RoboticHandMotif from "@/components/RoboticHandMotif";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Check,
  ChevronDown,
  ClipboardCheck,
  Cloud,
  Code2,
  Database,
  ExternalLink,
  FileCheck2,
  Globe2,
  KeyRound,
  Mail,
  Menu,
  MousePointerClick,
  Search,
  WalletCards,
  X,
} from "lucide-react";

const preparationItems = [
  ["01", "Рабочая почта", "Отдельный адрес, к которому у вас всегда есть доступ. На него оформляются все сервисы и уведомления."],
  ["02", "Данные бизнеса", "Название, реквизиты, контакты и юридическая информация — основа доверия и страниц сайта."],
  ["03", "Материалы бренда", "Логотип, цвета, фотографии и видео. Вы подтверждаете право использовать каждый материал."],
  ["04", "Услуги и цены", "Понятное описание услуг, географии и преимуществ помогает собрать структуру и тексты."],
  ["05", "Каналы связи", "Телефон, e-mail, мессенджеры и ссылки на соцсети — туда будут приходить обращения."],
  ["06", "Оплата сервисов", "Домен, внешние тарифы и рекламный бюджет вы оплачиваете напрямую выбранному сервису."],
];

const services = [
  [Globe2, "Домен", "Ваш адрес в интернете и право на его продление.", "Всегда"],
  [Cloud, "Cloudflare", "DNS, HTTPS, защита, скорость и размещение сайта.", "Инфраструктура"],
  [Code2, "GitHub", "Исходный код и история изменений без привязки к разработчику.", "Независимость"],
  [Database, "Supabase", "Заявки, база данных, личный кабинет или файлы, когда они нужны.", "По задаче"],
  [Mail, "Почтовый сервис", "Надёжные уведомления, подтверждения и восстановление пароля.", "По задаче"],
  [Search, "Google Search Console", "Индексация, технические сигналы и поисковая видимость.", "Запуск"],
  [MousePointerClick, "Google Analytics", "Посещения и действия, которые приводят к обращениям.", "Запуск"],
  [Bot, "Telegram", "Кнопка чата, уведомления о заявках или сценарий бота.", "По уровню"],
] as const;

const packages = [
  ["Стартовый сайт", "Эксперту или небольшой услуге", "Лендинг до 5 блоков, форма связи, базовое SEO, домен и мессенджеры.", "2 500–4 500 PLN"],
  ["Бизнес-сайт", "Компании услуг и локальному бизнесу", "6–10 страниц, формы, аналитика, Search Console, уведомления, техническое SEO.", "4 500–8 500 PLN"],
  ["Сайт с автоматизацией", "Бизнесу с заявками и менеджерами", "База заявок, кабинет или админка, расчёт, бронирование, бот, интеграции.", "от 9 000 PLN"],
  ["Сопровождение", "Работающему сайту", "Резервное копирование, обновления, контроль форм, небольшие правки и отчёт.", "250–600 PLN / мес."],
];

const steps = [
  ["01", "Бриф", "Вы передаёте цели, услуги, материалы и контакты. Я предлагаю структуру и состав работ."],
  ["02", "Аккаунты", "Вы регистрируете сервисы на своей почте и добавляете меня с нужным уровнем доступа."],
  ["03", "Разработка", "Вы утверждаете дизайн и тексты. Я создаю страницы, формы и нужные интеграции."],
  ["04", "Запуск", "Вы оплачиваете внешние сервисы при необходимости. Я подключаю домен, HTTPS, SEO и тестирую сайт."],
  ["05", "Передача", "Вы получаете исходный код, список сервисов, настройки, инструкцию и права владельца."],
  ["06", "Сопровождение", "При необходимости согласуем обновления, SEO, рекламу или Telegram-интеграции."],
];

const checklistLabels = [
  "Рабочая почта создана и защищена двухфакторной авторизацией",
  "Домен оформлен на клиента, автопродление включено",
  "Клиент владеет Cloudflare, GitHub и Supabase",
  "Форма заявок протестирована, обращения доходят в e-mail или Telegram",
  "Владелец подтверждён в Google Search Console",
  "Добавлены политика конфиденциальности и согласие в формах",
  "На сайте актуальны контакты, услуги и цены",
  "У клиента есть финальный список сервисов и доступов",
];

const faqs = [
  ["Нужно ли передавать пароли или банковские данные?", "Нет. Вы самостоятельно вводите пароль, код подтверждения и данные оплаты в кабинетах сервисов. Для работы достаточно пригласить исполнителя через «Добавить пользователя» или «Пригласить участника»."],
  ["Все ли сервисы нужны каждому сайту?", "Нет. Презентационному сайту обычно не нужна база данных. Supabase, отправка писем, личный кабинет или Telegram-бот подключаются только тогда, когда этого требует функция сайта."],
  ["Что именно будет передано после запуска?", "Адрес сайта, дату запуска, список аккаунтов и владельцев, репозиторий исходного кода, место хранения базы данных, интеграции, сроки оплаченных услуг и инструкцию по дальнейшему управлению."],
];

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#ff9beb]"><span className="grid h-6 w-6 place-items-center border border-[#a458ff] bg-[#6d2bd0] text-[9px] text-white">{number}</span><span>{children}</span></div>;
}

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} className="group inline-flex items-center gap-3 border-b border-[#8a65ae] pb-1.5 text-sm font-semibold text-[#ffb0ef] transition-colors hover:border-[#ff68df] hover:text-white">{children}<ArrowDownRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></a>;
}

function CardIcon({ children }: { children: React.ReactNode }) {
  return <div className="grid h-9 w-9 place-items-center border border-[#6d4591] bg-[#201037] text-[#c67aff]">{children}</div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(Array(checklistLabels.length).fill(false));
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const completeCount = checked.filter(Boolean).length;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = document.querySelectorAll<HTMLElement>("main > section:not(#top)");
    targets.forEach((target) => target.classList.add("scroll-reveal"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = document.querySelectorAll<HTMLElement>("main article:not(.control-card):not(.interactive-step)");
    cards.forEach((card, index) => {
      card.classList.add("card-reveal");
      card.style.setProperty("--card-delay", `${(index % 6) * 70}ms`);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("card-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="neon-shell min-h-screen overflow-hidden bg-[#0b0617] text-[#f5efff]">
      <header className="neon-header sticky top-0 z-50 border-b border-[#33204f] bg-[#0b0617]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 sm:px-8 lg:px-12">
          <a href="#top" className="group flex items-center gap-3" aria-label="На главную"><img src="/manus-storage/site-handover-mark_522aa1da.png" alt="" className="h-10 w-10 object-contain transition-transform duration-200 group-hover:-rotate-6" /><span className="leading-tight"><span className="block font-display text-sm font-extrabold tracking-[-0.05em]">Сайт под ключ</span><span className="block font-mono text-[9px] uppercase tracking-[0.15em] text-[#c9b8e9]">контроль клиента</span></span></a>
          <nav className="hidden items-center gap-6 font-mono text-[10px] uppercase tracking-[0.13em] text-[#cec1e3] lg:flex"><a href="#ownership" className="transition-colors hover:text-[#ff65de]">Владение</a><a href="#services" className="transition-colors hover:text-[#ff65de]">Сервисы</a><a href="#process" className="transition-colors hover:text-[#ff65de]">Передача</a><a href="#checklist" className="transition-colors hover:text-[#ff65de]">Чек-лист</a></nav>
          <a href="#brief" className="hidden border border-[#ba55ff] bg-[#7028d9] px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_0_24px_rgba(206,80,255,.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#a43dff] active:translate-y-0 active:scale-[0.97] sm:block">Собрать бриф</a>
          <button className="grid h-10 w-10 place-items-center border border-[#624180] text-[#f5efff] lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={menuOpen}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
        {menuOpen && <nav className="border-t border-[#33204f] bg-[#110a20] px-5 py-4 text-[#f5efff] sm:px-8 lg:hidden"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 font-mono text-xs uppercase tracking-[0.12em]"><a href="#ownership" onClick={() => setMenuOpen(false)}>Владение</a><a href="#services" onClick={() => setMenuOpen(false)}>Сервисы</a><a href="#process" onClick={() => setMenuOpen(false)}>Передача</a><a href="#checklist" onClick={() => setMenuOpen(false)}>Чек-лист</a><a href="#brief" onClick={() => setMenuOpen(false)} className="text-[#ff65de]">Собрать бриф →</a></div></nav>}
      </header>

      <main>
        <InteractiveHero />
        <RoboticHandMotif />

        <section id="ownership" className="border-y border-[#3d265f] bg-[#110a20]">
          <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.82fr_1.18fr]">
            <div className="border-b border-[#3d265f] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-12"><SectionLabel number="01">Главный принцип</SectionLabel><h2 className="mt-7 max-w-md font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.065em] sm:text-5xl">Владелец —<br />не наблюдатель.</h2><p className="mt-6 max-w-md text-[17px] leading-7 text-[#d0c0e5]">Домен, аккаунты, реклама, статистика и база заявок оформляются на рабочую почту клиента и остаются под его контролем.</p><div className="mt-9 border-l-2 border-[#ff68df] bg-[#24103f] px-5 py-4 text-sm leading-6 text-[#eadcff]"><strong>Безопаснее так:</strong> вы приглашаете исполнителя в сервис через роль пользователя, а не передаёте личный пароль.</div></div>
            <div className="grid sm:grid-cols-2">{[[KeyRound, "Аккаунты на вашей почте", "Восстановление доступа, уведомления о продлениях и права владельца всегда остаются у вас."], [WalletCards, "Оплата напрямую сервису", "Вы сами вводите платёжные данные и получаете счета. Внешние расходы не смешиваются с работой исполнителя."], [FileCheck2, "Исходный код передаётся", "Репозиторий с историей изменений помогает развивать сайт и сменить исполнителя без зависимости от конструктора."], [ClipboardCheck, "Передача фиксируется", "В финальном письме или акте — адрес сайта, сервисы, владельцы, доступы и инструкции."]].map(([Icon, title, text], index) => { const IconComponent = Icon as typeof KeyRound; return <article key={title as string} className={`p-6 sm:p-8 lg:p-12 ${index < 2 ? "border-b border-[#3d265f]" : ""} ${index % 2 === 0 ? "sm:border-r sm:border-[#3d265f]" : ""}`}><IconComponent className="h-7 w-7 text-[#b867ff]" /><h3 className="mt-6 font-display text-2xl font-bold tracking-[-0.04em]">{title as string}</h3><p className="mt-3 text-sm leading-6 text-[#c9b9de]">{text as string}</p></article>; })}</div>
          </div>
        </section>

        <section className="bg-[#0d0719] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto grid max-w-[1440px] gap-9 lg:grid-cols-[0.6fr_1.4fr] lg:gap-16"><div><SectionLabel number="02">До начала работы</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Подготовьте опору для проекта.</h2><p className="mt-6 max-w-sm leading-7 text-[#cdbde2]">Начать можно с одной отдельной рабочей почты. Остальное соберём в процессе — без спешки и лишних регистраций.</p></div><div className="grid gap-px bg-[#493069] sm:grid-cols-2 lg:grid-cols-3">{preparationItems.map(([num, title, text]) => <article key={num} className="group bg-[#170c29] p-6 transition-colors duration-200 hover:bg-[#261143]"><div className="flex items-center justify-between"><span className="font-mono text-xs text-[#ff9beb]">{num}</span><ArrowUpRight className="h-4 w-4 text-[#9575b6] transition-all duration-200 group-hover:text-[#ff9beb]" /></div><h3 className="mt-9 font-display text-xl font-bold tracking-[-0.035em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#c9b9de]">{text}</p></article>)}</div></div>
        </section>

        <section id="services" className="relative overflow-hidden bg-[linear-gradient(125deg,#19082f_0%,#421478_56%,#1a0b34_100%)] text-[#f8f1ff]"><div className="absolute inset-y-0 right-0 w-[42%] bg-[#9134de] opacity-30" /><div className="relative mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:px-12"><div><SectionLabel number="03">Экосистема проекта</SectionLabel><h2 className="mt-7 max-w-md font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Подключаем только то, что работает на задачу.</h2><p className="mt-6 max-w-md text-[17px] leading-7 text-[#e0cff4]">Презентационной странице часто не нужна база данных. А заявкам, личному кабинету и редактируемому контенту — нужна. Набор сервисов подбирается по функции.</p><img src="/manus-storage/services-asset-dossier_9b7447fc.png" alt="Карточки подключаемых цифровых сервисов" className="mt-10 hidden w-full max-w-md border border-[#b56aff]/45 lg:block" /></div><div className="grid gap-3 sm:grid-cols-2">{services.map(([Icon, name, text, when], index) => { const IconComponent = Icon as typeof Globe2; return <article key={name} className="group grid grid-cols-[36px_1fr_auto] gap-4 border border-[#bd73ff]/35 bg-[#1b0a34]/75 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#ff9ceb] hover:bg-[#361260]"><CardIcon><IconComponent className="h-[18px] w-[18px]" /></CardIcon><div><h3 className="font-display text-xl font-bold tracking-[-0.035em]">{name}</h3><p className="mt-1 text-sm leading-6 text-[#ddccec]">{text}</p></div><div className="self-start pt-1 text-right font-mono text-[9px] uppercase tracking-[0.13em] text-[#ff9ceb]">{when}<span className="mt-1 block text-[#bfa7dc]">/{String(index + 1).padStart(2, "0")}</span></div></article>; })}</div></div></section>

        <section className="bg-[#110a20] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-2"><div className="border-t-4 border-[#bd6cff] pt-6"><SectionLabel number="04">Расходы без смешения</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Две строки.<br />Два назначения.</h2><p className="mt-5 max-w-md text-[17px] leading-7 text-[#cdbde2]">Стоимость разработки и внешние платежи — разные вещи. Так клиент всегда видит, что именно оплачивает и кому.</p><div className="mt-9 grid gap-px bg-[#493069] sm:grid-cols-2"><div className="bg-[#1a0d30] p-6"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#ff9beb]">Внешние сервисы</p><p className="mt-4 font-display text-xl font-bold tracking-[-0.04em]">Домен, размещение, база, почта, рекламный бюджет</p><p className="mt-4 text-sm text-[#c7b6db]">Оплачиваются вами напрямую выбранному сервису.</p></div><div className="bg-[#24103f] p-6"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#ff9beb]">Работа исполнителя</p><p className="mt-4 font-display text-xl font-bold tracking-[-0.04em]">Структура, дизайн, настройка, запуск и сопровождение</p><p className="mt-4 text-sm text-[#c7b6db]">Фиксируются в предложении вместе с объёмом и сроком.</p></div></div></div><div className="border-t-4 border-[#ff68df] pt-6"><SectionLabel number="05">Telegram поэтапно</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">От кнопки чата до автоматизации.</h2><div className="mt-7 border-t border-[#493069]">{["Кнопка Telegram", "Уведомления о заявках", "Бот для клиентов"].map((title, index) => <div key={title} className="grid grid-cols-[42px_1fr] gap-5 border-b border-[#493069] py-5"><span className="font-mono text-xs text-[#ff9beb]">0{index + 1}</span><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-[#c9b9de]">{index === 0 ? "Посетитель сразу открывает диалог с компанией. Нужна только ссылка на существующий аккаунт или канал." : index === 1 ? "Каждое обращение приходит в рабочий чат. Нужны аккаунт, группа команды и бот компании." : "Ответы на частые вопросы, сбор контактов и маршрут к менеджеру — по согласованному сценарию."}</p></div></div>)}</div><p className="mt-5 border-l-2 border-[#ff5c9a] pl-4 text-sm leading-6 text-[#efc9dc]"><strong>Важно:</strong> секретный ключ бота хранится только в защищённых настройках, а не в коде или переписке.</p></div></div></section>

        <section className="border-y border-[#3d265f] bg-[#160b29]"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-2"><div className="p-6 sm:p-10 lg:border-r lg:border-[#3d265f] lg:p-14"><SectionLabel number="06">Поиск и аналитика</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.04] tracking-[-0.065em] sm:text-5xl">SEO — это не обещание первого места.</h2><p className="mt-6 max-w-lg leading-7 text-[#cdbde2]">Это системная работа, благодаря которой поисковая система правильно находит, читает и показывает сайт по релевантным запросам.</p><div className="mt-8 border-l-2 border-[#b867ff] px-5"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#ff9beb]">Технический старт</p><p className="mt-2 text-sm leading-6 text-[#ded1ed]">Метатеги, sitemap, robots, мобильная версия, скорость, Search Console, аналитика и проверка индексации.</p></div><div className="mt-6 border-l-2 border-[#795693] px-5"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#c4afdc]">Дальше по необходимости</p><p className="mt-2 text-sm leading-6 text-[#ded1ed]">Локальная оптимизация, новые страницы и статьи, мониторинг запросов, технические улучшения и отчёт.</p></div></div><div className="bg-[#1d0d35] p-6 sm:p-10 lg:p-14"><SectionLabel number="07">Реклама</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.04] tracking-[-0.065em] sm:text-5xl">Рекламный кабинет — тоже ваш.</h2><p className="mt-6 max-w-lg leading-7 text-[#d9caec]">Карточка и бюджет принадлежат клиенту. Исполнитель получает доступ для настройки и ведения, но не личный пароль и не право собственности.</p><div className="mt-9 grid grid-cols-4 gap-3">{["Подготовка", "Запуск", "2–4 недели", "Ведение"].map((label, index) => <div key={label} className="border-t border-[#714b94] pt-3"><span className="font-mono text-[10px] text-[#ff9beb]">0{index + 1}</span><p className="mt-2 text-sm font-semibold leading-5">{label}</p></div>)}</div><p className="mt-9 border border-[#6f4794] bg-[#291148] p-4 text-sm leading-6 text-[#ded1ed]"><strong className="text-[#ff9beb]">Прозрачно:</strong> цели рекламы подключаются до запуска — звонок, форма, Telegram, бронирование или покупка. Тогда оцениваем не клики, а обращения.</p></div></div></section>

        <section className="bg-[#0d0719] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto max-w-[1440px]"><div className="flex flex-col justify-between gap-8 border-b border-[#493069] pb-9 lg:flex-row lg:items-end"><div><SectionLabel number="08">Пример сетки услуг</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.065em] sm:text-5xl">Объём, срок и цена —<br />в одном предложении.</h2></div><p className="max-w-sm text-sm leading-6 text-[#c9b9de]">Цифры ниже — ориентир за работу. Фотографии, большой копирайтинг, переводы, платные плагины и рекламный бюджет указываются отдельно, если не включены в пакет.</p></div><div className="divide-y divide-[#493069]">{packages.map(([name, target, description, price], index) => <article key={name} className="interactive-card group grid gap-4 py-6 transition-colors sm:grid-cols-[56px_1fr_1.3fr_auto] sm:items-center sm:gap-7"><span className="font-mono text-xs text-[#ff9beb]">0{index + 1}</span><div><h3 className="font-display text-2xl font-bold tracking-[-0.045em]">{name}</h3><p className="mt-1 text-xs text-[#af96c7]">{target}</p></div><p className="text-sm leading-6 text-[#c9b9de]">{description}</p><p className="font-mono text-sm font-medium whitespace-nowrap text-[#ff9beb]">{price}</p></article>)}</div></div></section>

        <section id="process" className="border-y border-[#3d265f] bg-[#140a28]"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.55fr_1.45fr]"><div className="border-b border-[#3d265f] p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12"><SectionLabel number="09">Порядок работы</SectionLabel><h2 className="mt-7 max-w-sm font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Передача — часть процесса, не финальная формальность.</h2><p className="mt-6 max-w-sm leading-7 text-[#cdbde2]">Двигаемся от брифа к независимому, документированному результату. Роль клиента и исполнителя обозначена на каждом шаге.</p><ArrowLink href="#brief">Собрать данные для старта</ArrowLink></div><div className="relative overflow-hidden p-6 sm:p-10 lg:p-12"><div className="route-line absolute bottom-0 left-[38px] top-0 w-px bg-[#a458ff] sm:left-[58px] lg:left-[68px]" />{steps.map(([num, title, text], index) => <article key={num} className="interactive-step relative grid grid-cols-[44px_1fr] gap-5 pb-9 last:pb-0 sm:grid-cols-[62px_1fr] sm:gap-7"><div className="relative z-10 grid h-10 w-10 place-items-center border border-[#a458ff] bg-[#1d0d35] font-mono text-[11px] text-[#ff9beb]">{num}</div><div className="pt-1"><div className="flex flex-wrap items-baseline gap-x-4"><h3 className="font-display text-2xl font-bold tracking-[-0.04em]">{title}</h3><span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#b99fd4]">этап {index + 1} / 6</span></div><p className="mt-2 max-w-2xl text-sm leading-6 text-[#c9b9de]">{text}</p></div></article>)}</div></div></section>

        <section id="checklist" className="bg-[#110a20] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.88fr_1.12fr]"><div><SectionLabel number="10">Перед запуском</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Проверьте передачу до публикации.</h2><p className="mt-6 max-w-md text-[17px] leading-7 text-[#cdbde2]">Этот список остаётся в вашем браузере. Отмечайте готовое и используйте его как финальную проверку контроля над проектом.</p><div className="mt-10 border border-[#553875] bg-[#1c0d32] p-6"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#ff9beb]">Готовность запуска</p><p className="mt-3 font-display text-5xl font-extrabold tracking-[-0.07em] text-[#ff9beb]">{completeCount}<span className="text-2xl text-[#bba4d4]">/{checklistLabels.length}</span></p><div className="mt-4 h-2 overflow-hidden bg-[#392052]"><div className="h-full bg-[linear-gradient(90deg,#8d37ee,#ff68df)] transition-all duration-300" style={{ width: `${(completeCount / checklistLabels.length) * 100}%` }} /></div></div></div><div className="border-t border-[#493069]">{checklistLabels.map((label, index) => <label key={label} className="group flex cursor-pointer items-start gap-4 border-b border-[#493069] py-4"><input type="checkbox" checked={checked[index]} onChange={() => setChecked((current) => current.map((item, itemIndex) => itemIndex === index ? !item : item))} className="peer sr-only" /><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border border-[#8866a6] bg-[#190d2c] transition-all duration-200 peer-checked:border-[#ff68df] peer-checked:bg-[#7b31dd]"><Check className="h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" /></span><span className="text-[15px] leading-6 text-[#ded1ed] transition-colors group-hover:text-[#ff9beb] peer-checked:text-[#9680aa] peer-checked:line-through">{label}</span></label>)}</div></div></section>

        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_72%_20%,#a72ac4_0%,#65189d_33%,#2d0b55_72%)] text-[#fff7ff]"><img src="/manus-storage/handover-checklist-art_07008bb9.png" alt="Абстрактный чек-лист передачи проекта" className="absolute right-0 top-0 hidden h-full w-[36%] object-cover opacity-60 mix-blend-screen lg:block" /><div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="max-w-3xl"><SectionLabel number="11">Финальный результат</SectionLabel><blockquote className="mt-8 font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.065em] sm:text-6xl">«Сайт принадлежит вам не тогда, когда он опубликован, а когда вы можете управлять каждым его ключевым элементом».</blockquote><p className="mt-8 max-w-2xl text-lg leading-8 text-[#f5d7ff]">В финальном акте или письме фиксируются: адрес сайта, дата запуска, сервисы, владелец домена, исходный код, база данных, интеграции, сроки оплаченных услуг и контакты для поддержки.</p></div></div></section>

        <ProjectPathGame />
        <BriefApplication />

        <section className="bg-[#0d0719] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.72fr_1.28fr]"><div><SectionLabel number="13">Коротко о важном</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Вопросы, которые стоит задать до старта.</h2></div><div className="border-t border-[#493069]">{faqs.map(([question, answer], index) => <div key={question} className="border-b border-[#493069]"><button className="flex w-full items-center justify-between gap-5 py-5 text-left" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span className="font-display text-xl font-bold tracking-[-0.03em]">{question}</span><ChevronDown className={`h-5 w-5 shrink-0 text-[#ff9beb] transition-transform duration-200 ${openFaq === index ? "rotate-180" : ""}`} /></button>{openFaq === index && <p className="max-w-2xl pb-6 text-[15px] leading-7 text-[#cdbde2]">{answer}</p>}</div>)}</div></div></section>
      </main>

      <footer className="neon-footer border-t border-[#3d265f] bg-[#0a0613] text-[#f5efff]"><div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12"><div className="grid gap-9 lg:grid-cols-[1.1fr_1.4fr_0.5fr]"><div><div className="flex items-center gap-3"><img src="/manus-storage/site-handover-mark_522aa1da.png" alt="" className="h-10 w-10" /><div className="font-display font-bold tracking-[-0.04em]">Сайт под ключ</div></div><p className="mt-5 max-w-sm text-sm leading-6 text-[#d4c4e8]">Путеводитель по запуску, подключению сервисов и независимой передаче цифрового проекта клиенту.</p></div><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#ff9beb]">Источники для проверки</p><div className="mt-4 grid gap-x-7 gap-y-3 text-sm text-[#d4c4e8] sm:grid-cols-2"><a className="hover:text-[#ff9beb]" href="https://developers.cloudflare.com/workers/platform/pricing/" target="_blank" rel="noreferrer">[1] Cloudflare Workers <ExternalLink className="ml-1 inline h-3 w-3" /></a><a className="hover:text-[#ff9beb]" href="https://www.cloudflare.com/products/registrar/" target="_blank" rel="noreferrer">[2] Cloudflare Registrar <ExternalLink className="ml-1 inline h-3 w-3" /></a><a className="hover:text-[#ff9beb]" href="https://supabase.com/pricing" target="_blank" rel="noreferrer">[3] Supabase Pricing <ExternalLink className="ml-1 inline h-3 w-3" /></a><a className="hover:text-[#ff9beb]" href="https://business.google.com/us/google-ads/campaign-budget/" target="_blank" rel="noreferrer">[4] Google Ads <ExternalLink className="ml-1 inline h-3 w-3" /></a><a className="hover:text-[#ff9beb]" href="https://core.telegram.org/bots/api" target="_blank" rel="noreferrer">[5] Telegram Bot API <ExternalLink className="ml-1 inline h-3 w-3" /></a><a className="hover:text-[#ff9beb]" href="https://developers.google.com/search/docs/monitor-debug/search-console-start" target="_blank" rel="noreferrer">[6] Google Search Console <ExternalLink className="ml-1 inline h-3 w-3" /></a></div></div><div className="lg:text-right"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#ff9beb]">Принцип</p><p className="mt-3 text-sm leading-6 text-[#d4c4e8]">Все ключевые активы остаются у клиента.</p></div></div><div className="mt-10 flex flex-col justify-between gap-4 border-t border-[#493069] pt-5 font-mono text-[9px] uppercase tracking-[0.13em] text-[#af96c7] sm:flex-row"><span>Сайт под ключ / справочник клиента</span><span>© {new Date().getFullYear()} / контроль цифровых активов</span></div></div></footer>
    </div>
  );
}
