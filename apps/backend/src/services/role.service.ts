import { ApiError } from '@/shared/errors/api-error.js';
import { roleRepository } from '@/repositories/role.repository.js';
import { auditService } from '@/services/audit.service.js';

export class RoleService {
  list(tenantId?: string) {
    return roleRepository.list(tenantId);
  }

  async create(tenantId: string, payload: { name: string; description?: string; permissionKeys: string[] }, actorId?: string) {
    const role = await roleRepository.create({
      tenantId,
      name: payload.name,
      description: payload.description,
      permissionKeys: payload.permissionKeys,
      scope: 'tenant'
    });

    await auditService.enqueue({
      tenantId,
      actorId,
      action: 'role.create',
      resourceType: 'role',
      resourceId: String(role._id),
      metadata: { name: payload.name }
    });

    return role;
  }

  async update(roleId: string, tenantId: string, payload: { permissionKeys: string[]; description?: string }, actorId?: string) {
    const role = await roleRepository.updateInTenant(roleId, tenantId, payload);
    if (!role) {
      throw new ApiError(404, 'ROLE_NOT_FOUND', 'Role was not found in this tenant');
    }

    await auditService.enqueue({
      tenantId,
      actorId,
      action: 'role.update',
      resourceType: 'role',
      resourceId: roleId,
      metadata: { permissionKeys: payload.permissionKeys }
    });
    return role;
  }
}

export const roleService = new RoleService();