"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Rules {
  id: string;
  value: string;
}

const API_URL = "http://localhost:3000/api/firewall";

export const RulesAddition = () => {
  const [rulesAdditionList, setRulesAdditionList] = useState<Rules[]>([
    { id: uuidv4(), value: "" },
  ]);
  const [rulesType, setRulesType] = useState<string>("url");
  const [rulesMode, setRulesMode] = useState<string>("blacklist");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<string>("");

  const addRules = async () => {
    setLoading(true);
    setError(null);
    setData("");
    const reqBody = {
      mode: rulesMode,
      values: rulesAdditionList.map((val) => val.value),
    };
    try {
      const response = await fetch(`${API_URL}/${rulesType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      const json = await response.json();
      if (!response.ok) {
        // If the backend sends structured validation errors
        if (json.errors && Array.isArray(json.errors)) {
          const combined = json.errors.map((e: any) => e.message).join(", ");
          throw new Error(combined || "Validation failed");
        }
        // Fallback if no structured errors
        throw new Error(
          json.error || `Request failed with status ${response.status}`
        );
      }
      setData(json);
      setRulesAdditionList([{ id: uuidv4(), value: "" }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 min-h-screen flex justify-center items-start p-10">
      <div className="bg-gray-700 rounded-xl shadow-lg w-full max-w-2xl p-8">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          Add Firewall Rules
        </h1>

        <div className="flex justify-center align-center">
          <div className="flex flex-col mb-6 mr-6 w-1/3">
            <label htmlFor="ruleType" className="mb-2">
              Rule Type
            </label>
            <select
              id="ruleType"
              value={rulesType}
              onChange={(e) => setRulesType(e.target.value)}
              className="p-2 rounded-lg border border-gray-400"
            >
              <option value="url">URL</option>
              <option value="ip">IP</option>
              <option value="port">Port</option>
            </select>
          </div>

          <div className="flex flex-col mb-6 w-1/3">
            <label htmlFor="ruleMode" className="mb-2">
              Rule Mode
            </label>
            <select
              id="ruleMode"
              value={rulesMode}
              onChange={(e) => setRulesMode(e.target.value)}
              className="p-2 rounded-lg border border-gray-400"
            >
              <option value="blacklist">Blacklist</option>
              <option value="whitelist">Whitelist</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          {rulesAdditionList.map((rule, index) => (
            <div
              key={rule.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-gray-600 rounded-md border border-gray-500"
            >
              <label
                htmlFor={rule.id}
                className="text-white font-medium w-full sm:w-24"
              >
                Rule {index + 1}
              </label>
              <input
                id={rule.id}
                type="text"
                placeholder="Enter rule"
                className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) =>
                  setRulesAdditionList((prev) =>
                    prev.map((r) =>
                      r.id === rule.id ? { ...r, value: e.target.value } : r
                    )
                  )
                }
              />
              <button
                type="button"
                onClick={() =>
                  setRulesAdditionList((prev) =>
                    prev.filter((r) => r.id !== rule.id)
                  )
                }
                className="text-red-400 font-bold px-3 py-1 rounded hover:bg-red-600 hover:text-white transition"
              >
                X
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6 gap-4">
          <button
            type="button"
            className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-400 text-white font-medium transition"
            onClick={() =>
              setRulesAdditionList([
                ...rulesAdditionList,
                { id: uuidv4(), value: "" },
              ])
            }
            disabled={loading}
          >
            Add Rule
          </button>

          <button
            type="button"
            className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition"
            onClick={addRules}
            disabled={loading}
          >
            Submit
          </button>
        </div>
        {(loading || error || data) && (
          <div className="flex justify-center mt-6  bg-gray-600 border border-gray-400 p-2 rounded-lg ">
            {loading && <p className="text-yellow-300">Submitting rules...</p>}
            {error && <p className="text-red-400 font-bold">{error}</p>}
            {data && (
              <p className="text-green-400">Rules submitted successfully!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
