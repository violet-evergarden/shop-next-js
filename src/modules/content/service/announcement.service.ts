import type { IAnnouncementRepository, AnnouncementQuery } from "../repository";
import { createAnnouncementRepository } from "../repository";
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "../domain/announcement";

export class AnnouncementService {
  constructor(
    private readonly items: IAnnouncementRepository = createAnnouncementRepository(),
  ) {}

  async list(query: AnnouncementQuery) {
    return this.items.findAll(query);
  }

  async listActive() {
    return this.items.findActive();
  }

  async create(input: CreateAnnouncementInput, actorId?: string) {
    return this.items.create(input, { actorId });
  }

  async update(id: string, input: UpdateAnnouncementInput, actorId?: string) {
    return this.items.update(id, input, { actorId });
  }

  async remove(id: string, actorId?: string) {
    await this.items.softDelete(id, { actorId });
  }
}
