import type { IAddressRepository } from "../repository";
import { createAddressRepository } from "../repository";
import type { CreateAddressInput } from "../domain/address";

/** 收货地址服务(前台用户) */
export class AddressService {
  constructor(
    private readonly addresses: IAddressRepository = createAddressRepository(),
  ) {}

  async listMy(userId: string) {
    return this.addresses.findByUser(userId);
  }

  async create(userId: string, input: CreateAddressInput, actorId?: string) {
    return this.addresses.create(userId, input, { actorId });
  }

  async remove(userId: string, id: string, actorId?: string) {
    await this.addresses.remove(userId, id, { actorId });
  }
}
