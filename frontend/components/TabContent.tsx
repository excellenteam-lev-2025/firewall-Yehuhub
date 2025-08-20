import { RulesList } from "./RuleList";
import { FirewallResponse, Rule } from "@/types/firewall";

interface TabContentProps {
  loading: boolean;
  error: string | null;
  data: FirewallResponse | null;
  activeTab: keyof FirewallResponse;
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

export const TabContent: React.FC<TabContentProps> = ({
  loading,
  error,
  data,
  activeTab,
  toggleRuleActive,
  deleteRule,
}) => {
  if (loading) return <p className="text-yellow-300">Loading...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return null;

  const current = data[activeTab];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl text-white mb-2">Blacklist</h2>
        <RulesList
          category={activeTab}
          mode="blacklist"
          rules={current.blacklist}
          toggleRuleActive={toggleRuleActive}
          deleteRule={deleteRule}
        />
      </div>
      <div>
        <h2 className="text-xl text-white mb-2">Whitelist</h2>
        <RulesList
          category={activeTab}
          mode="whitelist"
          rules={current.whitelist}
          toggleRuleActive={toggleRuleActive}
          deleteRule={deleteRule}
        />
      </div>
    </div>
  );
};
