import type { Address } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import type { CreateAddressInput } from "../domain/address";

export interface IAddressRepository {
  findById(id: string, ctx?: RepoContext): Promise<Address | null>;
  findByUser(userId: string, ctx?: RepoContext): Promise<Address[]>;
  create(
    userId: string,
    input: CreateAddressInput,
    ctx?: RepoContext,
  ): Promise<Address>;
  /** 软删除(校验归属,防越权) */
  remove(userId: string, id: string, ctx?: RepoContext): Promise<void>;
}
