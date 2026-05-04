import { useState } from "react";
import API from "../services/api";

const PRESET_TIMES = [10, 30, 45, 60, 90, 120];

function formatTime(s) {
  if (s >= 60) {
    const m = Math.floor(s / 60), r = s % 60;
    return r ? `${m}m ${r}s` : `${m}m`;
  }
  return `${s}s`;
}

export default function AddQuestions({ testData, onDone }) {
  const [current, setCurrent] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [questions, setQuestions] = useState(
    Array(testData.totalQuestions).fill(null).map(() => ({
      question: "", options: ["", "", "", ""], correctAnswer: 0, time: 30,
    }))
  );

  const q = questions[current];

  const update = (data) => {
    const updated = [...questions];
    updated[current] = { ...updated[current], ...data };
    setQuestions(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await API.post("/question/questions", {
        testId: testData._id,
        questions: questions.map(({ question, options, correctAnswer, time }) => ({
          question, options, correctAnswer, time,
        })),
      });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Is the server running?");
    } finally {
      setSaving(false);
    }
  };

  // ── Done / Success screen ──────────────────────────────────────
  if (saved) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow p-8 text-center w-96">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-1">Test Saved!</h2>
        <p className="text-gray-500 text-sm mb-6">
          "{testData.title}" · {testData.totalQuestions} questions · {testData.topic}
        </p>
        <button
          onClick={onDone}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium"
        >
          + Add Another Test
        </button>
      </div>
    </div>
  );

  // ── Review screen ──────────────────────────────────────────────
  if (showReview) return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-1">{testData.title}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {testData.topic} · {testData.totalQuestions} questions
        </p>

        {questions.map((q, i) => (
          <div key={i} className="border rounded-lg p-4 mb-3">
            <p className="text-xs text-gray-400 mb-1">Q{i + 1} · {formatTime(q.time)}</p>
            <p className="font-medium mb-2">
              {q.question || <span className="italic text-gray-300">No question entered</span>}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {q.options.map((opt, j) => (
                <div key={j} className={`text-xs px-2 py-1 rounded ${
                  q.correctAnswer === j
                    ? "bg-green-100 text-green-700 font-medium"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {j + 1}. {opt || "—"}
                </div>
              ))}
            </div>
          </div>
        ))}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowReview(false)}
            className="flex-1 border rounded px-4 py-2"
          >
            ← Edit
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-green-500 text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Test ✓"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Question editor ────────────────────────────────────────────
  const isLastQuestion = current === testData.totalQuestions - 1;
  const allFilled = questions.every(q => q.question.trim() !== "" && q.options.every(o => o.trim() !== ""));

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow w-[500px]">

        {/* Header */}
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-bold">
            Question {current + 1}{" "}
            <span className="text-gray-400 font-normal">/ {testData.totalQuestions}</span>
          </h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
            {testData.topic}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 rounded mb-4">
          <div
            className="h-full bg-green-500 rounded transition-all"
            style={{ width: `${((current + 1) / testData.totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question input */}
        <input
          placeholder="Type your question here..."
          className="w-full p-2 border mb-3 rounded"
          value={q.question}
          onChange={(e) => update({ question: e.target.value })}
        />

        {/* Options */}
        <p className="text-xs text-gray-400 mb-2">Options — click row to mark as correct</p>
        {q.options.map((opt, i) => (
          <div
            key={i}
            onClick={() => update({ correctAnswer: i })}
            className={`flex items-center gap-2 p-2 border rounded mb-2 cursor-pointer transition-colors ${
              q.correctAnswer === i ? "border-blue-400 bg-blue-50" : "hover:border-gray-400"
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              q.correctAnswer === i ? "border-blue-500 bg-blue-500" : "border-gray-300"
            }`}>
              {q.correctAnswer === i && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <input
              placeholder={`Option ${i + 1}`}
              value={opt}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 border-none outline-none bg-transparent text-sm"
              onChange={(e) => {
                const o = [...q.options];
                o[i] = e.target.value;
                update({ options: o });
              }}
            />
            <span className={`text-xs ${q.correctAnswer === i ? "text-blue-500" : "text-gray-300"}`}>
              {q.correctAnswer === i ? "correct" : "click to set"}
            </span>
          </div>
        ))}

        {/* Time limit */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-1">Time limit</label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="number" min="5" max="300" value={q.time}
              className="w-20 p-2 border rounded text-sm"
              onChange={(e) => update({ time: Number(e.target.value) })}
            />
            <span className="text-sm text-gray-500">seconds</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {PRESET_TIMES.map((t) => (
              <button
                key={t}
                onClick={() => update({ time: t })}
                className={`px-3 py-1 text-xs rounded border transition-colors ${
                  q.time === t ? "bg-blue-500 text-white border-blue-500" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {formatTime(t)}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-2">
          <button
            disabled={current === 0}
            onClick={() => setCurrent(current - 1)}
            className="bg-gray-100 px-4 py-2 rounded disabled:opacity-40"
          >
            ← Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={() => setShowReview(true)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Review & Save →
            </button>
          ) : (
            <button
              onClick={() => setCurrent(current + 1)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Next →
            </button>
          )}
        </div>

        {/* Done button — shown only on last question when all filled */}
        {isLastQuestion && allFilled && (
          <button
            onClick={() => setShowReview(true)}
            className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg font-medium"
          >
            ✓ All Done — Review Test
          </button>
        )}
      </div>
    </div>
  );
}
