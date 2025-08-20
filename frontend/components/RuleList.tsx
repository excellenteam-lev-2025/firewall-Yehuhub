import { FirewallResponse, Rule } from "@/types/firewall";
import { Button } from "./ui/button";

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
          className="flex justify-between items-center p-2 bg-gray-600 rounded border border-gray-500"
        >
          <span>{rule.value}</span>
          <Button
            variant={rule.active ? "default" : "secondary"}
            onClick={() => toggleRuleActive(category, mode, rule.id)}
          >
            {rule.active ? "Active" : "Inactive"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteRule(rule, mode, category)}
          >
            {" "}
            Delete
          </Button>
        </li>
      ))}
    </ul>
  );
};
