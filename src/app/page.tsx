"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Shooting stars background ──────────────────────────────────────────────
function Stars() {
  const [stars, setStars] = useState<{ x: number; y: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    const s = Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      size: Math.random() * 2 + 1,
    }));
    setStars(s);
  }, []);

  return (
    <>
      {stars.map((s, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
      {/* Periodic shooting stars */}
      <div className="shooting-star" style={{ top: "15%", animationDelay: "0s" }} />
      <div className="shooting-star" style={{ top: "35%", animationDelay: "4s" }} />
      <div className="shooting-star" style={{ top: "60%", animationDelay: "7s" }} />
      <div className="shooting-star" style={{ top: "80%", animationDelay: "11s" }} />
    </>
  );
}

// ─── Custom cursor with trail ───────────────────────────────────────────────
function CursorTrail() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const pos = useRef({ x: 0, y: 0 });
  const trailPositions = useRef<{ x: number; y: number }[]>(
    Array.from({ length: 20 }, () => ({ x: 0, y: 0 }))
  );

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMove);

    const colors = [
      "#FF69B4", "#FF69B4", "#FF5AA0", "#E050A0",
      "#C040B0", "#A030C0", "#8020D0", "#6010E0",
      "#4000FF", "#2000EE", "#00D4FF", "#00D4FF",
      "#00C4EE", "#00B4DD", "#00A4CC", "#0094BB",
      "#0084AA", "#007499", "#006488", "#005477",
    ];

    let raf: number;
    const animate = () => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${pos.current.x - 4}px`;
        cursorRef.current.style.top = `${pos.current.y - 4}px`;
      }

      // Update trail positions (each follows the one before it)
      trailPositions.current[0] = { ...pos.current };
      for (let i = trailPositions.current.length - 1; i > 0; i--) {
        const prev = trailPositions.current[i - 1];
        const curr = trailPositions.current[i];
        curr.x += (prev.x - curr.x) * 0.35;
        curr.y += (prev.y - curr.y) * 0.35;
      }

      trailsRef.current.forEach((el, i) => {
        if (el) {
          const p = trailPositions.current[i];
          const size = Math.max(1, 4 - i * 0.15);
          const opacity = 1 - i / trailPositions.current.length;
          el.style.left = `${p.x - size / 2}px`;
          el.style.top = `${p.y - size / 2}px`;
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
          el.style.opacity = `${opacity * 0.7}`;
          el.style.background = colors[i] || colors[colors.length - 1];
          el.style.boxShadow = `0 0 ${4 + i}px ${colors[i] || colors[colors.length - 1]}`;
        }
      });

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor" />
      {trailPositions.current.map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) trailsRef.current[i] = el; }}
          className="cursor-trail"
        />
      ))}
    </>
  );
}

// ─── ASCII Art Banner ───────────────────────────────────────────────────────
function ASCIIBanner() {
  const glow = "0 0 10px rgba(255,105,180,0.6), 0 0 30px rgba(255,105,180,0.3), 0 0 60px rgba(255,105,180,0.15)";
  const blueGlow = "0 0 10px rgba(0,212,255,0.6), 0 0 30px rgba(0,212,255,0.3)";

  const logo = `
 ██╗      ████████╗  ██████╗
 ██║     ██╔═║══██║ ██╔════╝
 ██║     ██║ ║  ██║ ██║  ███╗
 ██║     ██║ ║  ██║ ██║   ██║
 ███████╗╚██║║██╔═╝ ╚██████╔╝
 ╚══════╝ ╚═╝╚═╝    ╚═════╝

  ██████╗ ███████╗███████╗
 ██╔═══██╗██╔════╝██╔════╝
 ██║   ██║█████╗  █████╗
 ██║   ██║██╔══╝  ██╔══╝
 ╚██████╔╝██║     ██║
  ╚═════╝ ╚═╝     ╚═╝`.trimEnd();

  const wlo = `
 ██╗    ██╗██╗████████╗██╗  ██╗    ██╗      ██████╗
 ██║    ██║██║╚══██╔══╝██║  ██║    ██║     ██╔═══██╗
 ██║ █╗ ██║██║   ██║   ███████║    ██║     ██║   ██║
 ██║███╗██║██║   ██║   ██╔══██║    ██║     ██║   ██║
 ╚███╔███╔╝██║   ██║   ██║  ██║    ███████╗╚██████╔╝
  ╚══╝╚══╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝    ╚══════╝ ╚═════╝`.trimEnd();

  return (
    <div className="animate-fade-in-up select-none text-center">
      {/* Stars above */}
      <pre className="text-[8px] sm:text-[10px] md:text-xs leading-tight mx-auto mb-1"
        style={{ color: "#FF69B4", textShadow: glow, fontFamily: "'JetBrains Mono', monospace" }}>
{`   ·  . ★  ·    ✦   ·  .  ·    ★   .  ✦  ·
 .    ·    . ★    ·  .  ✦   ·    .  ★   ·   .`}
      </pre>

      {/* Main box */}
      <div className="inline-block relative">
        <pre className="text-[8px] sm:text-[10px] md:text-xs leading-tight"
          style={{ color: "#FF69B4", textShadow: glow, fontFamily: "'JetBrains Mono', monospace" }}>
{`╔════════════════════════════════════╗`}
        </pre>

        {/* LOG */}
        <pre className="text-[7px] sm:text-[9px] md:text-[11px] leading-[1.15]"
          style={{ color: "#FF69B4", textShadow: glow, fontFamily: "'JetBrains Mono', monospace" }}>
{logo}
        </pre>

        <pre className="text-[8px] sm:text-[10px] md:text-xs leading-tight"
          style={{ color: "#FF69B4", textShadow: glow, fontFamily: "'JetBrains Mono', monospace" }}>
{`╠════════════════════════════════════╣`}
        </pre>

        {/* w/ Lo */}
        <pre className="text-[6px] sm:text-[8px] md:text-[10px] leading-[1.15] mt-1 mb-1"
          style={{ color: "#00D4FF", textShadow: blueGlow, fontFamily: "'JetBrains Mono', monospace" }}>
{wlo}
        </pre>

        <pre className="text-[8px] sm:text-[10px] md:text-xs leading-tight"
          style={{ color: "#FF69B4", textShadow: glow, fontFamily: "'JetBrains Mono', monospace" }}>
{`╚════════════════════════════════════╝`}
        </pre>
      </div>

      {/* Stars below */}
      <pre className="text-[8px] sm:text-[10px] md:text-xs leading-tight mx-auto mt-1"
        style={{ color: "#FF69B4", textShadow: glow, fontFamily: "'JetBrains Mono', monospace" }}>
{` .  ★  ·    ✦     ·  . ★    ✦  ·   .  ★  ·  ✦
   ·    ✦   .   ·    ★  .   ·  ✦    .    ·  ★`}
      </pre>
    </div>
  );
}

// ─── Floating Nav Word ──────────────────────────────────────────────────────
function FloatingWord({
  label,
  href,
  color,
  x,
  y,
  delay,
}: {
  label: string;
  href: string;
  color: string;
  x: string;
  y: string;
  delay: number;
}) {
  return (
    <Link
      href={href}
      className="absolute animate-flicker animate-float group z-20 pointer-events-auto"
      style={{
        left: x,
        top: y,
        animationDelay: `${delay}s`,
        animationDuration: `${4 + delay}s`,
      }}
    >
      <span
        className="text-lg sm:text-xl md:text-2xl font-bold tracking-[0.3em] uppercase transition-all duration-300 group-hover:scale-110 inline-block"
        style={{
          color,
          textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}80, 0 0 80px ${color}40`,
          filter: "brightness(1)",
          cursor: "none",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLElement).style.filter = "brightness(1.5)";
          (e.target as HTMLElement).style.textShadow = `0 0 15px ${color}, 0 0 30px ${color}, 0 0 60px ${color}, 0 0 120px ${color}`;
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.filter = "brightness(1)";
          (e.target as HTMLElement).style.textShadow = `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}80, 0 0 80px ${color}40`;
        }}
      >
        {label}
      </span>
    </Link>
  );
}

// ─── Home Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden cursor-none">
      <Stars />
      <CursorTrail />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 pointer-events-none">

        {/* ASCII Banner */}
        <div className="mb-8">
          <ASCIIBanner />
        </div>

        {/* Tagline */}
        <p
          className="text-xs sm:text-sm tracking-[0.4em] uppercase mb-12 animate-fade-in-up"
          style={{
            color: "#00D4FF",
            textShadow: "0 0 10px rgba(0,212,255,0.5), 0 0 30px rgba(0,212,255,0.2)",
            animationDelay: "0.3s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          Log off. Tune in. Wake up.
        </p>

        {/* Profile picture placeholder */}
        <div
          className="w-40 h-40 sm:w-52 sm:h-52 rounded-full mb-8 animate-fade-in-up overflow-hidden"
          style={{
            border: "2px solid rgba(255,105,180,0.3)",
            boxShadow: "0 0 30px rgba(255,105,180,0.15), 0 0 60px rgba(255,105,180,0.08), inset 0 0 30px rgba(0,0,0,0.5)",
            animationDelay: "0.5s",
            opacity: 0,
            animationFillMode: "forwards",
            background: "linear-gradient(135deg, #0a0a0a, #111)",
          }}
        >
          <img src="/lo.jpg" alt="Lo" className="w-full h-full object-cover" />
        </div>

        {/* Bio */}
        <div
          className="max-w-md text-center mb-20 animate-fade-in-up"
          style={{
            animationDelay: "0.7s",
            opacity: 0,
            animationFillMode: "forwards",
          }}
        >
          <p className="text-xs leading-relaxed text-dim">
            Creator. Truth-teller. Building at the intersection of
            <span className="text-pink-neon"> AI</span>,
            <span className="text-blue-neon"> loneliness</span>, and the
            <span className="text-purple-neon"> attention economy</span>.
          </p>
          <p className="text-[10px] text-dim/50 mt-3 tracking-wider">
            ↓ explore ↓
          </p>
        </div>
      </div>

      {/* Floating navigation words */}
      <FloatingWord label="Data" href="/data" color="#00D4FF" x="8%" y="25%" delay={0} />
      <FloatingWord label="Videos" href="/videos" color="#FF69B4" x="78%" y="30%" delay={1.5} />
      <FloatingWord label="Resources" href="/resources" color="#B388FF" x="12%" y="72%" delay={0.8} />

      {/* Bottom signature */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-[9px] text-dim/30 tracking-[0.3em] uppercase">
          logoffwithlo · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
