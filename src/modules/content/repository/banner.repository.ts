import type { Banner } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import type { Paginated } from "@/lib/types";
import type {
  CreateBannerInput,
  UpdateBannerInput,
} from "../domain/banner";

export interface BannerQuery {
  page: number;
  pageSize: number;
}

export interface IBannerRepository {
  findAll(query: BannerQuery, ctx?: RepoContext): Promise<Paginated<Banner>>;
  findActive(ctx?: RepoContext): Promise<Banner[]>;
  create(input: CreateBannerInput, ctx?: RepoContext): Promise<Banner>;
  update(
    id: string,
    input: UpdateBannerInput,
    ctx?: RepoContext,
  ): Promise<Banner>;
  softDelete(id: string, ctx?: RepoContext): Promise<void>;
}
