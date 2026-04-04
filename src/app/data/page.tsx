"use client";

import { useState, useEffect, useMemo } from "react";

/* ────────────────────────── CSV PARSER ────────────────────────── */
function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { inQ = !inQ; continue; }
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
const NEON = [PINK, BLUE, PURPLE, GREEN];
const BG = "#000000";

const STOP_WORDS = new Set("the a an is are was it i my me we you your they their and or but in on at to for of with from by as up out about into not no so if that this than then them there has have had do does did will would could should can may just very too when what which who how where why all any both here like think really much get got one even still know make want feel because been being lot something way thing things many ever never also actually pretty probably though well sure see time good bad more most some other only over after without since while need used find keep her she he him his per go re ll ve don didn doesn won wouldn couldn isn aren wasn weren etc kind yeah lol bit stuff done am said say come back going right own part take put tell ask work able around went end little big long new old first last great real already people person".split(" "));

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

function wordCounts(rows: Record<string, string>[], key: string): [string, number][] {
  const m: Record<string, number> = {};
  rows.forEach(r => {
    const v = (r[key] || "").toLowerCase().replace(/[^a-z\s]/g, "");
    v.split(/\s+/).forEach(w => {
      if (w.length > 1 && !STOP_WORDS.has(w)) m[w] = (m[w] || 0) + 1;
    });
  });
  return Object.entries(m).filter(([, c]) => c >= 3).sort((a, b) => b[1] - a[1]);
}

function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

/* ────────────────────────── CHART COMPONENTS ────────────────────────── */

function AsciiBox({ title, color, children, id }: { title: string; color: string; children: React.ReactNode; id: string }) {
  return (
    <div style={{ marginBottom: 48 }} id={id}>
      <div style={{ color, fontFamily: "monospace", fontSize: 14, whiteSpace: "pre" }}>
        {"╔" + "═".repeat(Math.max(title.length + 2, 60)) + "╗"}
      </div>
      <div style={{ color, fontFamily: "monospace", fontSize: 14, whiteSpace: "pre" }}>
        {"║ " + title.padEnd(Math.max(title.length, 59)) + "║"}
      </div>
      <div style={{ color, fontFamily: "monospace", fontSize: 14, whiteSpace: "pre" }}>
        {"╚" + "═".repeat(Math.max(title.length + 2, 60)) + "╝"}
      </div>
      <div style={{ padding: "16px 0" }}>{children}</div>
    </div>
  );
}

function HBar({ data, color, prefix }: { data: [string, number][]; color: string; prefix?: string }) {
  const max = Math.max(...data.map(d => d[1]), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {data.map(([label, count]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace", fontSize: 13 }}>
          <span style={{ color: "#888", minWidth: 220, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ height: 16, background: color, width: `${(count / max) * 100}%`, minWidth: 2, boxShadow: `0 0 8px ${color}`, transition: "width 0.5s" }} />
            <span style={{ color, fontSize: 12 }}>{prefix || ""}{count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DotMatrix({ data, color }: { data: [string, number][]; color: string }) {
  const max = Math.max(...data.map(d => d[1]), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {data.map(([label, count]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace", fontSize: 13 }}>
          <span style={{ color: "#888", minWidth: 60, textAlign: "right" }}>{label}</span>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {Array.from({ length: count }).map((_, i) => (
              <span key={i} style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
            ))}
          </div>
          <span style={{ color, fontSize: 12 }}>{count}</span>
        </div>
      ))}
    </div>
  );
}

function CSSPie({ data, color }: { data: [string, number][]; color: string }) {
  const total = data.reduce((s, d) => s + d[1], 0) || 1;
  let cumPct = 0;
  const slices = data.map(([label, count], i) => {
    const pct = (count / total) * 100;
    const start = cumPct;
    cumPct += pct;
    return { label, count, pct, start, color: NEON[i % NEON.length] };
  });
  const gradientStops = slices.map(s => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(", ");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
      <div style={{
        width: 200, height: 200, borderRadius: "50%",
        background: `conic-gradient(${gradientStops})`,
        boxShadow: `0 0 30px ${color}40`,
        position: "relative",
      }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 80, height: 80, borderRadius: "50%", background: BG }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "monospace", fontSize: 13 }}>
        {slices.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", width: 12, height: 12, background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
            <span style={{ color: "#ccc" }}>{s.label}</span>
            <span style={{ color: s.color }}>{s.count} ({Math.round(s.pct)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WordCloud({ words, seed }: { words: [string, number][]; seed: number }) {
  const rand = seededRand(seed);
  const maxC = Math.max(...words.map(w => w[1]), 1);
  return (
    <div style={{ position: "relative", minHeight: 300, padding: 20, overflow: "hidden" }}>
      {words.map(([word, count], i) => {
        const size = 14 + ((count / maxC) * 36);
        const col = NEON[i % NEON.length];
        const top = rand() * 70;
        const left = rand() * 85;
        return (
          <span key={word} style={{
            position: "absolute", top: `${top}%`, left: `${left}%`,
            fontSize: size, fontFamily: "monospace", fontWeight: "bold",
            color: col, textShadow: `0 0 10px ${col}`,
            transform: `rotate(${(rand() - 0.5) * 20}deg)`,
          }}>{word}</span>
        );
      })}
    </div>
  );
}

function ScoreRow({ vizIndex, scores, setScores, notes, setNotes }: {
  vizIndex: number;
  scores: Record<number, number>;
  setScores: (s: Record<number, number>) => void;
  notes: Record<number, string>;
  setNotes: (n: Record<number, string>) => void;
}) {
  const selected = scores[vizIndex] || 0;
  return (
    <div style={{ marginTop: 12, padding: "8px 0", borderTop: "1px solid #222" }}>
      <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ color: "#555", fontFamily: "monospace", fontSize: 11, marginRight: 8 }}>RATE:</span>
        {Array.from({ length: 10 }).map((_, i) => {
          const n = i + 1;
          const active = selected === n;
          return (
            <button key={n} onClick={() => setScores({ ...scores, [vizIndex]: n })} style={{
              width: 28, height: 28, border: `1px solid ${active ? PINK : "#333"}`,
              background: active ? PINK + "30" : "transparent",
              color: active ? PINK : "#555",
              fontFamily: "monospace", fontSize: 12, cursor: "auto",
              boxShadow: active ? `0 0 8px ${PINK}` : "none",
            }}>{n}</button>
          );
        })}
      </div>
      <input
        type="text"
        placeholder="what do you like/dislike?"
        value={notes[vizIndex] || ""}
        onChange={e => setNotes({ ...notes, [vizIndex]: e.target.value })}
        style={{
          marginTop: 6, width: "100%", maxWidth: 500, padding: "6px 10px",
          background: "#111", border: "1px solid #333", color: "#aaa",
          fontFamily: "monospace", fontSize: 12, outline: "none",
        }}
      />
    </div>
  );
}

/* ────────────────────────── HEADERS / KEYS ────────────────────────── */
const H = {
  desc: "Which best describes you?",
  familiar: "How familiar are you with how Onlyfans works behind the scenes",
  creators: "How many OF creators have you subscribed to in total?",
  money: "Roughly how much money have you spent on Onlyfans? (USD)",
  spentOn: "What have you spent most of the money on?",
  motivates: "What usually motivates you to subscribe?",
  getLooking: "Do you get what you're looking for when you go to these pages? ",
  confident: "How confident are you that you are actually talking to the model herself or himself? ",
  discover: "Where do you usually discover OnlyFans creators? ",
  realAccess: "Have you ever subscribed because an OF creator seemed especially real or accessible? ",
  chatter: "If you found that a creator's messages were being handled by a chatter or manager, how would you feel?",
  mostly: "Do you think Onlyfans is mostly",
  deceptive: "Do you think creators are deceptive if they use chatters without telling subscribers?",
  scam: "At what point does Onlyfans become a \"scam\" in your eyes?",
  ownWords: "In your own words, what is OnlyFans?",
  addiction: "Do you personally struggle with p*rn addiction?",
  keepPaying: "If you've subscribed before, what makes you keep paying?",
  stopped: "If you've stopped subscribing, what made you stop?",
  deceived: "Have you ever felt deceived by a creator or chat experience? What happened?",
  whySubscribe: "There is a lot of p*rn on the internet- Why do you think people subscribe to Onlyfans? What makes it different?",
};

/* ────────────────────────── MAIN PAGE ────────────────────────── */
export default function DataPage() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch("/survey-data.csv").then(r => r.text()).then(t => setRows(parseCSV(t)));
  }, []);

  const vizData = useMemo(() => {
    if (!rows.length) return null;
    return {
      desc: countField(rows, H.desc),
      familiar: countField(rows, H.familiar),
      creators: countField(rows, H.creators),
      money: countField(rows, H.money),
      spentOn: countMulti(rows, H.spentOn),
      motivates: countMulti(rows, H.motivates),
      getLooking: countField(rows, H.getLooking),
      confident: countField(rows, H.confident),
      discover: countMulti(rows, H.discover),
      realAccess: countField(rows, H.realAccess),
      chatter: countField(rows, H.chatter),
      mostly: countMulti(rows, H.mostly),
      deceptive: countField(rows, H.deceptive),
      scam: countMulti(rows, H.scam),
      addiction: countField(rows, H.addiction),
      wc_own: wordCounts(rows, H.ownWords),
      wc_keep: wordCounts(rows, H.keepPaying),
      wc_stop: wordCounts(rows, H.stopped),
      wc_deceived: wordCounts(rows, H.deceived),
      wc_why: wordCounts(rows, H.whySubscribe),
    };
  }, [rows]);

  if (!vizData) return (
    <div style={{ background: BG, color: GREEN, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
      <span style={{ textShadow: `0 0 10px ${GREEN}` }}>LOADING DATA...</span>
    </div>
  );

  const dateRange = rows.length ? (() => {
    const ts = rows.map(r => r["Timestamp"] || "").filter(Boolean);
    return ts.length ? `${ts[0].split(" ")[0]} → ${ts[ts.length - 1].split(" ")[0]}` : "";
  })() : "";

  let vizIdx = 0;
  const sr = (idx: number) => <ScoreRow vizIndex={idx} scores={scores} setScores={setScores} notes={notes} setNotes={setNotes} />;

  return (
    <div style={{ background: BG, color: "#ccc", minHeight: "100vh", padding: "24px 32px", fontFamily: "'JetBrains Mono', 'Space Mono', monospace", cursor: "auto", maxWidth: 1000, margin: "0 auto" }}>
      <style>{`
        
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Mono:wght@400;700&display=swap');
        ::selection { background: ${PINK}40; color: ${PINK}; }
        input::placeholder { color: #444; }
      `}</style>

      {/* Back link */}
      <a href="/" style={{ color: PINK, fontFamily: "monospace", fontSize: 14, textDecoration: "none", textShadow: `0 0 8px ${PINK}` }}>← back</a>

      {/* Header */}
      <div style={{ margin: "40px 0 48px", textAlign: "center" }}>
        <pre style={{ color: PINK, fontSize: 11, lineHeight: 1.2, textShadow: `0 0 20px ${PINK}`, margin: 0 }}>{`
 ██████╗ ███╗   ██╗██╗  ██╗   ██╗███████╗ █████╗ ███╗   ██╗███████╗
██╔═══██╗████╗  ██║██║  ╚██╗ ██╔╝██╔════╝██╔══██╗████╗  ██║██╔════╝
██║   ██║██╔██╗ ██║██║   ╚████╔╝ █████╗  ███████║██╔██╗ ██║███████╗
██║   ██║██║╚██╗██║██║    ╚██╔╝  ██╔══╝  ██╔══██║██║╚██╗██║╚════██║
╚██████╔╝██║ ╚████║███████╗██║   ██║     ██║  ██║██║ ╚████║███████║
 ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝`}</pre>
        <h1 style={{ color: BLUE, fontFamily: "monospace", fontSize: 22, textShadow: `0 0 15px ${BLUE}`, margin: "16px 0 8px", letterSpacing: 3 }}>
          SUBSCRIBER DATA
        </h1>
        <div style={{ color: "#555", fontFamily: "monospace", fontSize: 13 }}>
          {rows.length} responses &nbsp;│&nbsp; {dateRange}
        </div>
      </div>

      {/* ─── SECTION 2: MULTIPLE CHOICE ─── */}

      <AsciiBox title="Which best describes you?" color={PINK} id={`v${vizIdx}`}>
        <HBar data={vizData.desc} color={PINK} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="How familiar are you with how OF works? (1-5)" color={BLUE} id={`v${vizIdx}`}>
        <DotMatrix data={vizData.familiar} color={BLUE} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="How many creators subscribed to?" color={PURPLE} id={`v${vizIdx}`}>
        <HBar data={vizData.creators} color={PURPLE} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="How much money spent (USD)" color={GREEN} id={`v${vizIdx}`}>
        <HBar data={vizData.money} color={GREEN} prefix="$ " />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="What spent most money on" color={PINK} id={`v${vizIdx}`}>
        <CSSPie data={vizData.spentOn} color={PINK} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="What motivates you to subscribe?" color={BLUE} id={`v${vizIdx}`}>
        <HBar data={vizData.motivates} color={BLUE} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="Do you get what you're looking for?" color={GREEN} id={`v${vizIdx}`}>
        <HBar data={vizData.getLooking} color={GREEN} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="How confident talking to the model? (1-5)" color={PURPLE} id={`v${vizIdx}`}>
        <DotMatrix data={vizData.confident} color={PURPLE} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="Where do you discover creators?" color={PINK} id={`v${vizIdx}`}>
        <HBar data={vizData.discover} color={PINK} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="Subscribed because seemed real/accessible?" color={BLUE} id={`v${vizIdx}`}>
        <HBar data={vizData.realAccess} color={BLUE} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="How would you feel if messages were from a chatter?" color={PURPLE} id={`v${vizIdx}`}>
        <HBar data={vizData.chatter} color={PURPLE} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="OnlyFans is mostly..." color={GREEN} id={`v${vizIdx}`}>
        <HBar data={vizData.mostly} color={GREEN} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="Deceptive if using chatters?" color={PINK} id={`v${vizIdx}`}>
        <HBar data={vizData.deceptive} color={PINK} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title='When does OF become a "scam"?' color={BLUE} id={`v${vizIdx}`}>
        <HBar data={vizData.scam} color={BLUE} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title="Struggle with p*rn addiction?" color={PURPLE} id={`v${vizIdx}`}>
        <HBar data={vizData.addiction} color={PURPLE} />
        {sr(vizIdx++)}
      </AsciiBox>

      {/* ─── SECTION 3: WORD CLOUDS ─── */}

      <div style={{ margin: "48px 0 24px", color: GREEN, fontFamily: "monospace", fontSize: 16, textShadow: `0 0 10px ${GREEN}`, letterSpacing: 2 }}>
        {">"} FREE RESPONSE WORD MAPS
      </div>

      <AsciiBox title='"In your own words, what is OnlyFans?"' color={PINK} id={`v${vizIdx}`}>
        <WordCloud words={vizData.wc_own} seed={42} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title='"What makes you keep paying?"' color={BLUE} id={`v${vizIdx}`}>
        <WordCloud words={vizData.wc_keep} seed={137} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title='"What made you stop?"' color={GREEN} id={`v${vizIdx}`}>
        <WordCloud words={vizData.wc_stop} seed={256} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title='"Have you ever felt deceived?"' color={PURPLE} id={`v${vizIdx}`}>
        <WordCloud words={vizData.wc_deceived} seed={512} />
        {sr(vizIdx++)}
      </AsciiBox>

      <AsciiBox title='"Why do people subscribe? What makes it different?"' color={PINK} id={`v${vizIdx}`}>
        <WordCloud words={vizData.wc_why} seed={777} />
        {sr(vizIdx++)}
      </AsciiBox>

      {/* ─── EXPORT ─── */}
      <div style={{ textAlign: "center", margin: "48px 0 80px" }}>
        <button
          onClick={() => {
            const feedback = Object.keys(scores).map(k => ({
              viz: Number(k),
              score: scores[Number(k)],
              note: notes[Number(k)] || "",
            }));
            console.log("=== FEEDBACK EXPORT ===", JSON.stringify(feedback, null, 2));
            alert("Feedback exported to console! (F12 to view)");
          }}
          style={{
            padding: "12px 32px", background: "transparent", border: `2px solid ${GREEN}`,
            color: GREEN, fontFamily: "monospace", fontSize: 16, letterSpacing: 2,
            boxShadow: `0 0 20px ${GREEN}40`, cursor: "auto",
          }}
        >
          [ EXPORT FEEDBACK ]
        </button>
      </div>

      <div style={{ textAlign: "center", color: "#333", fontFamily: "monospace", fontSize: 11, paddingBottom: 40 }}>
        ▓▓▓ LOG OFF WITH LO ▓▓▓
      </div>
    </div>
  );
}
