import type { Address } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";

export interface IAddressRepository {
  findById(id: string, ctx?: RepoContext): Promise<Address | null>;
  findByUser(userId: string, ctx?: RepoContext): Promise<Address[]>;
}
