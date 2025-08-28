export interface Rule {
  id: number;
  value: string | number;
  active: boolean;
}

export interface RulesByMode {
  blacklist: Rule[];
  whitelist: Rule[];
}

export interface FirewallResponse {
  ips: RulesByMode;
  urls: RulesByMode;
  ports: RulesByMode;
}
