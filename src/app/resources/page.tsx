"use client";
import Link from "next/link";

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
      <Link href="/" className="absolute top-6 left-8 text-[10px] text-dim hover:text-pink-neon tracking-[0.2em] uppercase transition-colors" >
        ← back
      </Link>
      <h1
        className="text-4xl sm:text-6xl font-bold tracking-[0.3em] uppercase"
        style={{
          color: "#B388FF",
          textShadow: "0 0 20px rgba(179,136,255,0.5), 0 0 40px rgba(179,136,255,0.3), 0 0 80px rgba(179,136,255,0.15)",
        }}
      >
        Resources
      </h1>
      <p className="text-dim text-xs mt-4 tracking-wider">Coming soon.</p>
      <div className="mt-8 w-32 h-[1px]" style={{ background: "linear-gradient(to right, transparent, #B388FF, transparent)" }} />
    </div>
  );
}
