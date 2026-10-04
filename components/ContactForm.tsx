"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import ThinkingOrb, { type OrbState } from "@/components/ThinkingOrb";

const field =
  "mt-1 w-full border-0 border-b border-ink/30 bg-transparent px-0 py-2.5 text-[1.0625rem] text-ink placeholder:text-steel/80 transition-colors duration-200 hover:border-ink/60 focus:border-ink focus:outline-none focus:ring-0";

const errorClass = "mt-1.5 block text-[0.9rem] font-medium text-ink underline decoration-ink/40";

const STATUS: Record<OrbState, string> = {
  idle: "Ready when you are",
  typing: "Reading along…",
  thinking: "Sending…",
  done: "Message received",
};

export default function ContactForm() {
  const [state, handleSubmit] = useForm("xoqzrlko");
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onInput = () => {
    setTyping(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTyping(false), 1400);
  };

  const orbState: OrbState = state.succeeded
    ? "done"
    : state.submitting
      ? "thinking"
      : typing
        ? "typing"
        : "idle";

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="-ml-6 h-36 w-36 shrink-0 sm:h-44 sm:w-44">
          <ThinkingOrb state={orbState} />
        </div>
        <p role="status" aria-live="polite" className="text-[0.95rem] text-steel">
          {STATUS[orbState]}
        </p>
      </div>

      {state.succeeded ? (
        <p className="font-display text-[1.75rem] font-medium leading-snug">
          Message sent. I&rsquo;ll get back to you at the email you gave.
        </p>
      ) : (
        <form onSubmit={handleSubmit} onInput={onInput} className="space-y-8">
          <input type="hidden" name="_subject" value="New message from basseyduke.io" />
          <div className="grid gap-8 sm:grid-cols-2">
            <label className="block">
              <span className="text-[0.9rem] text-steel">Name</span>
              <input name="name" type="text" autoComplete="name" required placeholder="Your name…" className={field} />
              <ValidationError prefix="Name" field="name" errors={state.errors} className={errorClass} />
            </label>
            <label className="block">
              <span className="text-[0.9rem] text-steel">Email</span>
              <input
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                required
                placeholder="you@company.com"
                className={field}
              />
              <ValidationError prefix="Email" field="email" errors={state.errors} className={errorClass} />
            </label>
          </div>
          <label className="block">
            <span className="text-[0.9rem] text-steel">Message</span>
            <textarea
              name="message"
              rows={5}
              required
              placeholder="What’s on your mind…"
              className={`${field} resize-y`}
            />
            <ValidationError prefix="Message" field="message" errors={state.errors} className={errorClass} />
          </label>
          <div aria-live="polite">
            <ValidationError errors={state.errors} className={errorClass} />
          </div>
          <button
            type="submit"
            disabled={state.submitting}
            className="bg-ink px-7 py-3.5 text-[1rem] font-medium text-paper transition-colors duration-200 hover:bg-steel disabled:cursor-wait disabled:opacity-70"
          >
            {state.submitting ? "Sending…" : "Send message"}
          </button>
        </form>
      )}
    </div>
  );
}
