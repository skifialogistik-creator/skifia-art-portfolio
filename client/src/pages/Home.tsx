/*
 * Design: «Владение без тревоги». Страница — понятное досье, а не обычный лендинг:
 * тёплая бумага, графит, контрольный кобальт, служебные номера и маршрут передачи.
 */
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Cloud,
  Code2,
  Copy,
  Database,
  ExternalLink,
  FileCheck2,
  Globe2,
  KeyRound,
  Mail,
  Menu,
  MousePointerClick,
  Search,
  ShieldCheck,
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
];

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
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#075c70]">
      <span className="grid h-6 w-6 place-items-center border border-[#075c70] bg-[#075c70] text-[9px] text-[#fcfaf5]">{number}</span>
      <span>{children}</span>
    </div>
  );
}

function ArrowLink({ href, children, subtle = false }: { href: string; children: React.ReactNode; subtle?: boolean }) {
  return (
    <a href={href} className={`group inline-flex items-center gap-3 border-b pb-1.5 text-sm font-semibold transition-colors ${subtle ? "border-[#b9c5c0] text-[#075c70] hover:border-[#075c70]" : "border-[#202625] text-[#202625] hover:border-[#075c70] hover:text-[#075c70]"}`}>
      {children}<ArrowDownRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
    </a>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(Array(checklistLabels.length).fill(false));
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [briefCopied, setBriefCopied] = useState(false);
  const [brief, setBrief] = useState({ name: "", business: "", contacts: "", services: "", geography: "", note: "" });
  const completeCount = checked.filter(Boolean).length;

  const copyBrief = async () => {
    const text = `БРИФ НА САЙТ\n\nИмя / компания: ${brief.name || "—"}\nЧем занимается бизнес: ${brief.business || "—"}\nКонтакты: ${brief.contacts || "—"}\nУслуги и цены: ${brief.services || "—"}\nГеография работы: ${brief.geography || "—"}\nДополнительная информация: ${brief.note || "—"}`;
    try {
      await navigator.clipboard.writeText(text);
      setBriefCopied(true);
      window.setTimeout(() => setBriefCopied(false), 2400);
    } catch {
      setBriefCopied(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f4f0e8] text-[#202625]">
      <header className="sticky top-0 z-50 border-b border-[#d6d0c5] bg-[#f4f0e8]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 sm:px-8 lg:px-12">
          <a href="#top" className="group flex items-center gap-3" aria-label="На главную">
            <img src="/manus-storage/site-handover-mark_522aa1da.png" alt="" className="h-10 w-10 object-contain transition-transform duration-200 group-hover:-rotate-6" />
            <span className="leading-tight"><span className="block font-display text-sm font-extrabold tracking-[-0.05em]">Сайт под ключ</span><span className="block font-mono text-[9px] uppercase tracking-[0.15em] text-[#66706d]">контроль клиента</span></span>
          </a>
          <nav className="hidden items-center gap-6 font-mono text-[10px] uppercase tracking-[0.13em] text-[#45504d] lg:flex">
            <a href="#ownership" className="transition-colors hover:text-[#075c70]">Владение</a>
            <a href="#services" className="transition-colors hover:text-[#075c70]">Сервисы</a>
            <a href="#process" className="transition-colors hover:text-[#075c70]">Передача</a>
            <a href="#checklist" className="transition-colors hover:text-[#075c70]">Чек-лист</a>
          </nav>
          <a href="#brief" className="hidden border border-[#075c70] bg-[#075c70] px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#fcfaf5] transition-all duration-200 hover:bg-[#064c5c] active:scale-[0.97] sm:block">Собрать бриф</a>
          <button className="grid h-10 w-10 place-items-center border border-[#b7b0a5] lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={menuOpen}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && <nav className="border-t border-[#d6d0c5] bg-[#fcfaf5] px-5 py-4 sm:px-8 lg:hidden"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 font-mono text-xs uppercase tracking-[0.12em]"><a href="#ownership" onClick={() => setMenuOpen(false)}>Владение</a><a href="#services" onClick={() => setMenuOpen(false)}>Сервисы</a><a href="#process" onClick={() => setMenuOpen(false)}>Передача</a><a href="#checklist" onClick={() => setMenuOpen(false)}>Чек-лист</a><a href="#brief" onClick={() => setMenuOpen(false)} className="text-[#075c70]">Собрать бриф →</a></div></nav>}
      </header>

      <main id="top">
        <section className="relative mx-auto max-w-[1440px] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14 lg:px-12 lg:pb-24 lg:pt-20">
          <div className="absolute left-5 top-0 hidden h-full w-px bg-[#d6d0c5] lg:left-12 lg:block" />
          <div className="absolute left-5 top-[168px] hidden h-10 w-px bg-[#075c70] lg:left-12 lg:block" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(440px,1.08fr)] lg:gap-14">
            <div className="relative pl-0 lg:pl-10">
              <div className="reveal"><SectionLabel number="00">Путеводитель по запуску</SectionLabel></div>
              <h1 className="reveal reveal-d1 mt-8 max-w-[660px] font-display text-[clamp(3.3rem,7vw,6.7rem)] font-extrabold leading-[0.95] tracking-[-0.075em] text-[#202625]">Ваш сайт.<br /><span className="text-[#075c70]">Ваши аккаунты.</span><br />Ваш контроль.</h1>
              <p className="reveal reveal-d2 mt-8 max-w-xl text-lg leading-8 text-[#4d5955] sm:text-xl">Понятный план: что подготовить, какие сервисы нужны и как безопасно получить сайт со всеми правами владельца.</p>
              <div className="reveal reveal-d2 mt-10 flex flex-wrap items-center gap-x-7 gap-y-4"><a href="#brief" className="group inline-flex items-center gap-3 bg-[#075c70] px-5 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-[#fcfaf5] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#064c5c] active:scale-[0.97]">Начать с брифа <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></a><ArrowLink href="#ownership">Как устроено владение</ArrowLink></div>
              <div className="reveal reveal-d2 mt-14 grid max-w-xl grid-cols-3 gap-3 border-t border-[#c8c0b4] pt-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#66706d]">Правило</p><p className="mt-2 text-sm font-semibold leading-5">Никаких паролей в переписке</p></div><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#66706d]">Владелец</p><p className="mt-2 text-sm font-semibold leading-5">Клиент, не исполнитель</p></div><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#66706d]">Финал</p><p className="mt-2 text-sm font-semibold leading-5">Доступы + код + инструкция</p></div></div>
            </div>
            <div className="reveal relative min-h-[440px] overflow-hidden border border-[#d6d0c5] bg-[#e4eee9] shadow-[12px_14px_0_#d2cbc0] sm:min-h-[520px]">
              <img src="/manus-storage/hero-ownership-route_16e06edc.png" alt="Абстрактный маршрут безопасной передачи сайта клиенту" className="absolute inset-0 h-full w-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#123c46]/85 via-[#123c46]/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-[#fcfaf5] sm:p-8"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c5e2da]">Принцип 01</p><p className="mt-2 max-w-sm font-display text-2xl font-bold leading-tight tracking-[-0.04em]">У клиента — все ключи от проекта.</p></div><ShieldCheck className="mb-1 h-9 w-9 shrink-0 text-[#c5e2da]" /></div>
              <div className="absolute right-5 top-5 border border-[#fcfaf5]/50 bg-[#075c70]/90 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#fcfaf5]">досье / 2026</div>
            </div>
          </div>
        </section>

        <section id="ownership" className="border-y border-[#d6d0c5] bg-[#fcfaf5]">
          <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.82fr_1.18fr]">
            <div className="border-b border-[#d6d0c5] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-12"><SectionLabel number="01">Главный принцип</SectionLabel><h2 className="mt-7 max-w-md font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.065em] sm:text-5xl">Владелец —<br />не наблюдатель.</h2><p className="mt-6 max-w-md text-[17px] leading-7 text-[#54605c]">Домен, аккаунты, реклама, статистика и база заявок оформляются на рабочую почту клиента и остаются под его контролем.</p><div className="mt-9 border-l-2 border-[#075c70] bg-[#e5f0eb] px-5 py-4 text-sm leading-6 text-[#29423f]"><strong>Безопаснее так:</strong> вы приглашаете исполнителя в сервис через роль пользователя, а не передаёте личный пароль.</div></div>
            <div className="grid sm:grid-cols-2"><div className="border-b border-[#d6d0c5] p-6 sm:border-r sm:p-8 lg:p-12"><KeyRound className="h-7 w-7 text-[#075c70]" /><h3 className="mt-6 font-display text-2xl font-bold tracking-[-0.04em]">Аккаунты на вашей почте</h3><p className="mt-3 text-sm leading-6 text-[#5e6965]">Восстановление доступа, уведомления о продлениях и права владельца всегда остаются у вас.</p></div><div className="border-b border-[#d6d0c5] p-6 sm:p-8 lg:p-12"><WalletCards className="h-7 w-7 text-[#075c70]" /><h3 className="mt-6 font-display text-2xl font-bold tracking-[-0.04em]">Оплата напрямую сервису</h3><p className="mt-3 text-sm leading-6 text-[#5e6965]">Вы сами вводите платёжные данные и получаете счета. Внешние расходы не смешиваются с работой исполнителя.</p></div><div className="p-6 sm:border-r sm:p-8 lg:p-12"><FileCheck2 className="h-7 w-7 text-[#075c70]" /><h3 className="mt-6 font-display text-2xl font-bold tracking-[-0.04em]">Исходный код передаётся</h3><p className="mt-3 text-sm leading-6 text-[#5e6965]">Репозиторий с историей изменений помогает развивать сайт и сменить исполнителя без зависимости от конструктора.</p></div><div className="p-6 sm:p-8 lg:p-12"><ClipboardCheck className="h-7 w-7 text-[#075c70]" /><h3 className="mt-6 font-display text-2xl font-bold tracking-[-0.04em]">Передача фиксируется</h3><p className="mt-3 text-sm leading-6 text-[#5e6965]">В финальном письме или акте — адрес сайта, сервисы, владельцы, доступы и инструкции.</p></div></div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid gap-9 lg:grid-cols-[0.6fr_1.4fr] lg:gap-16"><div><SectionLabel number="02">До начала работы</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Подготовьте опору для проекта.</h2><p className="mt-6 max-w-sm leading-7 text-[#56605c]">Начать можно с одной отдельной рабочей почты. Остальное соберём в процессе — без спешки и лишних регистраций.</p></div><div className="grid gap-px bg-[#d6d0c5] sm:grid-cols-2 lg:grid-cols-3">{preparationItems.map(([num, title, text]) => <article key={num} className="group bg-[#f4f0e8] p-6 transition-colors duration-200 hover:bg-[#e5f0eb]"><div className="flex items-center justify-between"><span className="font-mono text-xs text-[#075c70]">{num}</span><ArrowUpRight className="h-4 w-4 text-[#9da7a2] transition-all duration-200 group-hover:text-[#075c70]" /></div><h3 className="mt-9 font-display text-xl font-bold tracking-[-0.035em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#606965]">{text}</p></article>)}</div></div>
        </section>

        <section id="services" className="relative overflow-hidden bg-[#123c46] text-[#f5f2ea]"><div className="absolute inset-y-0 right-0 w-[42%] bg-[#075c70] opacity-70" /><div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]"><div><SectionLabel number="03">Экосистема проекта</SectionLabel><h2 className="mt-7 max-w-md font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Подключаем только то, что работает на задачу.</h2><p className="mt-6 max-w-md text-[17px] leading-7 text-[#c8d9d4]">Презентационной странице часто не нужна база данных. А заявкам, личному кабинету и редактируемому контенту — нужна. Набор сервисов подбирается по функции.</p><img src="/manus-storage/services-asset-dossier_9b7447fc.png" alt="Карточки подключаемых цифровых сервисов" className="mt-10 hidden w-full max-w-md border border-white/15 lg:block" /></div><div className="border-t border-white/20">{services.map(([Icon, name, text, when], index) => { const IconComponent = Icon as typeof Globe2; return <article key={name as string} className="group grid grid-cols-[36px_1fr_auto] gap-4 border-b border-white/20 py-5 sm:grid-cols-[46px_1fr_120px]"><div className="grid h-9 w-9 place-items-center border border-white/20 text-[#a6d6ce]"><IconComponent className="h-[18px] w-[18px]" /></div><div><h3 className="font-display text-xl font-bold tracking-[-0.035em]">{name as string}</h3><p className="mt-1 max-w-md text-sm leading-6 text-[#c8d9d4]">{text as string}</p></div><div className="self-start pt-2 text-right font-mono text-[9px] uppercase tracking-[0.13em] text-[#a6d6ce]">{when as string}<span className="mt-1 block text-white/40">/{String(index + 1).padStart(2, "0")}</span></div></article>})}</div></div></div></section>

        <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="grid gap-10 lg:grid-cols-[1fr_1fr]"><div className="border-t-4 border-[#202625] pt-6"><SectionLabel number="04">Расходы без смешения</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Две строки.<br />Два назначения.</h2><p className="mt-5 max-w-md text-[17px] leading-7 text-[#56605c]">Стоимость разработки и внешние платежи — разные вещи. Так клиент всегда видит, что именно оплачивает и кому.</p><div className="mt-9 grid gap-px bg-[#d6d0c5] sm:grid-cols-2"><div className="bg-[#fcfaf5] p-6"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#075c70]">Внешние сервисы</p><p className="mt-4 font-display text-xl font-bold tracking-[-0.04em]">Домен, размещение, база, почта, рекламный бюджет</p><p className="mt-4 text-sm text-[#65706b]">Оплачиваются вами напрямую выбранному сервису.</p></div><div className="bg-[#e5f0eb] p-6"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#075c70]">Работа исполнителя</p><p className="mt-4 font-display text-xl font-bold tracking-[-0.04em]">Структура, дизайн, настройка, запуск и сопровождение</p><p className="mt-4 text-sm text-[#49615c]">Фиксируются в предложении вместе с объёмом и сроком.</p></div></div></div><div className="border-t-4 border-[#075c70] pt-6"><SectionLabel number="05">Telegram поэтапно</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">От кнопки чата до автоматизации.</h2><div className="mt-7 space-y-0 border-t border-[#d6d0c5]"><div className="grid grid-cols-[42px_1fr] gap-5 border-b border-[#d6d0c5] py-5"><span className="font-mono text-xs text-[#075c70]">01</span><div><h3 className="font-bold">Кнопка Telegram</h3><p className="mt-1 text-sm leading-6 text-[#5d6763]">Посетитель сразу открывает диалог с компанией. Нужна только ссылка на существующий аккаунт или канал.</p></div></div><div className="grid grid-cols-[42px_1fr] gap-5 border-b border-[#d6d0c5] py-5"><span className="font-mono text-xs text-[#075c70]">02</span><div><h3 className="font-bold">Уведомления о заявках</h3><p className="mt-1 text-sm leading-6 text-[#5d6763]">Каждое обращение приходит в рабочий чат. Нужны аккаунт, группа команды и бот компании.</p></div></div><div className="grid grid-cols-[42px_1fr] gap-5 border-b border-[#d6d0c5] py-5"><span className="font-mono text-xs text-[#075c70]">03</span><div><h3 className="font-bold">Бот для клиентов</h3><p className="mt-1 text-sm leading-6 text-[#5d6763]">Ответы на частые вопросы, сбор контактов и маршрут к менеджеру — по согласованному сценарию.</p></div></div></div><p className="mt-5 border-l-2 border-[#a44837] pl-4 text-sm leading-6 text-[#6a514a]"><strong>Важно:</strong> секретный ключ бота хранится только в защищённых настройках, а не в коде или переписке.</p></div></div></section>

        <section className="border-y border-[#d6d0c5] bg-[#e7e3da]"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-2"><div className="p-6 sm:p-10 lg:border-r lg:border-[#d6d0c5] lg:p-14"><SectionLabel number="06">Поиск и аналитика</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.04] tracking-[-0.065em] sm:text-5xl">SEO — это не обещание первого места.</h2><p className="mt-6 max-w-lg leading-7 text-[#59615e]">Это системная работа, благодаря которой поисковая система правильно находит, читает и показывает сайт по релевантным запросам.</p><div className="mt-8 border-l-2 border-[#075c70] px-5"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#075c70]">Технический старт</p><p className="mt-2 text-sm leading-6">Метатеги, sitemap, robots, мобильная версия, скорость, Search Console, аналитика и проверка индексации.</p></div><div className="mt-6 border-l-2 border-[#8b988f] px-5"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#59615e]">Дальше по необходимости</p><p className="mt-2 text-sm leading-6">Локальная оптимизация, новые страницы и статьи, мониторинг запросов, технические улучшения и отчёт.</p></div></div><div className="bg-[#202625] p-6 text-[#f5f2ea] sm:p-10 lg:p-14"><SectionLabel number="07">Реклама</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.04] tracking-[-0.065em] sm:text-5xl">Рекламный кабинет — тоже ваш.</h2><p className="mt-6 max-w-lg leading-7 text-[#c7d0cb]">Карточка и бюджет принадлежат клиенту. Исполнитель получает доступ для настройки и ведения, но не личный пароль и не право собственности.</p><div className="mt-9 grid grid-cols-4 gap-3">{["Подготовка", "Запуск", "2–4 недели", "Ведение"].map((label, index) => <div key={label} className="border-t border-[#6d817b] pt-3"><span className="font-mono text-[10px] text-[#a6d6ce]">0{index + 1}</span><p className="mt-2 text-sm font-semibold leading-5">{label}</p></div>)}</div><p className="mt-9 border border-[#55716a] bg-[#1b3433] p-4 text-sm leading-6 text-[#c7d0cb]"><strong className="text-[#a6d6ce]">Прозрачно:</strong> цели рекламы подключаются до запуска — звонок, форма, Telegram, бронирование или покупка. Тогда оцениваем не клики, а обращения.</p></div></div></section>

        <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="flex flex-col justify-between gap-8 border-b border-[#cfc8bc] pb-9 lg:flex-row lg:items-end"><div><SectionLabel number="08">Пример сетки услуг</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.065em] sm:text-5xl">Объём, срок и цена —<br />в одном предложении.</h2></div><p className="max-w-sm text-sm leading-6 text-[#5e6864]">Цифры ниже — ориентир за работу. Фотографии, большой копирайтинг, переводы, платные плагины и рекламный бюджет указываются отдельно, если не включены в пакет.</p></div><div className="divide-y divide-[#cfc8bc]">{packages.map(([name, target, description, price], index) => <article key={name} className="group grid gap-4 py-6 transition-colors sm:grid-cols-[56px_1fr_1.3fr_auto] sm:items-center sm:gap-7"><span className="font-mono text-xs text-[#075c70]">0{index + 1}</span><div><h3 className="font-display text-2xl font-bold tracking-[-0.045em]">{name}</h3><p className="mt-1 text-xs text-[#69716e]">{target}</p></div><p className="text-sm leading-6 text-[#56605c]">{description}</p><p className="font-mono text-sm font-medium whitespace-nowrap text-[#075c70]">{price}</p></article>)}</div></section>

        <section id="process" className="relative border-y border-[#d6d0c5] bg-[#fcfaf5]"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.55fr_1.45fr]"><div className="border-b border-[#d6d0c5] p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12"><SectionLabel number="09">Порядок работы</SectionLabel><h2 className="mt-7 max-w-sm font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Передача — часть процесса, не финальная формальность.</h2><p className="mt-6 max-w-sm leading-7 text-[#59625e]">Двигаемся от брифа к независимому, документированному результату. Роль клиента и исполнителя обозначена на каждом шаге.</p><ArrowLink href="#brief" subtle>Собрать данные для старта</ArrowLink></div><div className="relative overflow-hidden p-6 sm:p-10 lg:p-12"><div className="route-line absolute bottom-0 left-[38px] top-0 w-px bg-[#b6d3ca] sm:left-[58px] lg:left-[68px]" />{steps.map(([num, title, text], index) => <article key={num} className="relative grid grid-cols-[44px_1fr] gap-5 pb-9 last:pb-0 sm:grid-cols-[62px_1fr] sm:gap-7"><div className="relative z-10 grid h-10 w-10 place-items-center border border-[#075c70] bg-[#fcfaf5] font-mono text-[11px] text-[#075c70]">{num}</div><div className="pt-1"><div className="flex flex-wrap items-baseline gap-x-4"><h3 className="font-display text-2xl font-bold tracking-[-0.04em]">{title}</h3><span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8a938f]">этап {index + 1} / 6</span></div><p className="mt-2 max-w-2xl text-sm leading-6 text-[#59625e]">{text}</p></div></article>)}</div></div></section>

        <section id="checklist" className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr]"><div><SectionLabel number="10">Перед запуском</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Проверьте передачу до публикации.</h2><p className="mt-6 max-w-md text-[17px] leading-7 text-[#59625e]">Этот список остаётся в вашем браузере. Отмечайте готовое и используйте его как финальную проверку контроля над проектом.</p><div className="mt-10 border border-[#cfc8bc] bg-[#e5f0eb] p-6"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#075c70]">Готовность запуска</p><p className="mt-3 font-display text-5xl font-extrabold tracking-[-0.07em] text-[#075c70]">{completeCount}<span className="text-2xl text-[#647a72]">/{checklistLabels.length}</span></p><div className="mt-4 h-2 overflow-hidden bg-[#bfd1ca]"><div className="h-full bg-[#075c70] transition-all duration-300" style={{ width: `${(completeCount / checklistLabels.length) * 100}%` }} /></div></div></div><div className="border-t border-[#cfc8bc]">{checklistLabels.map((label, index) => <label key={label} className="group flex cursor-pointer items-start gap-4 border-b border-[#cfc8bc] py-4"><input type="checkbox" checked={checked[index]} onChange={() => setChecked((current) => current.map((item, itemIndex) => itemIndex === index ? !item : item))} className="peer sr-only" /><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center border border-[#88948f] bg-[#f4f0e8] transition-all duration-200 peer-checked:border-[#075c70] peer-checked:bg-[#075c70]"><Check className="h-4 w-4 text-[#fcfaf5] opacity-0 transition-opacity peer-checked:opacity-100" /></span><span className="text-[15px] leading-6 text-[#47534f] transition-colors group-hover:text-[#075c70] peer-checked:text-[#7b8581] peer-checked:line-through">{label}</span></label>)}</div></div></section>

        <section className="relative overflow-hidden bg-[#075c70] text-[#f5f2ea]"><img src="/manus-storage/handover-checklist-art_07008bb9.png" alt="Абстрактный чек-лист передачи проекта" className="absolute right-0 top-0 hidden h-full w-[36%] object-cover opacity-70 mix-blend-screen lg:block" /><div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="max-w-3xl"><SectionLabel number="11">Финальный результат</SectionLabel><blockquote className="mt-8 font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.065em] sm:text-6xl">«Сайт принадлежит вам не тогда, когда он опубликован, а когда вы можете управлять каждым его ключевым элементом».</blockquote><p className="mt-8 max-w-2xl text-lg leading-8 text-[#c9dfd8]">В финальном акте или письме фиксируются: адрес сайта, дата запуска, сервисы, владелец домена, исходный код, база данных, интеграции, сроки оплаченных услуг и контакты для поддержки.</p></div></div></section>

        <section id="brief" className="bg-[#fcfaf5]"><div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.72fr_1.28fr]"><div className="border-b border-[#d6d0c5] p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12"><SectionLabel number="12">Бриф для старта</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Соберите главное в одном сообщении.</h2><p className="mt-6 max-w-sm leading-7 text-[#59625e]">Заполните поля, скопируйте готовый бриф и отправьте его удобным способом. Данные не отправляются с сайта и остаются на вашем устройстве.</p><div className="mt-9 flex items-center gap-3 text-sm text-[#49615c]"><ShieldCheck className="h-5 w-5 text-[#075c70]" /><span>Без аккаунта. Без пароля. Без передачи данных.</span></div></div><form className="p-6 sm:p-10 lg:p-12" onSubmit={(event) => { event.preventDefault(); void copyBrief(); }}><div className="grid gap-6 sm:grid-cols-2"><label className="block"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#66706d]">Имя / компания</span><input value={brief.name} onChange={(event) => setBrief({ ...brief, name: event.target.value })} className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none transition-colors focus:border-[#075c70]" placeholder="Например, Studio Forma" /></label><label className="block"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#66706d]">Чем занимается бизнес</span><input value={brief.business} onChange={(event) => setBrief({ ...brief, business: event.target.value })} className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none transition-colors focus:border-[#075c70]" placeholder="Услуги, ниша, формат" /></label><label className="block"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#66706d]">Контакты</span><input value={brief.contacts} onChange={(event) => setBrief({ ...brief, contacts: event.target.value })} className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none transition-colors focus:border-[#075c70]" placeholder="Телефон, e-mail, Telegram" /></label><label className="block"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#66706d]">География работы</span><input value={brief.geography} onChange={(event) => setBrief({ ...brief, geography: event.target.value })} className="mt-2 w-full border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none transition-colors focus:border-[#075c70]" placeholder="Город, регион, онлайн" /></label><label className="block sm:col-span-2"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#66706d]">Услуги и цены</span><textarea value={brief.services} onChange={(event) => setBrief({ ...brief, services: event.target.value })} className="mt-2 min-h-20 w-full resize-y border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none transition-colors focus:border-[#075c70]" placeholder="Что вы предлагаете и какие условия уже известны" /></label><label className="block sm:col-span-2"><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#66706d]">Дополнительная информация</span><textarea value={brief.note} onChange={(event) => setBrief({ ...brief, note: event.target.value })} className="mt-2 min-h-20 w-full resize-y border-b border-[#a9b0ab] bg-transparent px-0 py-3 text-lg outline-none transition-colors focus:border-[#075c70]" placeholder="Материалы, сроки, пожелания к сайту" /></label></div><div className="mt-9 flex flex-wrap items-center gap-5"><button type="submit" className="inline-flex items-center gap-3 bg-[#075c70] px-5 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-[#fcfaf5] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#064c5c] active:scale-[0.97]">{briefCopied ? <><CheckCircle2 className="h-4 w-4" /> Скопировано</> : <><Copy className="h-4 w-4" /> Скопировать бриф</>}</button><span className="text-sm text-[#66706d]">Затем вставьте текст в удобный чат или e-mail.</span></div></form></div></section>

        <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24 lg:px-12"><div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]"><div><SectionLabel number="13">Коротко о важном</SectionLabel><h2 className="mt-7 font-display text-4xl font-extrabold leading-[1.03] tracking-[-0.065em] sm:text-5xl">Вопросы, которые стоит задать до старта.</h2></div><div className="border-t border-[#cfc8bc]">{faqs.map(([question, answer], index) => <div key={question} className="border-b border-[#cfc8bc]"><button className="flex w-full items-center justify-between gap-5 py-5 text-left" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span className="font-display text-xl font-bold tracking-[-0.03em]">{question}</span><ChevronDown className={`h-5 w-5 shrink-0 text-[#075c70] transition-transform duration-200 ${openFaq === index ? "rotate-180" : ""}`} /></button>{openFaq === index && <p className="max-w-2xl pb-6 text-[15px] leading-7 text-[#59625e]">{answer}</p>}</div>)}</div></div></section>
      </main>

      <footer className="border-t border-[#d6d0c5] bg-[#202625] text-[#e8e9e3]"><div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12"><div className="grid gap-9 lg:grid-cols-[1.1fr_1.4fr_0.5fr]"><div><div className="flex items-center gap-3"><img src="/manus-storage/site-handover-mark_522aa1da.png" alt="" className="h-10 w-10" /><div className="font-display font-bold tracking-[-0.04em]">Сайт под ключ</div></div><p className="mt-5 max-w-sm text-sm leading-6 text-[#aeb7b1]">Путеводитель по запуску, подключению сервисов и независимой передаче цифрового проекта клиенту.</p></div><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#a6d6ce]">Источники для проверки</p><div className="mt-4 grid gap-x-7 gap-y-3 text-sm text-[#c8d0cb] sm:grid-cols-2"><a className="hover:text-[#a6d6ce]" href="https://developers.cloudflare.com/workers/platform/pricing/" target="_blank" rel="noreferrer">[1] Cloudflare Workers <ExternalLink className="ml-1 inline h-3 w-3" /></a><a className="hover:text-[#a6d6ce]" href="https://www.cloudflare.com/products/registrar/" target="_blank" rel="noreferrer">[2] Cloudflare Registrar <ExternalLink className="ml-1 inline h-3 w-3" /></a><a className="hover:text-[#a6d6ce]" href="https://supabase.com/pricing" target="_blank" rel="noreferrer">[3] Supabase Pricing <ExternalLink className="ml-1 inline h-3 w-3" /></a><a className="hover:text-[#a6d6ce]" href="https://business.google.com/us/google-ads/campaign-budget/" target="_blank" rel="noreferrer">[4] Google Ads <ExternalLink className="ml-1 inline h-3 w-3" /></a><a className="hover:text-[#a6d6ce]" href="https://core.telegram.org/bots/api" target="_blank" rel="noreferrer">[5] Telegram Bot API <ExternalLink className="ml-1 inline h-3 w-3" /></a><a className="hover:text-[#a6d6ce]" href="https://developers.google.com/search/docs/monitor-debug/search-console-start" target="_blank" rel="noreferrer">[6] Google Search Console <ExternalLink className="ml-1 inline h-3 w-3" /></a></div></div><div className="lg:text-right"><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#a6d6ce]">Принцип</p><p className="mt-3 text-sm leading-6 text-[#c8d0cb]">Все ключевые активы остаются у клиента.</p></div></div><div className="mt-10 flex flex-col justify-between gap-4 border-t border-[#4e5b57] pt-5 font-mono text-[9px] uppercase tracking-[0.13em] text-[#88948f] sm:flex-row"><span>Сайт под ключ / справочник клиента</span><span>© {new Date().getFullYear()} / контроль цифровых активов</span></div></div></footer>
    </div>
  );
}

