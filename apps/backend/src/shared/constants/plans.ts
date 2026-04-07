import type { PlanName } from '@/types/http.js';

export interface PlanDefinition {
  key: PlanName;
  label: string;
  maxUsers: number;
  apiRateLimitPerMinute: number;
  features: string[];
}

export const plans: Record<PlanName, PlanDefinition> = {
  free: {
    key: 'free',
    label: 'Free',
    maxUsers: 10,
    apiRateLimitPerMinute: 120,
    features: ['api_access', 'audit_logs']
  },
  pro: {
    key: 'pro',
    label: 'Pro',
    maxUsers: 100,
    apiRateLimitPerMinute: 1200,
    features: ['api_access', 'audit_logs', 'advanced_analytics', 'team_collaboration']
  },
  enterprise: {
    key: 'enterprise',
    label: 'Enterprise',
    maxUsers: 1000,
    apiRateLimitPerMinute: 5000,
    features: ['api_access', 'audit_logs', 'advanced_analytics', 'team_collaboration', 'custom_sso']
  }
};