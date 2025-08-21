"use client";

import { useState, useEffect } from "react";
import { TabContent } from "./TabContent";
import { FirewallResponse, Rule } from "@/types/firewall";
import { Button } from "./ui/button";

const API_URL = "http://localhost:3000/api/firewall";

const categoryMap: Record<string, string> = {
  ips: "ip",
  ports: "port",
  urls: "url",
};

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
        const res = await fetch(`${API_URL}/rules`);
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
      const res = await fetch(`${API_URL}/rules`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Failed to update rule: ${res.status}`);

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

  const deleteRule = async (
    rule: Rule,
    mode: "blacklist" | "whitelist",
    category: keyof FirewallResponse
  ) => {
    if (!data) return;

    const ruleToDelete = data[category][mode].find((r) => r.id === rule.id);
    if (!ruleToDelete) return;

    const body = { values: [rule.value], mode };
    const endpoint = categoryMap[category];

    console.log(body, `${API_URL}/${endpoint}`);
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Failed to delete rule: ${res.status}`);

      setData((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated[category][mode] = updated[category][mode].filter(
          (r) => r.id !== rule.id
        );
        return updated;
      });
    } catch (err: any) {
      alert(err.message || "Failed to delete rule");
    }
  };

  return (
    <div className=" min-h-screen flex flex-col items-center p-10">
      <h1 className="text-4xl font-bold mb-8">Existing Rules</h1>

      <div className="flex space-x-4 mb-8">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            variant={activeTab === tab.key ? "default" : "secondary"}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="bg-secondary border rounded-xl shadow-lg w-full max-w-3xl p-8">
        {
          <TabContent
            loading={loading}
            error={error}
            data={data}
            activeTab={activeTab}
            toggleRuleActive={toggleRuleActive}
            deleteRule={deleteRule}
          />
        }
      </div>
    </div>
  );
};
