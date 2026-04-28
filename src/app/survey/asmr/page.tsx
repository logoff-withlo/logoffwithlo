"use client";
import { useState } from "react";

const QUESTIONS = [
  {
    id: "gender",
    text: "What is your gender?",
    type: "radio",
    options: ["Male", "Female", "Non-Binary/Other"],
    required: true,
  },
  {
    id: "age",
    text: "What is your age?",
    type: "radio",
    options: ["Under 18", "18-24", "25-34", "35-44", "45-55", "55+"],
    required: true,
  },
  {
    id: "feelings",
    text: "What do you feel when you watch/listen to ASMR content?",
    type: "checkbox",
    options: ["Relaxed", "Sleepy", "Titillated", "Tingles"],
    allowOther: true,
    required: false,
  },
  {
    id: "tingles",
    text: 'Do you experience ASMR "tingles?"',
    type: "radio",
    options: [
      "Yes, strongly",
      "Sometimes, depending on the trigger",
      "Rarely or mildly",
      "Never — it does nothing for me",
      "It actively annoys me (misophonia camp)",
    ],
    required: false,
  },
  {
    id: "discovery",
    text: "When did you discover ASMR?",
    type: "radio",
    options: ["Before 2015", "2015-2019", "2020-2022", "2023-Now"],
    required: true,
  },
  {
    id: "reason",
    text: "What's your #1 reason for watching ASMR?",
    type: "radio",
    options: [
      "Falling Asleep",
      "Reducing Stress/Anxiety",
      "It makes me feel good",
      "Background noise while doing other things",
      "I watch for a specific creator",
    ],
    required: false,
  },
  {
    id: "creators_followed",
    text: "What ASMRtists do you follow/subscribe to?",
    type: "text",
    required: true,
  },
  {
    id: "follow_reason",
    text: "Of the ASMR creators you follow, do you follow them because...",
    type: "radio",
    options: [
      "You enjoy the creator themselves",
      "You enjoy the product/sensations the content provides",
    ],
    required: true,
  },
  {
    id: "content_types",
    text: "What kind of ASMR have you watched?",
    type: "checkbox",
    options: [
      "Whisper/soft spoken",
      "Mukbang/eating sounds",
      "Tapping/Crinkling",
      "Roleplay (haircut/doctor/experiment etc)",
      "Visual Only (no sound)",
    ],
    required: false,
  },
  {
    id: "creator_gender",
    text: "What gender of creator do you USUALLY watch?",
    type: "radio",
    options: ["Female", "Male", "Non-Binary/Other"],
    required: false,
  },
  {
    id: "kids_appropriate",
    text: "Do you think ASMR targeted towards kids is appropriate?",
    type: "radio",
    options: ["Yes", "No"],
    required: false,
  },
  {
    id: "would_pay",
    text: "Would you pay for ASMR content? (Patreon, exclusives, fan sites)",
    type: "radio",
    options: ["I already do", "I'd consider it", "No"],
    required: true,
  },
  {
    id: "onlyfans_sub",
    text: "Have you ever subscribed or do you currently subscribe to OnlyFans accounts?",
    type: "radio",
    options: ["Yes", "No"],
    required: true,
  },
  {
    id: "why_like",
    text: "In your own words, why do you like ASMR?",
    type: "textarea",
    required: false,
  },
  {
    id: "why_popular",
    text: "Why do you think ASMR is so popular?",
    type: "textarea",
    required: true,
  },
  {
    id: "other_thoughts",
    text: "Any other thoughts/concerns on ASMR that you'd like to discuss?",
    type: "textarea",
    required: false,
  },
];

export default function ASMRSurveyPage() {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [otherValues, setOtherValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateAnswer = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const toggleCheckbox = (id: string, option: string) => {
    const current = (answers[id] as string[]) || [];
    if (current.includes(option)) {
      updateAnswer(id, current.filter((o) => o !== option));
    } else {
      updateAnswer(id, [...current, option]);
    }
  };

  const handleSubmit = async () => {
    // Validate required
    for (const q of QUESTIONS) {
      if (q.required) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0) || val === "") {
          setError(`Please answer: "${q.text}"`);
          return;
        }
      }
    }
    setError("");
    setSubmitting(true);

    // Merge "Other" values into checkbox answers
    const payload: Record<string, string | string[]> = { ...answers };
    for (const q of QUESTIONS) {
      if (q.type === "checkbox" && (q as any).allowOther && otherValues[q.id]) {
        const arr = (payload[q.id] as string[]) || [];
        payload[q.id] = [...arr, otherValues[q.id]];
      }
    }

    try {
      const res = await fetch("/api/survey/asmr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Submit failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: "#FF69B4", fontFamily: "monospace" }}
          >
            THANK YOU!
          </h1>
          <p className="text-gray-300 text-lg mb-6" style={{ fontFamily: "monospace" }}>
            Your response has been recorded. Want to see what others said?
          </p>
          <a
            href="/data/asmr"
            className="inline-block px-6 py-3 rounded border text-sm font-bold transition-all hover:scale-105"
            style={{
              borderColor: "#00D4FF",
              color: "#00D4FF",
              fontFamily: "monospace",
            }}
          >
            VIEW RESULTS →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <a
          href="/"
          style={{ color: "#FF69B4", fontFamily: "monospace", fontSize: 13, textDecoration: "none", textShadow: "0 0 8px #FF69B4" }}
        >
          ← home
        </a>

        {/* Header */}
        <div className="text-center mb-6 mt-6">
          <pre
            className="text-xs md:text-sm leading-tight mb-2 select-none"
            style={{ color: "#FF69B4", fontFamily: "monospace" }}
          >{`
 █████╗ ███████╗███╗   ███╗██████╗ 
██╔══██╗██╔════╝████╗ ████║██╔══██╗
███████║███████╗██╔████╔██║██████╔╝
██╔══██║╚════██║██║╚██╔╝██║██╔══██╗
██║  ██║███████║██║ ╚═╝ ██║██║  ██║
╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝`}</pre>
        </div>

        {/* CTA Banner */}
        <div
          className="text-center mb-8 py-3 rounded border"
          style={{
            borderColor: "#69FF9740",
            backgroundColor: "#69FF9710",
            color: "#69FF97",
            fontFamily: "monospace",
            fontSize: 13,
          }}
        >
          📋 Take the survey to see the results!
        </div>

        <div className="text-center mb-12">
          <p
            className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto"
            style={{ fontFamily: "monospace" }}
          >
            I&apos;m working on a YouTube video about the background, history, neuroscience
            and uses of ASMR. If you have ever intentionally consumed ASMR content (even
            once), I&apos;d love your input! No identifiable information is collected.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-10">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="group">
              <label
                className="block text-sm font-bold mb-3"
                style={{ color: "#B388FF", fontFamily: "monospace" }}
              >
                {q.text}
                {q.required && <span style={{ color: "#FF69B4" }}> *</span>}
              </label>

              {q.type === "radio" && (
                <div className="space-y-2">
                  {q.options!.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded transition-colors hover:bg-gray-900"
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === opt}
                        onChange={() => updateAnswer(q.id, opt)}
                        className="accent-pink-500 w-4 h-4"
                      />
                      <span
                        className="text-gray-300 text-sm"
                        style={{ fontFamily: "monospace" }}
                      >
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === "checkbox" && (
                <div className="space-y-2">
                  {q.options!.map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded transition-colors hover:bg-gray-900"
                    >
                      <input
                        type="checkbox"
                        checked={((answers[q.id] as string[]) || []).includes(opt)}
                        onChange={() => toggleCheckbox(q.id, opt)}
                        className="accent-pink-500 w-4 h-4"
                      />
                      <span
                        className="text-gray-300 text-sm"
                        style={{ fontFamily: "monospace" }}
                      >
                        {opt}
                      </span>
                    </label>
                  ))}
                  {(q as any).allowOther && (
                    <div className="flex items-center gap-3 px-3 py-2">
                      <span
                        className="text-gray-500 text-sm"
                        style={{ fontFamily: "monospace" }}
                      >
                        Other:
                      </span>
                      <input
                        type="text"
                        value={otherValues[q.id] || ""}
                        onChange={(e) =>
                          setOtherValues((p) => ({ ...p, [q.id]: e.target.value }))
                        }
                        className="flex-1 bg-transparent border-b border-gray-700 text-gray-300 text-sm outline-none focus:border-pink-500 px-1 py-0.5"
                        style={{ fontFamily: "monospace" }}
                        placeholder="type here..."
                      />
                    </div>
                  )}
                </div>
              )}

              {q.type === "text" && (
                <input
                  type="text"
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  className="w-full bg-transparent border-b border-gray-700 text-gray-300 text-sm outline-none focus:border-pink-500 px-1 py-2"
                  style={{ fontFamily: "monospace" }}
                  placeholder="type here..."
                />
              )}

              {q.type === "textarea" && (
                <textarea
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => updateAnswer(q.id, e.target.value)}
                  rows={3}
                  className="w-full bg-gray-950 border border-gray-800 rounded text-gray-300 text-sm outline-none focus:border-pink-500 px-3 py-2 resize-none"
                  style={{ fontFamily: "monospace" }}
                  placeholder="type here..."
                />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p
            className="mt-6 text-sm text-center"
            style={{ color: "#FF69B4", fontFamily: "monospace" }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <div className="mt-12 text-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 rounded font-bold text-sm transition-all hover:scale-105 disabled:opacity-50"
            style={{
              backgroundColor: "#FF69B4",
              color: "#000",
              fontFamily: "monospace",
            }}
          >
            {submitting ? "SUBMITTING..." : "SUBMIT"}
          </button>
        </div>

        <p
          className="text-center text-gray-600 text-xs mt-6"
          style={{ fontFamily: "monospace" }}
        >
          logoffwithlo.com
        </p>
      </div>
    </div>
  );
}
