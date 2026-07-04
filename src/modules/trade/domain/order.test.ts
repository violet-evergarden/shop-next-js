import { describe, it, expect } from "vitest";
import { calcSubtotal, calcDiscount, calcShipping } from "./order";

describe("calcSubtotal", () => {
  it("累加 价格 × 数量", () => {
    expect(
      calcSubtotal([
        { price: 10, quantity: 2 },
        { price: 5, quantity: 3 },
      ]),
    ).toBe(35);
  });

  it("空数组为 0", () => {
    expect(calcSubtotal([])).toBe(0);
  });
});

describe("calcDiscount", () => {
  const fixed = {
    type: "fixed",
    value: 20,
    minAmount: 100,
    maxDiscount: null,
  };

  it("fixed 满减:满足门槛", () => {
    expect(calcDiscount(fixed, 150)).toBe(20);
  });

  it("fixed 满减:不满足门槛不计", () => {
    expect(calcDiscount(fixed, 50)).toBe(0);
  });

  it("fixed 不超过 subtotal", () => {
    expect(
      calcDiscount(
        { type: "fixed", value: 200, minAmount: 0, maxDiscount: null },
        100,
      ),
    ).toBe(100);
  });

  it("percentage 折扣", () => {
    expect(
      calcDiscount(
        { type: "percentage", value: 0.1, minAmount: 0, maxDiscount: null },
        100,
      ),
    ).toBe(10);
  });

  it("percentage 受 maxDiscount 上限", () => {
    expect(
      calcDiscount(
        {
          type: "percentage",
          value: 0.5,
          minAmount: 0,
          maxDiscount: 30,
        },
        100,
      ),
    ).toBe(30);
  });

  it("未知 type 不计", () => {
    expect(
      calcDiscount(
        { type: "unknown", value: 100, minAmount: 0, maxDiscount: null },
        100,
      ),
    ).toBe(0);
  });
});

describe("calcShipping", () => {
  it("满阈值免邮", () => {
    expect(calcShipping(100)).toBe(0);
  });

  it("未满收运费", () => {
    expect(calcShipping(50)).toBe(10);
  });

  it("未满阈值(98)收运费", () => {
    expect(calcShipping(98)).toBe(10);
  });

  it("刚好达阈值(99)免邮", () => {
    expect(calcShipping(99)).toBe(0);
  });
});
