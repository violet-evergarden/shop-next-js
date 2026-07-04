import type { Announcement } from "@prisma/client";
import type { RepoContext } from "@/lib/repository";
import type { Paginated } from "@/lib/types";
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "../domain/announcement";

export interface AnnouncementQuery {
  page: number;
  pageSize: number;
}

export interface IAnnouncementRepository {
  findAll(
    query: AnnouncementQuery,
    ctx?: RepoContext,
  ): Promise<Paginated<Announcement>>;
  findActive(ctx?: RepoContext): Promise<Announcement[]>;
  create(input: CreateAnnouncementInput, ctx?: RepoContext): Promise<Announcement>;
  update(
    id: string,
    input: UpdateAnnouncementInput,
    ctx?: RepoContext,
  ): Promise<Announcement>;
  softDelete(id: string, ctx?: RepoContext): Promise<void>;
}
