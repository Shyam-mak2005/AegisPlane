import { roleRepository } from '@/repositories/role.repository.js';

export class RbacService {
  async resolvePermissions(roleIds: string[]) {
    if (roleIds.length === 0) {
      return [] as string[];
    }

    const roles = await roleRepository.findByIds(roleIds);
    return [...new Set(roles.flatMap((role) => role.permissionKeys))];
  }
}

export const rbacService = new RbacService();