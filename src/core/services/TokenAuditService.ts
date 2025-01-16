import { ethers } from 'ethers';
import { TokenConfig } from '@/types/token';
import { TokenAudit } from '@/types/tokenFeatures';

export class TokenAuditService {
  private static readonly CRITICAL_VULNERABILITIES = [
    'selfdestruct',
    'delegatecall',
    'transfer.call',
    'tx.origin'
  ];

  private static readonly HIGH_VULNERABILITIES = [
    'block.timestamp',
    'assembly',
    'ecrecover'
  ];

  async auditToken(tokenConfig: TokenConfig): Promise<TokenAudit> {
    const audit: TokenAudit = {
      timestamp: new Date(),
      status: 'in_progress',
      issues: [],
      score: 0
    };

    try {
      // Vérification du code source
      const sourceIssues = await this.auditSourceCode(tokenConfig);
      audit.issues = [...audit.issues, ...sourceIssues];

      // Vérification des configurations
      const configIssues = this.auditConfiguration(tokenConfig);
      audit.issues = [...audit.issues, ...configIssues];

      // Calcul du score final
      audit.score = this.calculateAuditScore(audit.issues);
      audit.status = this.determineAuditStatus(audit.score);

      return audit;
    } catch (error) {
      console.error('Error during token audit:', error);
      audit.status = 'failed';
      audit.issues = [{
        severity: 'critical',
        description: 'Audit process failed',
        recommendation: 'Please contact support'
      }];
      return audit;
    }
  }

  private async auditSourceCode(tokenConfig: TokenConfig): Promise<TokenAudit['issues']> {
    const issues: TokenAudit['issues'] = [];

    // Vérification des vulnérabilités critiques
    for (const vulnerability of TokenAuditService.CRITICAL_VULNERABILITIES) {
      if (tokenConfig.features.some(f => f.includes(vulnerability))) {
        issues.push({
          severity: 'critical',
          description: `Detected potentially dangerous function: ${vulnerability}`,
          recommendation: `Remove or secure the usage of ${vulnerability}`
        });
      }
    }

    // Vérification des vulnérabilités élevées
    for (const vulnerability of TokenAuditService.HIGH_VULNERABILITIES) {
      if (tokenConfig.features.some(f => f.includes(vulnerability))) {
        issues.push({
          severity: 'high',
          description: `Detected risky function: ${vulnerability}`,
          recommendation: `Review and secure the usage of ${vulnerability}`
        });
      }
    }

    return issues;
  }

  private auditConfiguration(tokenConfig: TokenConfig): TokenAudit['issues'] {
    const issues: TokenAudit['issues'] = [];

    // Vérification des taxes
    if (tokenConfig.taxConfig?.enabled) {
      if (tokenConfig.taxConfig.baseTaxRate > 10) {
        issues.push({
          severity: 'high',
          description: 'High base tax rate detected',
          recommendation: 'Consider reducing the base tax rate below 10%'
        });
      }
    }

    // Vérification du supply
    const supply = ethers.parseUnits(tokenConfig.supply, tokenConfig.decimals);
    const maxSupply = ethers.parseUnits('1000000000000', 18);
    if (supply.gt(maxSupply)) {
      issues.push({
        severity: 'medium',
        description: 'Very large total supply detected',
        recommendation: 'Consider reducing the total supply to prevent potential numerical issues'
      });
    }

    return issues;
  }

  private calculateAuditScore(issues: TokenAudit['issues']): number {
    const weights: Record<TokenAudit['issues'][number]['severity'], number> = {
      critical: -30,
      high: -20,
      medium: -10,
      low: -5
    };

    const baseScore = 100;
    const totalPenalty = issues.reduce((acc, issue) => {
      return acc + weights[issue.severity];
    }, 0);

    return Math.max(0, Math.min(100, baseScore + totalPenalty));
  }

  private determineAuditStatus(score: number): TokenAudit['status'] {
    if (score >= 80) return 'completed';
    if (score >= 50) return 'in_progress';
    return 'failed';
  }
}
