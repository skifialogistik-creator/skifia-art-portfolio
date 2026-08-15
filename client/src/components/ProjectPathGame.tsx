/*
 * Compact in-page mini-game. The route makes project delivery tangible: each
 * checkpoint is a useful action, and the final reward is a client-owned access pack.
 */
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Flag, LockKeyhole, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";

const checkpoints = [
  { label: "Бриф", tag: "Цель", title: "Соберите опору", description: "Фиксируем задачу, аудиторию, материалы и результат, к которому должен привести сайт.", reward: "Паспорт проекта" },
  { label: "Аккаунты", tag: "Владение", title: "Оформите доступы", description: "Домен и сервисы регистрируются на рабочую почту клиента. Исполнитель получает роль, а не пароль.", reward: "Ключи у клиента" },
  { label: "Структура", tag: "Навигация", title: "Соберите маршрут", description: "Определяем страницы, логику первого экрана и путь от интереса посетителя к заявке.", reward: "Карта сайта" },
  { label: "Дизайн", tag: "Образ", title: "Настройте характер", description: "Согласуем визуальный язык, цвета и подачу — до того, как разворачивать все страницы.", reward: "Визуальный код" },
  { label: "Запуск", tag: "Проверка", title: "Проверьте контур", description: "Подключаем домен, HTTPS, формы, аналитику и тестируем все важные сценарии до публикации.", reward: "Готово к запуску" },
  { label: "Передача", tag: "Контроль", title: "Заберите проект", description: "Передаём код, доступы, список сервисов и инструкцию — теперь проект можно развивать независимо.", reward: "Пакет владельца" },
] as const;

export default function ProjectPathGame() {
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState(0);
  const reduceMotion = useReducedMotion();
  const complete = progress === checkpoints.length;
  const current = checkpoints[Math.min(selected, checkpoints.length - 1)];

  const selectCheckpoint = (index: number) => {
    if (index > progress) return;
    setSelected(index);
    if (index === progress) setProgress((value) => Math.min(value + 1, checkpoints.length));
  };

  const reset = () => { setProgress(0); setSelected(0); };

  return (
    <section id="route-game" className="relative overflow-hidden border-y border-[#d6d0c5] bg-[#e5f0eb]">
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(#7ea9a0_0.6px,transparent_0.6px)] [background-size:7px_7px]" />
      <div className="relative mx-auto grid max-w-[1440px] lg:grid-cols-[0.72fr_1.28fr]">
        <div className="border-b border-[#b9cec7] p-6 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
          <div className="flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#075c70]"><span className="grid h-6 w-6 place-items-center border border-[#075c70] bg-[#075c70] text-[9px] text-white">10</span><span>Карта контроля</span></div>
          <h2 className="mt-7 max-w-md font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.065em] sm:text-5xl">Пройдите маршрут проекта.</h2>
          <p className="mt-6 max-w-md text-[17px] leading-7 text-[#4c635d]">Это небольшая карта-игра: нажимайте на доступный этап, чтобы открыть следующий и собрать свой пакет контроля.</p>
          <div className="mt-9 border-l-2 border-[#075c70] bg-[#f6fbf8]/80 px-4 py-4 text-sm leading-6 text-[#34534a]"><Sparkles className="mr-2 inline h-4 w-4 text-[#075c70]" />Порядок можно пересмотреть, но доступы и права владельца должны остаться у клиента на каждом шаге.</div>
          <div className="mt-9 flex items-end justify-between border-t border-[#b9cec7] pt-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#617b73]">Собрано</p><p className="mt-2 font-display text-4xl font-extrabold tracking-[-0.07em] text-[#075c70]">{progress}<span className="text-xl text-[#789189]">/{checkpoints.length}</span></p></div>{progress > 0 && <button type="button" onClick={reset} className="inline-flex items-center gap-2 border-b border-[#789189] pb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#46655c] transition-colors hover:border-[#075c70] hover:text-[#075c70]"><RotateCcw className="h-3.5 w-3.5" /> Начать заново</button>}</div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4" role="list" aria-label="Этапы работы над сайтом">
            <div className="absolute left-[15%] right-[15%] top-[23px] hidden h-px bg-[#9fbbb2] sm:block" />
            {checkpoints.map((checkpoint, index) => {
              const state = index < progress ? "done" : index === progress ? "current" : "locked";
              const available = state !== "locked";
              const selectedState = selected === index;
              return <motion.button key={checkpoint.label} type="button" role="listitem" aria-pressed={selectedState} aria-label={`${checkpoint.label}: ${state === "done" ? "пройден" : state === "current" ? "доступен" : "закрыт"}`} onClick={() => selectCheckpoint(index)} disabled={!available} initial={reduceMotion ? false : { opacity: 0, y: 14 }} whileHover={available && !reduceMotion ? { y: -4 } : undefined} whileTap={available && !reduceMotion ? { scale: 0.98 } : undefined} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }} className={`relative z-10 min-h-[138px] border p-4 text-left transition-colors duration-200 ${state === "done" ? "border-[#075c70] bg-[#075c70] text-white" : state === "current" ? "border-[#075c70] bg-[#f8fffc] text-[#1f3731] shadow-[6px_7px_0_rgba(7,92,112,.18)]" : "cursor-not-allowed border-[#c1d0ca] bg-[#edf3f0] text-[#8ca39a]"}`}>
                <span className={`grid h-8 w-8 place-items-center border font-mono text-[10px] ${state === "done" ? "border-[#b6ede5] bg-[#0e737e]" : state === "current" ? "border-[#075c70] text-[#075c70]" : "border-[#aebeb7]"}`}>{state === "done" ? <Check className="h-4 w-4" /> : state === "locked" ? <LockKeyhole className="h-3.5 w-3.5" /> : String(index + 1).padStart(2, "0")}</span>
                <span className="mt-6 block font-display text-xl font-bold tracking-[-0.04em]">{checkpoint.label}</span><span className={`mt-2 block font-mono text-[9px] uppercase tracking-[0.14em] ${state === "done" ? "text-[#b6ede5]" : "text-[#6f8980]"}`}>{state === "done" ? checkpoint.reward : state === "current" ? "Нажмите, чтобы открыть" : "Следующий этап"}</span>
              </motion.button>;
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`${selected}-${progress}`} initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.24 }} className="mt-8 border border-[#9abbb0] bg-[#f9fcfa] p-5 sm:p-6">
              {complete ? <div className="grid gap-5 sm:grid-cols-[auto_1fr]"><div className="grid h-12 w-12 place-items-center bg-[#075c70] text-white"><Flag className="h-6 w-6" /></div><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#075c70]">Маршрут завершён</p><h3 className="mt-2 font-display text-2xl font-bold tracking-[-0.045em]">Пакет владельца собран.</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#536a62]">Ваша карта пройдена: в финале у клиента остаются доступы, исходный код и понятная инструкция по дальнейшему управлению.</p></div></div> : <div className="grid gap-5 sm:grid-cols-[auto_1fr]"><div className="grid h-12 w-12 place-items-center bg-[#075c70] font-mono text-xs text-white">{String(selected + 1).padStart(2, "0")}</div><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#075c70]">{current.tag}</p><h3 className="mt-2 font-display text-2xl font-bold tracking-[-0.045em]">{current.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#536a62]">{current.description}</p><p className="mt-4 inline-flex items-center gap-2 border-t border-[#b6cec5] pt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#075c70]"><Check className="h-3.5 w-3.5" /> Подтверждение: {current.reward}</p></div></div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
