import type { Actions, Subjects } from '@flama/shared';
import { SetMetadata } from '@nestjs/common';

export interface PolicyRule {
  action: Actions;
  subject: Subjects;
}

export const CHECK_POLICIES_KEY = 'check_policies';
export const CheckPolicies = (...rules: PolicyRule[]) => SetMetadata(CHECK_POLICIES_KEY, rules);
