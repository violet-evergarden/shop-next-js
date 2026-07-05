import type { IBannerRepository, BannerQuery } from "../repository";
import { createBannerRepository } from "../repository";
import type {
  CreateBannerInput,
  UpdateBannerInput,
} from "../domain/banner";

export class BannerService {
  constructor(
    private readonly banners: IBannerRepository = createBannerRepository(),
  ) {}

  async list(query: BannerQuery) {
    return this.banners.findAll(query);
  }

  /** 前台:生效中的 Banner */
  async listActive() {
    return this.banners.findActive();
  }

  async create(input: CreateBannerInput, actorId?: string) {
    return this.banners.create(input, { actorId });
  }

  async update(id: string, input: UpdateBannerInput, actorId?: string) {
    return this.banners.update(id, input, { actorId });
  }

  async remove(id: string, actorId?: string) {
    await this.banners.softDelete(id, { actorId });
  }
}
