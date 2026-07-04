import type { IUserRepository, UserAdminQuery } from "../repository";
import { createUserRepository } from "../repository";

/** 会员管理服务(后台) */
export class UserService {
  constructor(
    private readonly users: IUserRepository = createUserRepository(),
  ) {}

  /** 后台:用户列表(含等级) */
  async listAll(query: UserAdminQuery) {
    return this.users.findAll(query);
  }
}
