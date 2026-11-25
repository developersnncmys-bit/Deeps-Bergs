"use client";

import { useEffect, useState } from "react";

export function LoopingTypewriter({
  text,
  typeSpeed = 60,
  eraseSpeed = 30,
  holdAfterTypeMs = 1800,
  holdAfterEraseMs = 500,
  caretClassName = "ml-0.5 inline-block h-[0.85em] w-[2px] translate-y-[0.08em] animate-pulse bg-current align-middle",
}: {
  text: string;
  typeSpeed?: number;
  eraseSpeed?: number;
  holdAfterTypeMs?: number;
  holdAfterEraseMs?: number;
  caretClassName?: string;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => window.setTimeout(resolve, ms));

    const run = async () => {
      while (!cancelled) {
        for (let i = 1; i <= text.length; i++) {
          if (cancelled) return;
          setShown(text.slice(0, i));
          await wait(typeSpeed);
        }
        await wait(holdAfterTypeMs);
        if (cancelled) return;
        for (let i = text.length - 1; i >= 0; i--) {
          if (cancelled) return;
          setShown(text.slice(0, i));
          await wait(eraseSpeed);
        }
        await wait(holdAfterEraseMs);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [text, typeSpeed, eraseSpeed, holdAfterTypeMs, holdAfterEraseMs]);

  return (
    <>
      {shown}
      <span aria-hidden className={caretClassName} />
    </>
  );
}
