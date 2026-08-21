import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import type { SiteContent } from "@shared/siteContent";
import { CheckCircle2, Loader2, Send, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type SiteInquiryDialogProps = {
  work: SiteContent["projects"][number];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SiteInquiryDialog({ work, open, onOpenChange }: SiteInquiryDialogProps) {
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [publicId, setPublicId] = useState<string | null>(null);
  const mutation = trpc.siteInquiries.submit.useMutation();

  useEffect(() => {
    if (!open) {
      setFullName("");
      setContact("");
      setComment("");
      setConsent(false);
      setError("");
      setPublicId(null);
    }
  }, [open, work.number]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (fullName.trim().length < 2 || contact.trim().length < 5 || !consent) {
      setError("Укажите имя, контакт и подтвердите согласие на обработку заявки.");
      return;
    }

    setError("");
    try {
      const result = await mutation.mutateAsync({ siteNumber: work.number, fullName, contact, comment, consent: true });
      setPublicId(result.publicId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[calc(100svh-2rem)] max-w-lg overflow-y-auto border-white/15 bg-[#121015] p-5 text-white sm:p-7"><DialogHeader><p className="font-mono text-[10px] font-semibold uppercase tracking-[.16em] text-[#c9ff9f]">готовый сайт / {work.number}</p><DialogTitle className="mt-2 font-display text-3xl font-semibold tracking-[-.07em] text-white">Заявка на {work.name}</DialogTitle><DialogDescription className="text-[#b8afc5]">Оставьте контакты — я свяжусь с вами по поводу этого сайта и расскажу о следующем шаге.</DialogDescription></DialogHeader>{publicId ? <div className="mt-4 rounded-2xl border border-[#b7f58d]/35 bg-[#21331f] p-5"><CheckCircle2 className="h-9 w-9 text-[#c9ff9f]" /><p className="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#c9ff9f]">Заявка принята</p><p className="mt-2 text-sm leading-6 text-[#e6f3dc]">Спасибо! Заявка на сайт «{work.name}» сохранена. Я отвечу по указанному контакту.</p><p className="mt-5 font-mono text-xs tracking-[.1em] text-white">{publicId}</p><button type="button" onClick={() => onOpenChange(false)} className="mt-6 rounded-full border border-white/25 px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-white transition hover:border-white">Закрыть</button></div> : <form onSubmit={(event) => void submit(event)} className="mt-4 grid gap-5"><div className="rounded-2xl border border-white/10 bg-[#1a1720] p-4"><p className="font-mono text-[9px] uppercase tracking-[.14em] text-[#a99ab9]">Вы выбрали</p><div className="mt-2 flex items-end justify-between gap-3"><p className="font-display text-2xl font-semibold tracking-[-.06em] text-white">{work.name}</p><p className="font-mono text-xs font-semibold text-[#c9ff9f]">{work.price}</p></div></div><label className="block"><span className="font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#c9b9d9]">Ваше имя <b className="text-[#ff9ed7]">*</b></span><input autoFocus value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Как к вам обращаться" className="mt-2 w-full rounded-xl border border-white/10 bg-[#19161e] px-3 py-3 text-sm text-white outline-none transition placeholder:text-[#786e83] focus:border-[#c28dff] focus:ring-2 focus:ring-[#b98cff]/20" /></label><label className="block"><span className="font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#c9b9d9]">Telegram, телефон или e-mail <b className="text-[#ff9ed7]">*</b></span><input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="@username, +48… или name@email.com" className="mt-2 w-full rounded-xl border border-white/10 bg-[#19161e] px-3 py-3 text-sm text-white outline-none transition placeholder:text-[#786e83] focus:border-[#c28dff] focus:ring-2 focus:ring-[#b98cff]/20" /></label><label className="block"><span className="font-mono text-[10px] font-semibold uppercase tracking-[.14em] text-[#c9b9d9]">Комментарий</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} placeholder="Например: хочу узнать сроки передачи и можно ли изменить тексты" className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#19161e] px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-[#786e83] focus:border-[#c28dff] focus:ring-2 focus:ring-[#b98cff]/20" /></label><label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[#17141d] p-3"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#c28dff]" /><span className="text-xs leading-5 text-[#c7bfce]"><ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-[#c9ff9f]" />Согласен(на) на сохранение контакта, чтобы получить ответ по этой заявке.</span></label>{error && <p role="alert" className="rounded-xl border border-[#ff6a9e]/35 bg-[#45182f] px-3 py-2.5 text-sm leading-5 text-[#ffd6e5]">{error}</p>}<button type="submit" disabled={mutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c28dff] px-5 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[.13em] text-[#170d23] transition hover:brightness-110 active:scale-[.97] disabled:opacity-60">{mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Отправляем</> : <><Send className="h-4 w-4" />Оставить заявку</>}</button></form>}</DialogContent></Dialog>;
}
