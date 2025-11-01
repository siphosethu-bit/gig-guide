// src/components/TicketModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import {
  X, CheckCircle2, Scissors, Download, Copy, Send, Wallet, Ticket, Smartphone,
  CreditCard, Receipt, Clock, MapPin, User, Pizza, Car
} from "lucide-react";
import { makeCreditId, makeTicketMessage } from "../lib/ticketkit";

export default function TicketModal({ open, onClose, event, ticketPrice = 120 }) {
  if (!open) return null;
  return <TicketFlow onClose={onClose} event={event} ticketPrice={ticketPrice} />;
}

/* ----------------------------- TICKET FLOW ------------------------------ */
function TicketFlow({ onClose, event, ticketPrice }) {
  const [step, setStep] = useState("form"); // form | paid
  const [details, setDetails] = useState({
    first: "",
    last: "",
    phone: "",
    uber: 0,
    credit: 0,
  });
  const [totals, setTotals] = useState(ticketPrice);
  const [qrPng, setQrPng] = useState("");
  const [qrPayload, setQrPayload] = useState(null);
  const [creditId, setCreditId] = useState("");

  useEffect(() => {
    const t = ticketPrice + (Number(details.uber) || 0) + (Number(details.credit) || 0);
    setTotals(t);
  }, [details, ticketPrice]);

  async function pay() {
    const credit = Number(details.credit) || 0;
    const uber = Number(details.uber) || 0;
    const payload = {
      v: 1,
      type: "GG_TICKET",
      eventId: event.id,
      eventName: event.name,
      venue: event.venue,
      city: event.city,
      start: event.start,
      name: `${details.first} ${details.last}`.trim(),
      phone: details.phone,
      credit,
      uber,
      total: totals,
      creditId: credit > 0 ? makeCreditId() : null,
      issuedAt: new Date().toISOString(),
    };
    setCreditId(payload.creditId || "");
    setQrPayload(payload);

    const png = await QRCode.toDataURL(JSON.stringify(payload), {
      errorCorrectionLevel: "M",
      margin: 1,
      scale: 6,
      color: { dark: "#000000", light: "#ffffff" },
    });
    setQrPng(png);
    setStep("paid");
  }

  return (
    <div className="fixed inset-0 z-[75] bg-black/70 backdrop-blur flex">
      <div className="relative w-full max-w-3xl mx-auto my-6 px-4">
        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-3xl border border-white/10 bg-black/60 shadow-2xl overflow-hidden max-h-[86vh] flex flex-col"
            >
              {/* Sticky header with close */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-2xl bg-white text-black grid place-items-center">
                    <Ticket />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold">Get your ticket</div>
                    <div className="text-xs text-slate-300">From R{ticketPrice}</div>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-auto">
                <div className="grid md:grid-cols-2 gap-6 p-6">
                  <Field
                    label="Name"
                    icon={<User className="h-4 w-4" />}
                    value={details.first}
                    onChange={(v) => setDetails((d) => ({ ...d, first: v }))}
                    placeholder="Karabo"
                  />
                  <Field
                    label="Surname"
                    value={details.last}
                    onChange={(v) => setDetails((d) => ({ ...d, last: v }))}
                    placeholder="M"
                  />
                  <Field
                    label="Phone (for WhatsApp)"
                    icon={<Smartphone className="h-4 w-4" />}
                    value={details.phone}
                    onChange={(v) => setDetails((d) => ({ ...d, phone: v }))}
                    placeholder="e.g., 27..."
                  />

                  <Field
                    label="Add Uber (round trip)"
                    icon={<Car className="h-4 w-4" />}
                    type="number"
                    value={details.uber}
                    onChange={(v) => setDetails((d) => ({ ...d, uber: v }))}
                    placeholder="0"
                  />
                  <Field
                    label="Add club credit (food/drinks)"
                    icon={<Pizza className="h-4 w-4" />}
                    type="number"
                    value={details.credit}
                    onChange={(v) => setDetails((d) => ({ ...d, credit: v }))}
                    placeholder="0"
                  />

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <Row icon={<MapPin className="h-4 w-4" />} label="Venue" value={`${event.venue} • ${event.city}`} />
                      <Row icon={<Clock className="h-4 w-4" />} label="Start" value={new Date(event.start).toLocaleString()} />
                      <Row icon={<Receipt className="h-4 w-4" />} label="Ticket price" value={`R${ticketPrice}`} />
                      <Row icon={<Wallet className="h-4 w-4" />} label="Add-ons" value={`Uber R${Number(details.uber)||0} • Credit R${Number(details.credit)||0}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer (sticks to bottom of panel) */}
              <div className="flex items-center justify-between p-6 border-t border-white/10">
                <div className="text-lg">
                  <span className="text-slate-300">Total</span>{" "}
                  <span className="font-extrabold">R{totals.toLocaleString()}</span>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 text-black px-5 py-3 font-semibold hover:scale-[1.02] transition"
                  onClick={pay}
                >
                  <CreditCard className="h-5 w-5" />
                  Pay (simulated)
                </button>
              </div>
            </motion.div>
          ) : (
            <PaidView
              key="paid"
              onClose={onClose}
              event={event}
              details={details}
              totals={totals}
              qrPng={qrPng}
              qrPayload={qrPayload}
              creditId={creditId}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ----------------------------- PAID VIEW -------------------------------- */
function PaidView({ onClose, event, details, totals, qrPng, qrPayload, creditId }) {
  const [torn, setTorn] = useState(false);

  const fullName = `${details.first} ${details.last}`.trim();
  const message = useMemo(
    () => makeTicketMessage({ event, totals, details, creditId }),
    [event, totals, details, creditId]
  );

  function tear() {
    setTorn(true);
  }

  async function savePng() {
    const a = document.createElement("a");
    a.href = qrPng;
    a.download = `${event.name.replace(/\s+/g, "_")}_ticket.png`;
    a.click();
  }

  function copyMessage() {
    navigator.clipboard.writeText(message).catch(() => {});
  }

  function openWhatsApp() {
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-3xl border border-white/10 bg-black/60 shadow-2xl overflow-hidden max-h-[86vh] flex flex-col"
    >
      {/* Sticky header with close */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-white text-black grid place-items-center">
            <CheckCircle2 className="text-emerald-500" />
          </div>
          <div>
            <div className="text-xl font-extrabold">Payment successful</div>
            <div className="text-xs text-slate-300">Ticket approved</div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
          <X className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="overflow-auto">
        <div className="p-6 grid lg:grid-cols-[1fr,1fr] gap-6">
          {/* Left stub */}
          <motion.div
            className={`ticket-stub rounded-2xl border border-white/10 bg-white/5 p-4 relative overflow-hidden ${torn ? "ticket-fly" : ""}`}
            animate={torn ? { x: -240, opacity: 0, rotate: -12 } : { x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <div className="text-sm text-slate-300">Admit One</div>
            <div className="text-xl font-bold">{event.name}</div>
            <div className="text-slate-300 text-sm mt-1">
              {event.venue} • {event.city}
            </div>
            <div className="text-slate-300 text-sm">
              {new Date(event.start).toLocaleString()}
            </div>

            <div className="mt-4 text-sm text-slate-300">
              Buyer: <b>{fullName || "—"}</b>
            </div>
            <div className="mt-2 text-sm text-slate-300">
              Total paid: <b>R{totals.toLocaleString()}</b>
            </div>

            {creditId && (
              <div className="mt-2 text-sm">
                Club credit: <b className="text-amber-300">R{Number(details.credit).toLocaleString()}</b> <br />
                Credit ID: <b className="tracking-widest">{creditId}</b>
              </div>
            )}

            <div className="perforation mt-5" />
            <div className="text-xs text-slate-400 mt-2">
              Drag the <Scissors className="inline h-4 w-4" /> scissors area to <b>tear</b> the ticket.
            </div>
          </motion.div>

          {/* Right main ticket with QR */}
          <motion.div
            className="rounded-2xl border border-white/10 bg-white/5 p-4 relative overflow-hidden"
            animate={torn ? { scale: 1.02 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <div className="text-sm text-slate-300">Your QR Ticket</div>
            <div className="mt-1 text-xl font-extrabold">{event.name}</div>
            <div className="text-slate-300 text-sm">{event.venue} • {event.city}</div>

            <div className="mt-4 grid grid-cols-[minmax(160px,220px),1fr] gap-4 items-center">
              <img
                src={qrPng}
                alt="Ticket QR"
                className="rounded-lg bg-white p-2 shadow w-full h-auto"
              />
              <div className="space-y-1 text-sm">
                <Row label="When" value={new Date(event.start).toLocaleString()} />
                <Row label="Name" value={fullName || "—"} />
                <Row label="Phone" value={details.phone || "—"} />
                {creditId ? <Row label="Credit ID" value={creditId} /> : null}
                <Row label="Total paid" value={`R${totals.toLocaleString()}`} />
              </div>
            </div>

            <div className="perforation mt-5" />

            {/* Tear control */}
            {!torn && (
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 220 }}
                dragElastic={0.08}
                onDragEnd={(e, info) => {
                  if (info.point.x > 160) tear();
                }}
                className="mt-3 mx-auto w-[260px] h-12 rounded-full bg-black/30 border border-white/10 grid place-items-center cursor-ew-resize"
                title="Slide to tear"
              >
                <div className="inline-flex items-center gap-2 text-slate-200 text-sm">
                  <Scissors className="h-4 w-4" /> Slide to tear
                </div>
              </motion.div>
            )}

            {/* Actions after tear */}
            {torn && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Action onClick={savePng} icon={<Download className="h-4 w-4" />}>
                  Save ticket (PNG)
                </Action>
                <Action onClick={copyMessage} icon={<Copy className="h-4 w-4" />}>
                  Copy WhatsApp message
                </Action>
                <Action onClick={openWhatsApp} icon={<Send className="h-4 w-4" />}>
                  Send to WhatsApp
                </Action>
                <Action onClick={onClose} icon={<Ticket className="h-4 w-4" />}>
                  Done
                </Action>
              </div>
            )}
          </motion.div>
        </div>

        {/* Summary bubble */}
        <div className="px-6 pb-6">
          <div className="rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-slate-300">
            Show your <b>QR Ticket</b> at the entrance. If you added club credit, present your
            <b> Credit ID</b> at the bar. You can save the PNG or send it to WhatsApp now.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------- SMALL PIECES -------------------------------- */
function Field({ label, icon, type = "text", value, onChange, placeholder }) {
  return (
    <label className="block">
      <div className="text-xs text-slate-300 mb-1">{label}</div>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3">
        {icon ? <span className="text-slate-300">{icon}</span> : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          className="w-full bg-transparent py-2 outline-none"
        />
      </div>
    </label>
  );
}
function Row({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2">
      {icon ? icon : null}
      <div className="text-slate-400 w-28">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
function Action({ onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 hover:bg-white/10 text-sm"
    >
      {icon}
      {children}
    </button>
  );
}
