"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PINK = "#FF69B4";
const BLUE = "#00D4FF";
const PURPLE = "#B388FF";
const GREEN = "#69FF97";

const studies = [
  {
    title: "ASMR",
    subtitle: "SURVEY DATA",
    description: "What does ASMR do to your brain? Why are people so obsessed? Neuroscience, psychological susceptibility, and the dark side of the tingle economy.",
    respondents: null,
    respondentsLive: true,
    color: PURPLE,
    href: "/survey/asmr",
    surveyHref: null,
    status: "LIVE",
  },
  {
    title: "ONLYFANS",
    subtitle: "SUBSCRIBER DATA",
    description: "97 OnlyFans subscribers surveyed on spending, motivation, deception, and addiction. Interactive slideshow with charts, cross-variable contradictions, and free response analysis.",
    respondents: 97,
    respondentsLive: false,
    color: PINK,
    href: "/data/onlyfans",
    surveyHref: null,
    status: "LIVE",
  },
];

export default function DataHub() {
  const [asmrCount, setAsmrCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/survey/asmr")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAsmrCount(data.length); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: "#000", color: "#ccc", minHeight: "100vh", fontFamily: "'JetBrains Mono', 'Space Mono', monospace", cursor: "url('/pixel-cursor.svg') 0 0, auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Mono:wght@400;700&display=swap');
        ::selection { background: ${PINK}40; color: ${PINK}; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); }
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 32px 80px" }}>
        {/* Back */}
        <a href="/" style={{ color: PINK, fontFamily: "monospace", fontSize: 13, textDecoration: "none", textShadow: `0 0 8px ${PINK}` }}>← home</a>

        {/* Header */}
        <pre style={{ color: PINK, fontSize: 10, lineHeight: 1.2, textShadow: `0 0 20px ${PINK}`, margin: "32px 0 0", textAlign: "center" }}>{`
██████╗  █████╗ ████████╗ █████╗
██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
██║  ██║███████║   ██║   ███████║
██║  ██║██╔══██║   ██║   ██╔══██║
██████╔╝██║  ██║   ██║   ██║  ██║
╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝`}</pre>

        <p style={{ textAlign: "center", color: "#555", fontFamily: "monospace", fontSize: 12, margin: "16px 0 48px", letterSpacing: 2 }}>
          RESEARCH &nbsp;│&nbsp; SURVEYS &nbsp;│&nbsp; VISUALIZATIONS
        </p>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {studies.map((study) => {
            const inner = (
              <div
                className="card-hover"
                style={{
                  border: `1px solid ${study.color}30`,
                  borderRadius: 12,
                  padding: "32px 28px",
                  background: `${study.color}06`,
                  cursor: study.href ? "pointer" : "default",
                  position: "relative",
                  overflow: "hidden",
                  animation: "fadeIn 0.6s ease",
                }}
              >
                {/* Glow accent */}
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: study.color, boxShadow: `0 0 20px ${study.color}60` }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <h2 style={{ color: study.color, fontFamily: "monospace", fontSize: 28, fontWeight: "bold", margin: 0, letterSpacing: 4, textShadow: `0 0 15px ${study.color}40` }}>
                      {study.title}
                    </h2>
                    <p style={{ color: "#666", fontFamily: "monospace", fontSize: 11, letterSpacing: 2, margin: "4px 0 0" }}>
                      {study.subtitle}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    letterSpacing: 2,
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: `1px solid ${study.status === "LIVE" ? GREEN : PURPLE}40`,
                    color: study.status === "LIVE" ? GREEN : PURPLE,
                    background: study.status === "LIVE" ? `${GREEN}10` : `${PURPLE}10`,
                    animation: study.status === "IN PROGRESS" ? "pulse 2s infinite" : "none",
                  }}>
                    {study.status}
                  </span>
                </div>

                <p style={{ color: "#888", fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 600 }}>
                  {study.description}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {(study.respondentsLive ? asmrCount !== null && asmrCount > 0 : study.respondents) && (
                    <span style={{ color: study.color, fontFamily: "monospace", fontSize: 12, fontWeight: "bold" }}>
                      {study.respondentsLive ? asmrCount : study.respondents} responses
                    </span>
                  )}
                  {study.href && (
                    <span style={{ color: study.color, fontFamily: "monospace", fontSize: 12, opacity: 0.7 }}>
                      view study →
                    </span>
                  )}
                  {study.surveyHref && (
                    <Link href={study.surveyHref} style={{ color: GREEN, fontFamily: "monospace", fontSize: 12, textDecoration: "none", opacity: 0.7 }} onClick={(e) => e.stopPropagation()}>
                      take survey →
                    </Link>
                  )}
                </div>
              </div>
            );

            return (
              <div
                key={study.title}
                onClick={() => { if (study.href) window.location.href = study.href; }}
                style={{ cursor: study.href ? "pointer" : "default" }}
              >
                {inner}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", color: "#222", fontFamily: "monospace", fontSize: 11, marginTop: 64 }}>
          ▓▓▓ LOG OFF WITH LO ▓▓▓
        </div>
      </div>
    </div>
  );
}
