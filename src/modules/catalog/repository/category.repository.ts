import type { Category } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";

export interface ICategoryRepository {
  findActive(ctx?: RepoContext): Promise<Category[]>;
}
