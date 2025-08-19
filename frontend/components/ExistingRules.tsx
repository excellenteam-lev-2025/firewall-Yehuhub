"use client";

import { useState, useEffect } from "react";

interface Rule {
  id: number;
  value: string | number;
  active: boolean;
}

interface RulesByMode {
  blacklist: Rule[];
  whitelist: Rule[];
}

interface FirewallResponse {
  ips: RulesByMode;
  urls: RulesByMode;
  ports: RulesByMode;
}

const API_URL = "http://localhost:3000/api/firewall/rules";

export const ExistingRules = () => {
  const [activeTab, setActiveTab] = useState<"urls" | "ips" | "ports">("urls");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>("");
  const [data, setData] = useState<FirewallResponse | null>(null);

  const tabs = [
    { key: "urls", label: "URLs" },
    { key: "ips", label: "IPs" },
    { key: "ports", label: "Ports" },
  ] as const;

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to fetch rules");
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const toggleRuleActive = async (
    category: keyof FirewallResponse,
    mode: "blacklist" | "whitelist",
    id: number
  ) => {
    if (!data) return;

    const ruleToToggle = data[category][mode].find((r) => r.id === id);
    if (!ruleToToggle) return;

    const newActiveStatus = !ruleToToggle.active;

    const body: Record<
      string,
      { ids: number[]; mode: "blacklist" | "whitelist"; active: boolean } | null
    > = {};
    body[category] = { ids: [id], mode, active: newActiveStatus };
    try {
      const res = await fetch(API_URL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Failed to update rule: ${res.status}`);

      // Update local state
      setData((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated[category][mode] = updated[category][mode].map((r) =>
          r.id === id ? { ...r, active: newActiveStatus } : r
        );
        return updated;
      });
    } catch (err: any) {
      alert(err.message || "Failed to update rule");
    }
  };

  const renderRulesList = (
    category: keyof FirewallResponse,
    mode: "blacklist" | "whitelist",
    rules: Rule[]
  ) => {
    if (rules.length === 0) return <p className="text-gray-300">No rules</p>;
    return (
      <ul className="space-y-2">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className="flex justify-between items-center p-2 bg-gray-600 rounded border border-gray-500 text-white"
          >
            <span>{rule.value}</span>
            <button
              onClick={() => toggleRuleActive(category, mode, rule.id)}
              className={`px-4 py-1 rounded font-medium transition ${
                rule.active
                  ? "bg-green-700 hover:bg-green-600"
                  : "bg-red-700 hover:bg-red-600"
              }`}
            >
              {rule.active ? "Active" : "Inactive"}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const renderTabContent = () => {
    if (loading) return <p className="text-yellow-300">Loading...</p>;
    if (error) return <p className="text-red-400">{error}</p>;
    if (!data) return null;

    const current = data[activeTab];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl text-white mb-2">Blacklist</h2>
          {renderRulesList(activeTab, "blacklist", current.blacklist)}
        </div>
        <div>
          <h2 className="text-xl text-white mb-2">Whitelist</h2>
          {renderRulesList(activeTab, "whitelist", current.whitelist)}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 min-h-screen flex flex-col items-center p-10">
      <h1 className="text-4xl font-bold text-white mb-8">Existing Rules</h1>

      <div className="flex space-x-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 rounded-lg font-medium transition 
              ${
                activeTab === tab.key
                  ? "bg-blue-500 text-white"
                  : "bg-gray-600 text-gray-200 hover:bg-gray-500"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-700 rounded-xl shadow-lg w-full max-w-3xl p-8">
        {renderTabContent()}
      </div>
    </div>
  );
};
