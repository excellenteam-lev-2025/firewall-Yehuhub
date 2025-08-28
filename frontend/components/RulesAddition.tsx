"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X } from "lucide-react";

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
    <div className="bg-background min-h-screen flex justify-center items-start p-10">
      <div className="border bg-secondary rounded-xl shadow-lg w-full max-w-2xl p-8">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          Add Firewall Rules
        </h1>

        <div className="flex justify-center align-center">
          <div className="flex flex-col mb-6 mr-6 w-1/3">
            <label htmlFor="ruleType" className="mb-2">
              Rule Type
            </label>

            <Select
              value={rulesType}
              onValueChange={(value) => setRulesType(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Type</SelectLabel>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="ip">IP</SelectItem>
                  <SelectItem value="port">Port</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col mb-6 w-1/3">
            <label htmlFor="ruleMode" className="mb-2">
              Rule Mode
            </label>
            <Select
              value={rulesMode}
              onValueChange={(value) => setRulesMode(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Mode</SelectLabel>
                  <SelectItem value="whitelist">Whitelist</SelectItem>
                  <SelectItem value="blacklist">Blacklist</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col space-y-4">
          {rulesAdditionList.map((rule, index) => (
            <div
              key={rule.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-md border border-gray-500"
            >
              <label
                htmlFor={rule.id}
                className="text-white font-medium w-full sm:w-24"
              >
                Rule {index + 1}
              </label>
              <Input
                id={rule.id}
                type="text"
                placeholder="Enter Rule"
                onChange={(e) =>
                  setRulesAdditionList((prev) =>
                    prev.map((r) =>
                      r.id === rule.id ? { ...r, value: e.target.value } : r
                    )
                  )
                }
              />
              <Button
                variant="destructive"
                type="button"
                onClick={() =>
                  setRulesAdditionList((prev) =>
                    prev.filter((r) => r.id !== rule.id)
                  )
                }
              >
                <X />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6 gap-4">
          <Button
            variant="secondary"
            type="button"
            onClick={() =>
              setRulesAdditionList([
                ...rulesAdditionList,
                { id: uuidv4(), value: "" },
              ])
            }
            disabled={loading}
          >
            Add Rule
          </Button>

          <Button type="button" onClick={addRules} disabled={loading}>
            Submit
          </Button>
        </div>
        {(loading || error || data) && (
          <div className="flex justify-center mt-6 border p-2 rounded-lg ">
            {loading && <p className="text-yellow-300">Submitting rules...</p>}
            {error && <p className="text-destructive">{error}</p>}
            {data && <p className="">Rules submitted successfully!</p>}
          </div>
        )}
      </div>
    </div>
  );
};
