import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderService } from "./order.service";

// Mock repositories
const mockCarts = {
  findActiveCartByUserId: vi.fn(),
  removeItems: vi.fn(),
};
const mockOrders = {
  createWithItems: vi.fn(),
  findById: vi.fn(),
  findByOrderNo: vi.fn(),
  findManyByUser: vi.fn(),
  findAll: vi.fn(),
  updateStatus: vi.fn(),
};
const mockInventory = {
  findBySkuId: vi.fn(),
  decrementQuantity: vi.fn(),
};
const mockProducts = {
  findById: vi.fn(),
  findBySlug: vi.fn(),
  findDetailBySlug: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  incrementSales: vi.fn(),
};
const mockCoupons = {
  findValidUserCoupon: vi.fn(),
  markUsed: vi.fn(),
  findValidByUser: vi.fn(),
  findClaimable: vi.fn(),
  claim: vi.fn(),
};
const mockAddresses = {
  findById: vi.fn(),
  findByUser: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
};
const mockUsers = {
  findById: vi.fn(),
  findByWalletAddress: vi.fn(),
  findOrCreateByWalletAddress: vi.fn(),
  updateNonce: vi.fn(),
  updatePoints: vi.fn(),
  findAll: vi.fn(),
  updateLevel: vi.fn(),
  findBestLevelForPoints: vi.fn(),
};

// Mock prisma.$transaction: 直接执行回调
vi.mock("@/lib/db", () => ({
  prisma: {
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({}),
  },
}));

function createService() {
  return new OrderService(
    mockCarts as never,
    mockOrders as never,
    mockInventory as never,
    mockProducts as never,
    mockCoupons as never,
    mockAddresses as never,
    mockUsers as never,
  );
}

describe("OrderService", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("checkout - 正常下单", () => {
    it("扣库存+建订单+清购物车+加积分", async () => {
      const service = createService();

      const address = {
        id: "addr1",
        userId: "u1",
        receiver: "张三",
        phone: "138",
        province: "广东省",
        city: "深圳市",
        district: "南山区",
        detail: "科技园",
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        createdBy: null,
        updatedBy: null,
        tag: null,
        zipCode: null,
      };
      mockAddresses.findById.mockResolvedValue(address);

      const cartItems = [
        {
          id: "ci1",
          cartId: "c1",
          skuId: "s1",
          productId: "p1",
          quantity: 2,
          selected: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          createdBy: null,
          updatedBy: null,
          sku: {
            id: "s1",
            productId: "p1",
            skuCode: "SKU1",
            name: "黑色",
            price: { toString: () => "100" } as never,
            originalPrice: null,
            attributes: null,
            barcode: null,
            weight: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            createdBy: null,
            updatedBy: null,
          },
          product: {
            id: "p1",
            name: "测试手机",
            slug: "test-phone",
            isActive: true,
            status: "active",
            coverImage: null,
          } as never,
        },
      ];
      mockCarts.findActiveCartByUserId.mockResolvedValue({ id: "c1", userId: "u1", items: cartItems } as never);

      mockInventory.decrementQuantity.mockResolvedValue(true);
      mockProducts.incrementSales.mockResolvedValue(undefined);
      mockOrders.createWithItems.mockResolvedValue({ id: "o1", orderNo: "ORD123", payAmount: { toString: () => "200" } } as never);
      mockCarts.removeItems.mockResolvedValue(undefined);
      mockUsers.updatePoints.mockResolvedValue(undefined);
      mockUsers.findById.mockResolvedValue({ id: "u1", points: 200, levelId: "lv1" } as never);
      mockUsers.findBestLevelForPoints.mockResolvedValue(null);

      const result = await service.checkout("u1", { addressId: "addr1" });

      expect(result.orderNo).toBe("ORD123");
      expect(result.payAmount).toBe(200);
      expect(mockInventory.decrementQuantity).toHaveBeenCalledWith("s1", 2, expect.any(Object));
      expect(mockOrders.createWithItems).toHaveBeenCalledTimes(1);
      expect(mockCarts.removeItems).toHaveBeenCalledTimes(1);
      expect(mockUsers.updatePoints).toHaveBeenCalledWith("u1", 200, expect.any(Object));
    });
  });

  describe("checkout - 地址不存在", () => {
    it("抛 NotFoundError", async () => {
      const service = createService();
      mockAddresses.findById.mockResolvedValue(null);
      await expect(service.checkout("u1", { addressId: "bad" })).rejects.toThrow("收货地址不存在");
    });
  });

  describe("checkout - 地址不属于用户", () => {
    it("抛 NotFoundError", async () => {
      const service = createService();
      mockAddresses.findById.mockResolvedValue({
        id: "a1", userId: "other", receiver: "x", phone: "x",
        province: "x", city: "x", district: "x", detail: "x",
        isDefault: false, createdAt: new Date(), updatedAt: new Date(),
        deletedAt: null, createdBy: null, updatedBy: null, tag: null, zipCode: null,
      });
      await expect(service.checkout("u1", { addressId: "a1" })).rejects.toThrow("收货地址不存在");
    });
  });

  describe("checkout - 空购物车", () => {
    it("抛 ValidationError", async () => {
      const service = createService();
      mockAddresses.findById.mockResolvedValue({
        id: "a1", userId: "u1", receiver: "x", phone: "x",
        province: "x", city: "x", district: "x", detail: "x",
        isDefault: false, createdAt: new Date(), updatedAt: new Date(),
        deletedAt: null, createdBy: null, updatedBy: null, tag: null, zipCode: null,
      });
      mockCarts.findActiveCartByUserId.mockResolvedValue(null);
      await expect(service.checkout("u1", { addressId: "a1" })).rejects.toThrow("没有可结算的商品");
    });
  });

  describe("checkout - 库存不足", () => {
    it("抛 ConflictError", async () => {
      const service = createService();
      mockAddresses.findById.mockResolvedValue({
        id: "a1", userId: "u1", receiver: "x", phone: "x",
        province: "x", city: "x", district: "x", detail: "x",
        isDefault: false, createdAt: new Date(), updatedAt: new Date(),
        deletedAt: null, createdBy: null, updatedBy: null, tag: null, zipCode: null,
      });
      mockCarts.findActiveCartByUserId.mockResolvedValue({
        id: "c1", userId: "u1",
        items: [{
          id: "ci1", cartId: "c1", skuId: "s1", productId: "p1",
          quantity: 5, selected: true, createdAt: new Date(), updatedAt: new Date(),
          deletedAt: null, createdBy: null, updatedBy: null,
          sku: {
            id: "s1", productId: "p1", skuCode: "SKU1", name: "黑色",
            price: { toString: () => "100" } as never,
            originalPrice: null, attributes: null, barcode: null, weight: null,
            isActive: true, createdAt: new Date(), updatedAt: new Date(),
            deletedAt: null, createdBy: null, updatedBy: null,
          },
          product: { id: "p1", name: "测试手机", slug: "t", isActive: true, status: "active", coverImage: null } as never,
        }],
      } as never);
      mockInventory.decrementQuantity.mockResolvedValue(false);

      await expect(service.checkout("u1", { addressId: "a1" })).rejects.toThrow("库存不足");
    });
  });

  describe("listMyOrders", () => {
    it("委托给 repository.findManyByUser", async () => {
      const service = createService();
      const fakeResult = { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
      mockOrders.findManyByUser.mockResolvedValue(fakeResult);
      const result = await service.listMyOrders("u1", { page: 1, pageSize: 20 });
      expect(result).toEqual(fakeResult);
      expect(mockOrders.findManyByUser).toHaveBeenCalledWith("u1", { page: 1, pageSize: 20 });
    });
  });

  describe("getMyOrder - 越权防护", () => {
    it("其他用户的订单 → NotFoundError", async () => {
      const service = createService();
      mockOrders.findById.mockResolvedValue({ id: "o1", userId: "other", items: [] } as never);
      await expect(service.getMyOrder("u1", "o1")).rejects.toThrow("订单不存在");
    });

    it("自己的订单 → 正常返回", async () => {
      const service = createService();
      const order = { id: "o1", userId: "u1", items: [], orderNo: "ORD1" };
      mockOrders.findById.mockResolvedValue(order as never);
      const result = await service.getMyOrder("u1", "o1");
      expect(result).toEqual(order);
    });
  });

  describe("积分 + 等级升级", () => {
    it("下单后加积分 + 检查升级", async () => {
      const service = createService();
      mockAddresses.findById.mockResolvedValue({
        id: "a1", userId: "u1", receiver: "x", phone: "x",
        province: "x", city: "x", district: "x", detail: "x",
        isDefault: false, createdAt: new Date(), updatedAt: new Date(),
        deletedAt: null, createdBy: null, updatedBy: null, tag: null, zipCode: null,
      });
      mockCarts.findActiveCartByUserId.mockResolvedValue({
        id: "c1", userId: "u1",
        items: [{
          id: "ci1", cartId: "c1", skuId: "s1", productId: "p1",
          quantity: 1, selected: true, createdAt: new Date(), updatedAt: new Date(),
          deletedAt: null, createdBy: null, updatedBy: null,
          sku: {
            id: "s1", productId: "p1", skuCode: "S1", name: "黑",
            price: { toString: () => "999" } as never,
            originalPrice: null, attributes: null, barcode: null, weight: null,
            isActive: true, createdAt: new Date(), updatedAt: new Date(),
            deletedAt: null, createdBy: null, updatedBy: null,
          },
          product: { id: "p1", name: "手机", slug: "t", isActive: true, status: "active", coverImage: null } as never,
        }],
      } as never);
      mockInventory.decrementQuantity.mockResolvedValue(true);
      mockOrders.createWithItems.mockResolvedValue({ id: "o1", orderNo: "ORD", payAmount: { toString: () => "999" } } as never);
      mockUsers.updatePoints.mockResolvedValue(undefined);
      mockUsers.findById.mockResolvedValue({ id: "u1", points: 999, levelId: "bronze" } as never);
      // 模拟找到白银等级(>=500)
      mockUsers.findBestLevelForPoints.mockResolvedValue({ id: "silver", name: "白银", minPoints: 500 } as never);
      mockUsers.updateLevel.mockResolvedValue(undefined);

      await service.checkout("u1", { addressId: "a1" });

      // 积分加了 999(floor(999))
      expect(mockUsers.updatePoints).toHaveBeenCalledWith("u1", 999, expect.any(Object));
      // 查了最高等级
      expect(mockUsers.findBestLevelForPoints).toHaveBeenCalledWith(999, expect.any(Object));
      // 升级了(bronze → silver)
      expect(mockUsers.updateLevel).toHaveBeenCalledWith("u1", "silver", expect.any(Object));
    });
  });
});
