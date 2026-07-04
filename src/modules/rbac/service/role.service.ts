import type { IRoleRepository } from "../repository";
import { createRoleRepository } from "../repository";

/** 角色服务(后台查看) */
export class RoleService {
  constructor(
    private readonly roles: IRoleRepository = createRoleRepository(),
  ) {}

  async list() {
    return this.roles.findAll();
  }
}
