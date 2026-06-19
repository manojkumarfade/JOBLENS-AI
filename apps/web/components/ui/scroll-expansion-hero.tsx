"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollExpandMediaProps {
  mediaType?: "video" | "image";
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

export default function ScrollExpandMedia({
  mediaType = "image",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title = "JobLens AI Browser Copilot",
  date,
  scrollToExpand,
  textBlend,
  children
}: ScrollExpandMediaProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const width = useTransform(scrollYProgress, [0, 1], [isMobile ? 310 : 430, isMobile ? 620 : 1320]);
  const height = useTransform(scrollYProgress, [0, 1], [isMobile ? 390 : 430, isMobile ? 520 : 760]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);
  const contentOpacity = useTransform(scrollYProgress, [0.55, 0.8], [0, 1]);
  const titleShift = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 20 : 42]);
  const negativeTitleShift = useTransform(titleShift, (value) => -value);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [firstWord, ...rest] = title.split(" ");

  return (
    <div ref={sectionRef} className="relative min-h-[170vh] overflow-x-hidden">
      <section className="sticky top-0 flex min-h-[100dvh] items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ opacity: bgOpacity }}>
          <Image src={bgImageSrc} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] dark:bg-black/35" />
        </motion.div>
        <motion.div
          className="relative z-10 overflow-hidden rounded-2xl border bg-card shadow-2xl"
          style={{ width, height, maxWidth: "94vw", maxHeight: "84vh" }}
        >
          {mediaType === "video" ? (
            <video src={mediaSrc} poster={posterSrc} autoPlay muted loop playsInline className="h-full w-full object-cover" />
          ) : (
            <Image src={mediaSrc} alt={title} width={1600} height={900} priority className="h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/25" />
        </motion.div>
        <div className={`pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center text-center ${textBlend ? "mix-blend-difference" : ""}`}>
          {date ? <motion.p style={{ x: titleShift }} className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-white/80">{date}</motion.p> : null}
          <motion.h1 style={{ x: negativeTitleShift }} className="text-5xl font-semibold text-white drop-shadow-xl md:text-7xl">
            {firstWord}
          </motion.h1>
          <motion.h1 style={{ x: titleShift }} className="text-5xl font-semibold text-white drop-shadow-xl md:text-7xl">
            {rest.join(" ")}
          </motion.h1>
          {scrollToExpand ? <p className="mt-6 rounded-full border border-white/25 bg-black/25 px-4 py-2 text-sm text-white backdrop-blur">{scrollToExpand}</p> : null}
        </div>
      </section>
      <motion.section style={{ opacity: contentOpacity }} className="relative z-30 mx-auto max-w-6xl px-4 pb-20">
        {children}
      </motion.section>
    </div>
  );
}
