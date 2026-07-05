import type { Role } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";

export interface IRoleRepository {
  findAll(ctx?: RepoContext): Promise<Role[]>;
}
