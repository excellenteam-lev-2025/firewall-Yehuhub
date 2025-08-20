import { FirewallResponse, Rule } from "@/types/firewall";

interface RulesListProps {
  category: keyof FirewallResponse;
  mode: "blacklist" | "whitelist";
  rules: Rule[];
  toggleRuleActive: (
    cat: keyof FirewallResponse,
    mode: "blacklist" | "whitelist",
    id: number
  ) => void;
  deleteRule: (
    rule: Rule,
    mode: "blacklist" | "whitelist",
    category: keyof FirewallResponse
  ) => void;
}

export const RulesList: React.FC<RulesListProps> = ({
  category,
  mode,
  rules,
  toggleRuleActive,
  deleteRule,
}) => {
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
          <button
            onClick={() => deleteRule(rule, mode, category)}
            className="px-4 py-1 bg-red-800 hover:bg-red-700 rounded font-medium"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};
