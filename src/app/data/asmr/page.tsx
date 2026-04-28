"use client";
import { useEffect, useState } from "react";

/* ─── ASCII Banner ─── */
const BANNER = `
 █████╗ ███████╗███╗   ███╗██████╗ 
██╔══██╗██╔════╝████╗ ████║██╔══██╗
███████║███████╗██╔████╔██║██████╔╝
██╔══██║╚════██║██║╚██╔╝██║██╔══██╗
██║  ██║███████║██║ ╚═╝ ██║██║  ██║
╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝
`;

type Response = Record<string, string>;

/* ─── Bar Chart ─── */
function HBar({
  data,
  color,
  total,
  order,
}: {
  data: Record<string, number>;
  color: string;
  total: number;
  order?: string[];
}) {
  const entries = order
    ? order.map((k) => [k, data[k] || 0] as [string, number])
    : Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="space-y-2">
      {entries.map(([label, count]) => (
        <div key={label} className="flex items-center gap-3">
          <span
            className="text-xs text-gray-400 text-right"
            style={{ width: 280, flexShrink: 0, fontFamily: "monospace" }}
          >
            {label}
          </span>
          <div className="flex-1 h-5 bg-gray-900 rounded overflow-hidden relative">
            <div
              className="h-full rounded transition-all duration-500"
              style={{ width: `${(count / max) * 100}%`, backgroundColor: color }}
            />
          </div>
          <span
            className="text-xs text-gray-500 w-12 text-right"
            style={{ fontFamily: "monospace" }}
          >
            {count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Donut Chart ─── */
function Donut({
  data,
  colors,
  total,
}: {
  data: Record<string, number>;
  colors: string[];
  total: number;
}) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  let cumulative = 0;

  return (
    <div className="flex items-center gap-8 flex-wrap">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {entries.map(([, count], i) => {
            const pct = total > 0 ? (count / total) * 100 : 0;
            const offset = cumulative;
            cumulative += pct;
            return (
              <circle
                key={i}
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth="3.5"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={-offset}
              />
            );
          })}
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-gray-300 text-lg font-bold"
          style={{ fontFamily: "monospace" }}
        >
          {total}
        </span>
      </div>
      <div className="space-y-1">
        {entries.map(([label, count], i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-xs text-gray-400" style={{ fontFamily: "monospace" }}>
              {label}: {count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Counter helper ─── */
const CHECKBOX_FIELDS = new Set(["feelings", "content_types"]);

const KNOWN_OPTIONS: Record<string, string[]> = {
  feelings: ["Relaxed", "Sleepy", "Titillated", "Tingles"],
  content_types: [
    "Whisper/soft spoken",
    "Mukbang/eating sounds",
    "Tapping/Crinkling",
    "Roleplay (haircut/doctor/experiment etc)",
    "Visual Only (no sound)",
  ],
};

function countFieldFiltered(
  responses: Response[],
  field: string,
): { known: Record<string, number>; otherItems: string[] } {
  const counts: Record<string, number> = {};
  const otherItems: string[] = [];
  const knownSet = new Set(KNOWN_OPTIONS[field] || []);

  for (const r of responses) {
    const val = r[field];
    if (!val) continue;
    const parts = CHECKBOX_FIELDS.has(field)
      ? val.split(",").map((s) => s.trim())
      : [val];
    for (const p of parts) {
      if (!p) continue;
      if (knownSet.size > 0 && !knownSet.has(p)) {
        otherItems.push(p);
      } else {
        counts[p] = (counts[p] || 0) + 1;
      }
    }
  }
  return { known: counts, otherItems };
}

function countField(responses: Response[], field: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of responses) {
    const val = r[field];
    if (!val) continue;
    // Only split on commas for checkbox fields
    const parts = CHECKBOX_FIELDS.has(field)
      ? val.split(",").map((s) => s.trim())
      : [val];
    for (const p of parts) {
      if (p) counts[p] = (counts[p] || 0) + 1;
    }
  }
  return counts;
}

/* ─── Slides ─── */
function buildSlides(responses: Response[]) {
  const total = responses.length;
  const PINK = "#FF69B4";
  const BLUE = "#00D4FF";
  const PURPLE = "#B388FF";
  const GREEN = "#69FF97";
  const donutColors = [PINK, BLUE, PURPLE, GREEN, "#FFD700", "#FF6B35"];

  return [
    {
      title: "DEMOGRAPHICS",
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: PINK, fontFamily: "monospace" }}>
              GENDER
            </h3>
            <Donut data={countField(responses, "gender")} colors={donutColors} total={total} />
          </div>
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: BLUE, fontFamily: "monospace" }}>
              AGE
            </h3>
            <HBar
              data={countField(responses, "age")}
              color={BLUE}
              total={total}
              order={["Under 18", "18-24", "25-34", "35-44", "45-55", "55+"]}
            />
          </div>
        </div>
      ),
    },
    {
      title: "EXPERIENCE & TRIGGERS",
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: PURPLE, fontFamily: "monospace" }}>
              WHAT DO YOU FEEL?
            </h3>
            {(() => {
              const { known, otherItems } = countFieldFiltered(responses, "feelings");
              return (
                <>
                  <HBar data={known} color={PURPLE} total={total} />
                  {otherItems.length > 0 && (
                    <p className="text-xs text-gray-500 mt-3 italic" style={{ fontFamily: "monospace" }}>
                      Other responses ({otherItems.length}): {[...new Set(otherItems)].join(", ")}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: GREEN, fontFamily: "monospace" }}>
              TINGLE EXPERIENCE
            </h3>
            <HBar data={countField(responses, "tingles")} color={GREEN} total={total} />
          </div>
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: PINK, fontFamily: "monospace" }}>
              CONTENT TYPES WATCHED
            </h3>
            {(() => {
              const { known, otherItems } = countFieldFiltered(responses, "content_types");
              return (
                <>
                  <HBar data={known} color={PINK} total={total} />
                  {otherItems.length > 0 && (
                    <p className="text-xs text-gray-500 mt-3 italic" style={{ fontFamily: "monospace" }}>
                      Other responses ({otherItems.length}): {[...new Set(otherItems)].join(", ")}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      ),
    },
    {
      title: "DISCOVERY & MOTIVATION",
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: BLUE, fontFamily: "monospace" }}>
              WHEN DID YOU DISCOVER ASMR?
            </h3>
            <HBar
              data={countField(responses, "discovery")}
              color={BLUE}
              total={total}
              order={["Before 2015", "2015-2019", "2020-2022", "2023-Now"]}
            />
          </div>
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: PURPLE, fontFamily: "monospace" }}>
              #1 REASON FOR WATCHING
            </h3>
            <HBar data={countField(responses, "reason")} color={PURPLE} total={total} />
          </div>
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: GREEN, fontFamily: "monospace" }}>
              FOLLOW FOR CREATOR OR CONTENT?
            </h3>
            <Donut data={countField(responses, "follow_reason")} colors={donutColors} total={total} />
          </div>
        </div>
      ),
    },
    {
      title: "CREATORS & MONEY",
      content: (
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: PINK, fontFamily: "monospace" }}>
              CREATOR GENDER USUALLY WATCHED
            </h3>
            <Donut data={countField(responses, "creator_gender")} colors={donutColors} total={total} />
          </div>
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: BLUE, fontFamily: "monospace" }}>
              WOULD YOU PAY FOR ASMR?
            </h3>
            <HBar data={countField(responses, "would_pay")} color={BLUE} total={total} />
          </div>
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: PURPLE, fontFamily: "monospace" }}>
              ONLYFANS SUBSCRIBER?
            </h3>
            <Donut data={countField(responses, "onlyfans_sub")} colors={donutColors} total={total} />
          </div>
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: GREEN, fontFamily: "monospace" }}>
              ASMR FOR KIDS — APPROPRIATE?
            </h3>
            <Donut data={countField(responses, "kids_appropriate")} colors={donutColors} total={total} />
          </div>
        </div>
      ),
    },
    {
      title: "IN THEIR OWN WORDS",
      content: (() => {
        const whyLike = responses.filter((r) => r.why_like).length;
        const whyPopular = responses.filter((r) => r.why_popular).length;
        const otherThoughts = responses.filter((r) => r.other_thoughts).length;

        function summarize(responses: Response[], field: string): string {
          const vals = responses.map((r) => r[field]).filter(Boolean);
          if (vals.length === 0) return "No responses yet.";
          // Group common themes
          const themes: Record<string, number> = {};
          const keywords: Record<string, string[]> = {
            relaxation: ["relax", "calm", "peace", "sooth", "wind down", "destress"],
            sleep: ["sleep", "insomnia", "bed", "drift off", "knock out"],
            stress: ["stress", "anxiety", "anxious", "tension", "overwhelm"],
            tingles: ["tingle", "sensation", "brain", "spine", "shiver"],
            comfort: ["comfort", "safe", "cozy", "warm", "hug"],
            loneliness: ["lonely", "alone", "companion", "company", "connection", "intimacy"],
            escapism: ["escape", "distract", "zone out", "forget", "block out"],
            sensory: ["sound", "visual", "audio", "noise", "trigger"],
          };
          for (const v of vals) {
            const lower = v.toLowerCase();
            let matched = false;
            for (const [theme, words] of Object.entries(keywords)) {
              if (words.some((w) => lower.includes(w))) {
                themes[theme] = (themes[theme] || 0) + 1;
                matched = true;
              }
            }
            if (!matched) themes["other"] = (themes["other"] || 0) + 1;
          }
          const sorted = Object.entries(themes)
            .filter(([k]) => k !== "other")
            .sort((a, b) => b[1] - a[1]);
          if (sorted.length === 0) return `${vals.length} responses received. Themes are still emerging as more data comes in.`;
          const top = sorted.slice(0, 4).map(([theme, count]) => {
            const pct = Math.round((count / vals.length) * 100);
            const labels: Record<string, string> = {
              relaxation: "relaxation and calm",
              sleep: "falling asleep",
              stress: "stress and anxiety relief",
              tingles: "the tingle sensation itself",
              comfort: "comfort and safety",
              loneliness: "connection and companionship",
              escapism: "escapism and distraction",
              sensory: "the sensory experience",
            };
            return `${labels[theme] || theme} (~${pct}%)`;
          });
          return `Across ${vals.length} responses, the dominant themes are: ${top.join(", ")}. ${sorted.length > 4 ? "Other themes also appear in smaller numbers." : ""}`;
        }

        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-bold mb-3" style={{ color: PINK, fontFamily: "monospace" }}>
                WHY DO YOU LIKE ASMR? ({whyLike} responses)
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed border-l-2 pl-3" style={{ borderColor: PINK, fontFamily: "monospace" }}>
                {summarize(responses, "why_like")}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-3" style={{ color: BLUE, fontFamily: "monospace" }}>
                WHY IS ASMR SO POPULAR? ({whyPopular} responses)
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed border-l-2 pl-3" style={{ borderColor: BLUE, fontFamily: "monospace" }}>
                {summarize(responses, "why_popular")}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-3" style={{ color: PURPLE, fontFamily: "monospace" }}>
                OTHER THOUGHTS ({otherThoughts} responses)
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed border-l-2 pl-3" style={{ borderColor: PURPLE, fontFamily: "monospace" }}>
                {summarize(responses, "other_thoughts")}
              </p>
            </div>
          </div>
        );
      })(),
    },
  ];
}

export default function ASMRDataPage() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [slide, setSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/survey/asmr")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setResponses(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const slides = buildSlides(responses);

  return (
    <div className="min-h-screen bg-black px-4 py-8" style={{ cursor: 'url("/pixel-cursor.svg"), auto' }}>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <a
          href="/"
          style={{ color: "#FF69B4", fontFamily: "monospace", fontSize: 13, textDecoration: "none", textShadow: "0 0 8px #FF69B4" }}
        >
          ← home
        </a>

        {/* ASCII Banner */}
        <pre
          className="text-center text-xs md:text-sm leading-tight mb-2 select-none"
          style={{ color: "#FF69B4", fontFamily: "monospace" }}
        >
          {BANNER}
        </pre>
        <h2
          className="text-center text-sm tracking-widest mb-8"
          style={{ color: "#B388FF", fontFamily: "monospace" }}
        >
          SURVEY DATA — {responses.length} RESPONSES
        </h2>

        {/* Nav */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="px-3 py-1 rounded text-xs font-bold transition-all"
              style={{
                fontFamily: "monospace",
                backgroundColor: slide === i ? "#FF69B4" : "transparent",
                color: slide === i ? "#000" : "#666",
                border: `1px solid ${slide === i ? "#FF69B4" : "#333"}`,
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-center text-gray-500" style={{ fontFamily: "monospace" }}>
            LOADING DATA...
          </p>
        ) : responses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm mb-4" style={{ fontFamily: "monospace" }}>
              NO RESPONSES YET
            </p>
            <a
              href="/survey/asmr"
              className="inline-block px-6 py-2 rounded border text-xs font-bold"
              style={{ borderColor: "#00D4FF", color: "#00D4FF", fontFamily: "monospace" }}
            >
              BE THE FIRST →
            </a>
          </div>
        ) : (
          <div className="animate-fade-in">{slides[slide].content}</div>
        )}

        {/* Footer nav */}
        <div className="flex justify-between mt-12">
          <button
            onClick={() => setSlide((s) => Math.max(0, s - 1))}
            disabled={slide === 0}
            className="text-xs px-4 py-2 border rounded disabled:opacity-30"
            style={{ color: "#00D4FF", borderColor: "#333", fontFamily: "monospace" }}
          >
            ← PREV
          </button>
          <button
            onClick={() => setSlide((s) => Math.min(slides.length - 1, s + 1))}
            disabled={slide === slides.length - 1}
            className="text-xs px-4 py-2 border rounded disabled:opacity-30"
            style={{ color: "#00D4FF", borderColor: "#333", fontFamily: "monospace" }}
          >
            NEXT →
          </button>
        </div>
      </div>
    </div>
  );
}
