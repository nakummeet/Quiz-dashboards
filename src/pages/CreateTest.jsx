import { useState } from "react";
import API from "../services/api";

export default function CreateTest({ setTestData }) {
  const [form, setForm] = useState({ title: "", topic: "", totalQuestions: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!form.title) return setError("Please enter a test title");
    if (!form.topic) return setError("Please select a topic");
    if (form.totalQuestions < 1) return setError("Minimum 1 question required");

    setLoading(true);
    setError("");
    try {
      const res = await API.post("/test/create", form);
      setTestData({ ...form, _id: res.data.data._id });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow w-96">
        <h2 className="text-xl font-bold mb-1">Create Test</h2>
        <p className="text-sm text-gray-400 mb-4">Fill in the details to get started</p>

        <label className="text-xs text-gray-400 block mb-1">Test Title</label>
        <input
          placeholder="e.g. OOP Mid Semester"
          className="w-full p-2 border mb-3 rounded"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <label className="text-xs text-gray-400 block mb-1">Topic</label>
        <select
          className="w-full p-2 border mb-3 rounded"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        >
          <option value="">Select Topic</option>
          <option>OOP</option>
          <option>DBMS</option>
          <option>DSA</option>
          <option>OS</option>
          <option>CN</option>
        </select>

        <label className="text-xs text-gray-400 block mb-1">Number of Questions (min 1)</label>
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setForm({ ...form, totalQuestions: Math.max(1, form.totalQuestions - 1) })}
            className="w-9 h-9 border rounded text-lg font-bold text-gray-500 hover:bg-gray-100"
          >−</button>
          <input
            type="number"
            min="1"
            className="flex-1 p-2 border rounded text-center"
            value={form.totalQuestions}
            onChange={(e) => setForm({ ...form, totalQuestions: Math.max(1, +e.target.value) })}
          />
          <button
            onClick={() => setForm({ ...form, totalQuestions: form.totalQuestions + 1 })}
            className="w-9 h-9 border rounded text-lg font-bold text-gray-500 hover:bg-gray-100"
          >+</button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Test →"}
        </button>
      </div>
    </div>
  );
}
