"use client";

import { useState, useEffect, useMemo } from "react";

/* ────────────────────────── CSV PARSER ────────────────────────── */
function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { inQ = !inQ; }
    if (c === "\n" && !inQ) { lines.push(cur); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) lines.push(cur);
  const headers = splitRow(lines[0]);
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = splitRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || "").trim(); });
    return obj;
  });
}
function splitRow(line: string): string[] {
  const res: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (c === "," && !inQ) { res.push(cur); cur = ""; continue; }
    cur += c;
  }
  res.push(cur);
  return res;
}

/* ────────────────────────── CONSTANTS ────────────────────────── */
const PINK = "#FF69B4";
const BLUE = "#00D4FF";
const PURPLE = "#B388FF";
const GREEN = "#69FF97";
const YELLOW = "#FFD700";
const NEON = [PINK, BLUE, PURPLE, GREEN, YELLOW, "#FF6B6B", "#4ECDC4"];
const BG = "#000000";

const STOP_WORDS = new Set("the a an is are was it i my me we you your they their and or but in on at to for of with from by as up out about into not no so if that this than then them there has have had do does did will would could should can may just very too when what which who how where why all any both here like think really much get got one even still know make want feel because been being lot something way thing things many ever never also actually pretty probably though well sure see time good bad more most some other only over after without since while need used find keep her she he him his per go re ll ve don didn doesn won wouldn couldn isn aren wasn weren etc kind yeah lol bit stuff done am said say come back going right own part take put tell ask work able around went end little big long new old first great real already people person also dont".split(" "));

const H = {
  desc: "Which best describes you?",
  familiar: "How familiar are you with how Onlyfans works behind the scenes",
  creators: "How many OF creators have you subscribed to in total?",
  money: "Roughly how much money have you spent on Onlyfans? (USD)",
  spentOn: "What have you spent most of the money on?",
  motivates: "What usually motivates you to subscribe?",
  getLooking: "Do you get what you're looking for when you go to these pages?",
  confident: "How confident are you that you are actually talking to the model herself or himself?",
  discover: "Where do you usually discover OnlyFans creators?",
  realAccess: "Have you ever subscribed because an OF creator seemed especially real or accessible?",
  chatter: "If you found that a creator's messages were being handled by a chatter or manager, how would you feel?",
  mostly: "Do you think Onlyfans is mostly",
  deceptive: "Do you think creators are deceptive if they use chatters without telling subscribers?",
  scam: "At what point does Onlyfans become a scam in your eyes?",
  ownWords: "In your own words, what is OnlyFans?",
  addiction: "Do you personally struggle with p*rn addiction?",
  keepPaying: "If you've subscribed before, what makes you keep paying?",
  stopped: "If you've stopped subscribing, what made you stop?",
  deceived: "Have you ever felt deceived by a creator or chat experience? What happened?",
  whySubscribe: "There is a lot of p*rn on the internet- Why do you think people subscribe to Onlyfans? What makes it different?",
};

/* ────────────────────────── HELPERS ────────────────────────── */
function countField(rows: Record<string, string>[], key: string): [string, number][] {
  const m: Record<string, number> = {};
  rows.forEach(r => {
    const v = (r[key] || "").trim();
    if (v && v !== "N/A") m[v] = (m[v] || 0) + 1;
  });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

function countMulti(rows: Record<string, string>[], key: string): [string, number][] {
  const m: Record<string, number> = {};
  rows.forEach(r => {
    const v = (r[key] || "").trim();
    if (!v || v === "N/A") return;
    v.split(",").forEach(s => {
      const t = s.trim().replace(/\.$/, "");
      if (t) m[t] = (m[t] || 0) + 1;
    });
  });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

function topWords(rows: Record<string, string>[], key: string, n = 5): [string, number][] {
  const m: Record<string, number> = {};
  rows.forEach(r => {
    const v = (r[key] || "").toLowerCase().replace(/[^a-z\s'-]/g, "");
    v.split(/\s+/).forEach(w => {
      if (w.length > 2 && !STOP_WORDS.has(w)) m[w] = (m[w] || 0) + 1;
    });
  });
  return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function pct(n: number, total: number): string {
  return Math.round((n / total) * 100) + "%";
}

/* ────────────────────────── CHART COMPONENTS ────────────────────────── */

function HBar({ data, color, maxWidth = 100, order }: { data: [string, number][]; color: string; maxWidth?: number; order?: string[] }) {
  if (order) {
    const map = Object.fromEntries(data);
    data = order.filter(k => map[k] !== undefined).map(k => [k, map[k]] as [string, number]);
  }
  const max = Math.max(...data.map(d => d[1]), 1);
  const total = data.reduce((s, d) => s + d[1], 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map(([label, count]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "monospace", fontSize: 13 }}>
          <span style={{ color: "#999", width: 340, flexShrink: 0, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{label}</span>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ height: 22, background: `linear-gradient(90deg, ${color}, ${color}88)`, width: `${(count / max) * maxWidth}%`, minWidth: 2, borderRadius: 2, boxShadow: `0 0 12px ${color}40`, transition: "width 0.8s ease" }} />
            <span style={{ color, fontSize: 13, fontWeight: "bold", whiteSpace: "nowrap" }}>{count} <span style={{ color: "#555", fontWeight: "normal", fontSize: 11 }}>({pct(count, total)})</span></span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, size = 200 }: { data: [string, number][]; size?: number }) {
  const total = data.reduce((s, d) => s + d[1], 0) || 1;
  let cumPct = 0;
  const slices = data.map(([label, count], i) => {
    const p = (count / total) * 100;
    const start = cumPct;
    cumPct += p;
    return { label, count, pct: p, start, color: NEON[i % NEON.length] };
  });
  const gradientStops = slices.map(s => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(", ");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: `conic-gradient(${gradientStops})`,
        boxShadow: `0 0 40px ${slices[0]?.color || PINK}20`,
        position: "relative", flexShrink: 0,
      }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: size * 0.45, height: size * 0.45, borderRadius: "50%", background: BG }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          <div style={{ color: "#fff", fontFamily: "monospace", fontSize: 22, fontWeight: "bold" }}>{total}</div>
          <div style={{ color: "#555", fontFamily: "monospace", fontSize: 9, letterSpacing: 1 }}>TOTAL</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "monospace", fontSize: 12 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 2, background: s.color, boxShadow: `0 0 8px ${s.color}60` }} />
            <span style={{ color: "#bbb" }}>{s.label}</span>
            <span style={{ color: s.color, fontWeight: "bold" }}>{s.count} ({Math.round(s.pct)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScatterPlot({ data, xLabel, yLabel, color }: { data: { x: number; y: number; label?: string }[]; xLabel: string; yLabel: string; color: string }) {
  const W = 400, H2 = 250, PAD = 40;
  const maxX = Math.max(...data.map(d => d.x), 1);
  const maxY = Math.max(...data.map(d => d.y), 1);
  return (
    <div style={{ position: "relative", width: W + PAD * 2, height: H2 + PAD * 2, fontFamily: "monospace" }}>
      {/* Axes */}
      <div style={{ position: "absolute", left: PAD, bottom: PAD, width: W, height: 1, background: "#333" }} />
      <div style={{ position: "absolute", left: PAD, bottom: PAD, width: 1, height: H2, background: "#333" }} />
      {/* X label */}
      <div style={{ position: "absolute", bottom: 8, left: PAD, width: W, textAlign: "center", color: "#555", fontSize: 10 }}>{xLabel}</div>
      {/* Y label */}
      <div style={{ position: "absolute", left: 4, top: PAD, color: "#555", fontSize: 10, writingMode: "vertical-rl" as const, transform: "rotate(180deg)", height: H2, textAlign: "center" }}>{yLabel}</div>
      {/* Grid */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <div key={f} style={{ position: "absolute", left: PAD, bottom: PAD + f * H2, width: W, height: 1, background: "#1a1a1a" }} />
      ))}
      {/* Points */}
      {data.map((d, i) => {
        const cx = PAD + (d.x / maxX) * W;
        const cy = PAD + H2 - (d.y / maxY) * H2;
        return (
          <div key={i} title={d.label} style={{
            position: "absolute", left: cx - 5, top: cy - 5,
            width: 10, height: 10, borderRadius: "50%",
            background: color, boxShadow: `0 0 10px ${color}80`,
            opacity: 0.8,
          }} />
        );
      })}
    </div>
  );
}

function StatBox({ value, label, color, sub }: { value: string; label: string; color: string; sub?: string }) {
  return (
    <div style={{ border: `1px solid ${color}30`, borderRadius: 8, padding: "20px 16px", textAlign: "center", background: `${color}08`, minWidth: 140 }}>
      <div style={{ color, fontFamily: "monospace", fontSize: 36, fontWeight: "bold", textShadow: `0 0 20px ${color}40`, lineHeight: 1 }}>{value}</div>
      <div style={{ color: "#888", fontFamily: "monospace", fontSize: 10, letterSpacing: 1, marginTop: 8, textTransform: "uppercase" }}>{label}</div>
      {sub && <div style={{ color: "#555", fontFamily: "monospace", fontSize: 10, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function WordMap({ words, seed }: { words: [string, number][]; seed: number }) {
  const rand = seededRand(seed);
  const maxC = Math.max(...words.map(w => w[1]), 1);
  return (
    <div style={{ position: "relative", minHeight: 160, padding: "20px 10px", overflow: "hidden" }}>
      {words.map(([word, count], i) => {
        const size = 18 + ((count / maxC) * 32);
        const col = NEON[i % NEON.length];
        const top = 10 + rand() * 55;
        const left = 5 + rand() * 75;
        return (
          <span key={word} style={{
            position: "absolute", top: `${top}%`, left: `${left}%`,
            fontSize: size, fontFamily: "monospace", fontWeight: "bold",
            color: col, textShadow: `0 0 12px ${col}`,
            transform: `rotate(${(rand() - 0.5) * 15}deg)`,
          }}>{word}</span>
        );
      })}
    </div>
  );
}

function InsightCard({ stat, desc, color }: { stat: string; desc: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", border: `1px solid ${color}30`, borderRadius: 8, background: `${color}06`, marginBottom: 12 }}>
      <span style={{ color, fontFamily: "monospace", fontSize: 28, fontWeight: "bold", textShadow: `0 0 15px ${color}40`, minWidth: 70, textAlign: "center" }}>{stat}</span>
      <span style={{ color: "#bbb", fontFamily: "monospace", fontSize: 13, lineHeight: 1.5 }}>{desc}</span>
    </div>
  );
}

function SectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h3 style={{ color, fontFamily: "monospace", fontSize: 14, letterSpacing: 2, textTransform: "uppercase", margin: "32px 0 16px", textShadow: `0 0 10px ${color}40` }}>
      {"▸ "}{children}
    </h3>
  );
}

function FreeSummary({ title, summary, color }: { title: string; summary: string; color: string }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h3 style={{ color, fontFamily: "monospace", fontSize: 14, letterSpacing: 1, marginBottom: 12, textShadow: `0 0 10px ${color}40` }}>
        {"▸ "}{title}
      </h3>
      <p style={{ color: "#aaa", fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, margin: 0, maxWidth: 700, borderLeft: `2px solid ${color}40`, paddingLeft: 16 }}>
        {summary}
      </p>
    </div>
  );
}

/* ────────────────────────── SLIDE NAVIGATION ────────────────────────── */
const SLIDE_TITLES = [
  "PARTICIPANTS",
  "DISCOVERY & MOTIVATION",
  "DECEPTION & SCAMS",
  "CONTRADICTIONS",
  "IN THEIR OWN WORDS",
];

/* ────────────────────────── MAIN PAGE ────────────────────────── */
export default function DataPage() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    fetch("/survey-data.csv").then(r => r.text()).then(t => setRows(parseCSV(t)));
  }, []);

  const data = useMemo(() => {
    if (!rows.length) return null;
    const total = rows.length;

    // Cross-variable computations
    const deceptiveYes = rows.filter(r => r[H.deceptive] === "Yes").length;
    const assumedChatters = rows.filter(r => r[H.chatter] === "I already assume this was happening").length;
    const bothDeceptiveAndAssumed = rows.filter(r => r[H.deceptive] === "Yes" && r[H.chatter] === "I already assume this was happening").length;
    const lowConf = rows.filter(r => ["1", "2"].includes(r[H.confident]));
    const lowConfPaid = lowConf.filter(r => r[H.money] && r[H.money] !== "0").length;
    const realAccessYes = rows.filter(r => r[H.realAccess] === "Yes");
    const realButLowConf = realAccessYes.filter(r => ["1", "2"].includes(r[H.confident])).length;
    const addictionYes = rows.filter(r => r[H.addiction] === "Yes").length;
    const addictionPaid1k = rows.filter(r => r[H.addiction] === "Yes" && r[H.money] === "1000+").length;

    // Scatter: familiarity vs confidence
    const familiarVsConfident = rows.filter(r => r[H.familiar] && r[H.confident]).map(r => ({
      x: parseInt(r[H.familiar]) || 0,
      y: parseInt(r[H.confident]) || 0,
      label: `Familiarity: ${r[H.familiar]}, Confidence: ${r[H.confident]}`,
    }));

    return {
      total,
      desc: countField(rows, H.desc),
      familiar: countField(rows, H.familiar),
      creators: countField(rows, H.creators),
      money: countField(rows, H.money),
      discover: countMulti(rows, H.discover),
      motivates: countMulti(rows, H.motivates),
      mostly: countMulti(rows, H.mostly),
      realAccess: countField(rows, H.realAccess),
      getLooking: countField(rows, H.getLooking),
      confident: countField(rows, H.confident),
      chatter: countField(rows, H.chatter),
      deceptive: countField(rows, H.deceptive),
      scam: countMulti(rows, H.scam),
      addiction: countField(rows, H.addiction),
      // Cross-var
      deceptiveYes, assumedChatters, bothDeceptiveAndAssumed,
      lowConf: lowConf.length, lowConfPaid,
      realAccessYes: realAccessYes.length, realButLowConf,
      addictionYes, addictionPaid1k,
      familiarVsConfident,
      // Free response words
      wc_own: topWords(rows, H.ownWords, 5),
      wc_keep: topWords(rows, H.keepPaying, 5),
      wc_stop: topWords(rows, H.stopped, 5),
      wc_deceived: topWords(rows, H.deceived, 5),
      wc_why: topWords(rows, H.whySubscribe, 5),
    };
  }, [rows]);

  if (!data) return (
    <div style={{ background: BG, color: GREEN, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      <span style={{ textShadow: `0 0 10px ${GREEN}` }}>LOADING DATA...</span>
    </div>
  );

  const prev = () => setSlide(s => Math.max(0, s - 1));
  const next = () => setSlide(s => Math.min(SLIDE_TITLES.length - 1, s + 1));

  return (
    <div style={{ background: BG, color: "#ccc", minHeight: "100vh", fontFamily: "'JetBrains Mono', 'Space Mono', monospace", cursor: "auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Mono:wght@400;700&display=swap');
        ::selection { background: ${PINK}40; color: ${PINK}; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .slide-content { animation: fadeIn 0.5s ease; }
      `}</style>

      {/* ─── HEADER ─── */}
      <div style={{ background: "#000", padding: "24px 32px 0", textAlign: "center" }}>
        <a href="/" style={{ color: PINK, fontFamily: "monospace", fontSize: 13, textDecoration: "none", textShadow: `0 0 8px ${PINK}`, position: "absolute", left: 32, top: 24 }}>← back</a>
        <pre style={{ color: PINK, fontSize: 11, lineHeight: 1.2, textShadow: `0 0 20px ${PINK}`, margin: "0 auto" }}>{`
 ██████╗ ███╗   ██╗██╗  ██╗   ██╗███████╗ █████╗ ███╗   ██╗███████╗
██╔═══██╗████╗  ██║██║  ╚██╗ ██╔╝██╔════╝██╔══██╗████╗  ██║██╔════╝
██║   ██║██╔██╗ ██║██║   ╚████╔╝ █████╗  ███████║██╔██╗ ██║███████╗
██║   ██║██║╚██╗██║██║    ╚██╔╝  ██╔══╝  ██╔══██║██║╚██╗██║╚════██║
╚██████╔╝██║ ╚████║███████╗██║   ██║     ██║  ██║██║ ╚████║███████║
 ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝`}</pre>
        <h1 style={{ color: BLUE, fontFamily: "monospace", fontSize: 22, textShadow: `0 0 15px ${BLUE}`, margin: "12px 0 4px", letterSpacing: 3 }}>
          SUBSCRIBER DATA
        </h1>
        <div style={{ color: "#555", fontFamily: "monospace", fontSize: 12, marginBottom: 16 }}>
          {data.total} responses &nbsp;│&nbsp; 2026
        </div>
      </div>

      {/* ─── NAV BAR ─── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#000", borderBottom: "1px solid #1a1a1a", padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {SLIDE_TITLES.map((t, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              padding: "6px 14px", borderRadius: 4, fontFamily: "monospace", fontSize: 10,
              letterSpacing: 1, border: "1px solid",
              borderColor: slide === i ? PINK : "#222",
              background: slide === i ? `${PINK}15` : "transparent",
              color: slide === i ? PINK : "#555",
              cursor: "pointer", transition: "all 0.2s",
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={prev} disabled={slide === 0} style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${slide === 0 ? "#222" : BLUE}`, color: slide === 0 ? "#333" : BLUE, fontFamily: "monospace", fontSize: 12, cursor: slide === 0 ? "default" : "pointer", borderRadius: 4 }}>◂ PREV</button>
          <button onClick={next} disabled={slide === SLIDE_TITLES.length - 1} style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${slide === SLIDE_TITLES.length - 1 ? "#222" : BLUE}`, color: slide === SLIDE_TITLES.length - 1 ? "#333" : BLUE, fontFamily: "monospace", fontSize: 12, cursor: slide === SLIDE_TITLES.length - 1 ? "default" : "pointer", borderRadius: 4 }}>NEXT ▸</button>
        </div>
      </div>

      {/* ─── SLIDE CONTENT ─── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 32px 80px" }} className="slide-content" key={slide}>

        {/* ════════════════ SLIDE 1: PARTICIPANTS ════════════════ */}
        {slide === 0 && (
          <>
            {/* Overview Stats */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 40 }}>
              <StatBox value={String(data.total)} label="Respondents" color={PINK} />
              <StatBox value="69%" label="Former Subs" color={BLUE} sub={`${data.desc.find(d => d[0].includes("former"))?.[1] || 0} people`} />
              <StatBox value="19%" label="Current Subs" color={GREEN} sub={`${data.desc.find(d => d[0].includes("current"))?.[1] || 0} people`} />
              <StatBox value="12%" label="Never Subbed" color={PURPLE} sub={`${data.desc.find(d => d[0].includes("never"))?.[1] || 0} people`} />
            </div>

            <SectionTitle color={PINK}>Who Responded</SectionTitle>
            <DonutChart data={data.desc} />

            <SectionTitle color={BLUE}>How Many Creators Have You Subscribed To?</SectionTitle>
            <HBar data={data.creators} color={BLUE} order={["0", "1-2", "3-5", "6-10", "11-20", "20+"]} />

            <SectionTitle color={GREEN}>How Much Money Spent (USD)</SectionTitle>
            <HBar data={data.money} color={GREEN} order={["0", "Under $50", "$50-250", "$250-$500", "$500-1000", "1000+"]} />

            <SectionTitle color={PURPLE}>Familiarity with How OF Works Behind the Scenes (1-5)</SectionTitle>
            <HBar data={data.familiar} color={PURPLE} order={["1", "2", "3", "4", "5"]} />
            <p style={{ color: "#666", fontFamily: "monospace", fontSize: 11, marginTop: 8 }}>
              Average familiarity: {(rows.reduce((s, r) => s + (parseInt(r[H.familiar]) || 0), 0) / data.total).toFixed(1)} / 5 — Most respondents have low understanding of the industry mechanics.
            </p>
          </>
        )}

        {/* ════════════════ SLIDE 2: DISCOVERY & MOTIVATION ════════════════ */}
        {slide === 1 && (
          <>
            <h2 style={{ color: BLUE, fontFamily: "monospace", fontSize: 24, letterSpacing: 3, margin: "0 0 8px", textShadow: `0 0 15px ${BLUE}40` }}>
              DISCOVERY & MOTIVATION
            </h2>
            <p style={{ color: "#555", fontFamily: "monospace", fontSize: 12, marginBottom: 32 }}>How subscribers find and choose to pay for OnlyFans creators</p>

            <SectionTitle color={PINK}>Where Do You Discover OF Creators?</SectionTitle>
            <DonutChart data={data.discover} size={180} />

            <SectionTitle color={BLUE}>What Motivates You to Subscribe?</SectionTitle>
            <HBar data={data.motivates} color={BLUE} />
            <p style={{ color: "#666", fontFamily: "monospace", fontSize: 11, marginTop: 8 }}>
              Sexual attraction dominates ({pct(data.motivates.find(d => d[0].includes("Sexual"))?.[1] || 0, data.total)}), but curiosity is almost as strong ({pct(data.motivates.find(d => d[0].includes("Curiosity"))?.[1] || 0, data.total)}) — many aren&apos;t paying for content, they&apos;re paying to see what the fuss is about.
            </p>

            <SectionTitle color={GREEN}>Do You Think OnlyFans Is Mostly...</SectionTitle>
            <DonutChart data={data.mostly} size={180} />
            <p style={{ color: "#666", fontFamily: "monospace", fontSize: 11, marginTop: 8 }}>
              {pct(data.mostly.find(d => d[0].includes("sex work"))?.[1] || 0, data.total)} see it as sex work. Only {pct(data.mostly.find(d => d[0].includes("fantasy"))?.[1] || 0, data.total)} frame it as fantasy.
            </p>

            <SectionTitle color={PURPLE}>Have You Subscribed Because a Creator Seemed Real or Accessible?</SectionTitle>
            <DonutChart data={data.realAccess} size={180} />
            <p style={{ color: "#666", fontFamily: "monospace", fontSize: 11, marginTop: 8 }}>
              {pct(data.realAccessYes, data.total)} said yes — perceived authenticity is a major conversion driver, even when most know it&apos;s not real.
            </p>
          </>
        )}

        {/* ════════════════ SLIDE 3: DECEPTION & SCAMS ════════════════ */}
        {slide === 2 && (
          <>
            <h2 style={{ color: PURPLE, fontFamily: "monospace", fontSize: 24, letterSpacing: 3, margin: "0 0 8px", textShadow: `0 0 15px ${PURPLE}40` }}>
              DECEPTION & SCAMS
            </h2>
            <p style={{ color: "#555", fontFamily: "monospace", fontSize: 12, marginBottom: 32 }}>Trust, chatters, and where the line gets drawn</p>

            <SectionTitle color={GREEN}>Do You Get What You&apos;re Looking For?</SectionTitle>
            <DonutChart data={data.getLooking} size={180} />
            <p style={{ color: "#666", fontFamily: "monospace", fontSize: 11, marginTop: 8 }}>
              Only {pct(data.getLooking.find(d => d[0] === "Yes")?.[1] || 0, data.total)} say yes outright. {pct(data.getLooking.find(d => d[0] === "Kind of")?.[1] || 0, data.total)} say &quot;kind of&quot; — a tepid endorsement at best.
            </p>

            <SectionTitle color={BLUE}>How Confident Are You That You&apos;re Talking to the Model? (1-5)</SectionTitle>
            <HBar data={data.confident} color={BLUE} order={["1", "2", "3", "4", "5"]} />
            <p style={{ color: "#666", fontFamily: "monospace", fontSize: 11, marginTop: 8 }}>
              {pct(data.lowConf, data.total)} rated their confidence a 1 or 2. The average is {(rows.reduce((s, r) => s + (parseInt(r[H.confident]) || 0), 0) / data.total).toFixed(1)}/5. Most people know they&apos;re not talking to the creator.
            </p>

            <SectionTitle color={PINK}>If You Found Out a Chatter Was Handling Messages...</SectionTitle>
            <HBar data={data.chatter} color={PINK} />

            <SectionTitle color={GREEN}>Deceptive If Using Chatters Without Telling Subscribers?</SectionTitle>
            <DonutChart data={data.deceptive} size={180} />

            <SectionTitle color={PURPLE}>At What Point Does OF Become a &quot;Scam&quot;?</SectionTitle>
            <HBar data={data.scam} color={PURPLE} />

            <SectionTitle color={YELLOW}>Do You Struggle with P*rn Addiction?</SectionTitle>
            <DonutChart data={data.addiction} size={180} />
            <p style={{ color: "#666", fontFamily: "monospace", fontSize: 11, marginTop: 8 }}>
              {pct(data.addictionYes, data.total)} say yes, another {pct(data.addiction.find(d => d[0].includes("Maybe"))?.[1] || 0, data.total)} say maybe — a combined {pct(data.addictionYes + (data.addiction.find(d => d[0].includes("Maybe"))?.[1] || 0), data.total)} acknowledge a potential problem.
            </p>
          </>
        )}

        {/* ════════════════ SLIDE 4: CONTRADICTIONS ════════════════ */}
        {slide === 3 && (
          <>
            <h2 style={{ color: YELLOW, fontFamily: "monospace", fontSize: 24, letterSpacing: 3, margin: "0 0 8px", textShadow: `0 0 15px ${YELLOW}40` }}>
              THE CONTRADICTIONS
            </h2>
            <p style={{ color: "#555", fontFamily: "monospace", fontSize: 12, marginBottom: 32 }}>The most interesting cross-variable findings</p>

            <InsightCard
              stat={pct(data.bothDeceptiveAndAssumed, data.total)}
              desc={`think it's deceptive to use chatters AND already assumed it was happening. They know it's a lie, they call it deceptive, and they engaged anyway.`}
              color={PINK}
            />
            <InsightCard
              stat={pct(data.lowConfPaid, data.total)}
              desc={`rated their confidence at 1-2 that they're talking to the model — yet still spent money on the platform. They're paying for a fantasy they know isn't real.`}
              color={BLUE}
            />
            <InsightCard
              stat={`${pct(data.realButLowConf, data.realAccessYes)}`}
              desc={`of people who subscribed because a creator "seemed real or accessible" also rated their confidence 1-2 that they're talking to the model. The illusion of intimacy works even when you don't believe it.`}
              color={PURPLE}
            />
            <InsightCard
              stat={pct(data.deceptiveYes, data.total)}
              desc={`say it's deceptive to use chatters. ${pct(data.assumedChatters, data.total)} already assumed chatters were being used. The industry runs on a deception that everyone acknowledges.`}
              color={GREEN}
            />
            <InsightCard
              stat={String(data.addictionPaid1k)}
              desc={`people who say they struggle with addiction have spent $1,000+ on the platform. That's ${pct(data.addictionPaid1k, data.addictionYes)} of the addicted group reaching four figures.`}
              color={YELLOW}
            />

            <SectionTitle color={BLUE}>Familiarity vs Confidence Scatter</SectionTitle>
            <p style={{ color: "#666", fontFamily: "monospace", fontSize: 11, marginBottom: 12 }}>
              Does knowing more about how OF works change how confident you are you&apos;re talking to the model?
            </p>
            <ScatterPlot data={data.familiarVsConfident} xLabel="Familiarity (1-5)" yLabel="Confidence (1-5)" color={BLUE} />
            <p style={{ color: "#666", fontFamily: "monospace", fontSize: 11, marginTop: 8 }}>
              Clusters in the low-confidence zone regardless of familiarity — knowing how it works doesn&apos;t change the behavior.
            </p>
          </>
        )}

        {/* ════════════════ SLIDE 5: FREE RESPONSES ════════════════ */}
        {slide === 4 && (
          <>
            <h2 style={{ color: GREEN, fontFamily: "monospace", fontSize: 24, letterSpacing: 3, margin: "0 0 8px", textShadow: `0 0 15px ${GREEN}40` }}>
              IN THEIR OWN WORDS
            </h2>
            <p style={{ color: "#555", fontFamily: "monospace", fontSize: 12, marginBottom: 32 }}>Free response summaries and word maps</p>

            <FreeSummary
              title={`"In your own words, what is OnlyFans?"`}
              summary="Almost everyone described OnlyFans as a porn platform, but the word 'personal' kept showing up. 'Custom porn.' 'Direct access to creators.' 'A more intimate version of what already exists for free.' People know what OnlyFans is. They also know why it hits different. The whole appeal is that it feels like you're close to someone. That closeness is the product."
              color={PINK}
            />

            <FreeSummary
              title={`"What makes you keep paying?"`}
              summary="People said attraction and good content, sure. But the real pattern? Consistency and anticipation. They stay when creators post regularly and reply to messages, even when they suspect the replies are automated. A few people straight up admitted they just forget to cancel. That's the quiet part: once you're in, inertia does the rest. The occasional message that feels real is enough to keep you subscribed."
              color={BLUE}
            />

            <FreeSummary
              title={`"What made you stop?"`}
              summary="Money was the top answer, but it almost always came with something else: the realization that the same content exists for free somewhere else, that the messages were fake, or that the value just wasn't there. 'Access to the same videos on third-party sites' came up over and over. People described a moment where the gap between what they were sold and what they actually got just stopped making sense. Once you see it, you can't unsee it."
              color={GREEN}
            />

            <FreeSummary
              title={`"Have you ever felt deceived?"`}
              summary="About half said no. But not because nothing shady happened. They just went in already expecting it. 'I already assumed it wasn't her' was the most common vibe. The people who did feel deceived talked about duplicate messages, responses that made no sense given what they wrote, and creators who couldn't remember a single thing about them. Most people aren't surprised by the deception. They just tolerate it until it gets sloppy."
              color={PURPLE}
            />

            <FreeSummary
              title={`"Why do people subscribe when free porn exists?"`}
              summary="This is where it gets real. People used the word 'parasocial' unprompted. They get it. They described the appeal as 'feeling like you know the person,' 'the gambling element of custom content,' and 'seeing someone you follow on social media in a different context.' A few compared it to tipping a streamer. You're not paying for a product. You're paying for attention. And when you zoom out on all of these answers together, the through-line is loneliness. That's what OnlyFans monetizes."
              color={YELLOW}
            />
          </>
        )}
      </div>

      {/* ─── FOOTER ─── */}
      <div style={{ textAlign: "center", color: "#222", fontFamily: "monospace", fontSize: 11, paddingBottom: 40 }}>
        ▓▓▓ LOG OFF WITH LO ▓▓▓ &nbsp;│&nbsp; {data.total} responses &nbsp;│&nbsp; 2026
      </div>
    </div>
  );
}
