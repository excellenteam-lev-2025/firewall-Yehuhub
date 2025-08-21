import { FirewallResponse, Rule } from "@/types/firewall";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Value</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rules.map((rule) => (
          <TableRow key={rule.id}>
            <TableCell className="font-medium">{rule.value}</TableCell>
            <TableCell>
              <Button
                variant={rule.active ? "default" : "secondary"}
                onClick={() => toggleRuleActive(category, mode, rule.id)}
              >
                {rule.active ? "Active" : "Inactive"}
              </Button>
            </TableCell>
            <TableCell>
              <Button
                variant="destructive"
                onClick={() => deleteRule(rule, mode, category)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
