import type { Admin } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";

export interface IAdminRepository {
  findById(id: string, ctx?: RepoContext): Promise<Admin | null>;
  findByUsername(username: string, ctx?: RepoContext): Promise<Admin | null>;
  updateLastLogin(
    id: string,
    ip: string | null,
    ctx?: RepoContext,
  ): Promise<void>;
}
