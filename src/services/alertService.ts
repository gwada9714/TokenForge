import { AuditActionType } from "./auditLogger";

export interface AlertRule {
  id: string;
  actionType: AuditActionType;
  condition: "success" | "failed" | "both";
  threshold?: number;
  timeWindow?: number; // en minutes
  enabled: boolean;
  notificationMessage: string;
}

const STORAGE_KEY = "tokenforge_alert_rules";

class AlertService {
  private rules: AlertRule[];

  constructor() {
    this.rules = this.loadRules();
  }

  private loadRules(): AlertRule[] {
    try {
      const storedRules = localStorage.getItem(STORAGE_KEY);
      return storedRules ? JSON.parse(storedRules) : [];
    } catch (error) {
      console.error("Error loading alert rules:", error);
      return [];
    }
  }

  private saveRules(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.rules));
    } catch (error) {
      console.error("Error saving alert rules:", error);
    }
  }

  addRule(rule: Omit<AlertRule, "id">): AlertRule {
    const newRule = {
      ...rule,
      id: crypto.randomUUID(),
    };
    this.rules.push(newRule);
    this.saveRules();
    return newRule;
  }

  updateRule(id: string, updates: Partial<AlertRule>): void {
    const index = this.rules.findIndex((rule) => rule.id === id);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
      this.saveRules();
    }
  }

  deleteRule(id: string): void {
    this.rules = this.rules.filter((rule) => rule.id !== id);
    this.saveRules();
  }

  getRules(): AlertRule[] {
    return [...this.rules];
  }

  checkAlert(
    action: AuditActionType,
    status: "SUCCESS" | "FAILED"
  ): AlertRule[] {
    const matchingRules = this.rules.filter((rule) => {
      if (!rule.enabled) return false;
      if (rule.actionType !== action) return false;

      const statusMatch =
        rule.condition === "both" ||
        (rule.condition === "success" && status === "SUCCESS") ||
        (rule.condition === "failed" && status === "FAILED");

      return statusMatch;
    });

    return matchingRules;
  }

  exportConfig(): string {
    return JSON.stringify(
      {
        version: "1.0",
        timestamp: new Date().toISOString(),
        rules: this.rules,
      },
      null,
      2
    );
  }

  importConfig(configStr: string): boolean {
    try {
      const config = JSON.parse(configStr);
      if (!config.rules || !Array.isArray(config.rules)) {
        throw new Error("Format de configuration invalide");
      }
      this.rules = config.rules;
      this.saveRules();
      return true;
    } catch (error) {
      console.error("Error importing alert config:", error);
      return false;
    }
  }
}

export const alertService = new AlertService();
