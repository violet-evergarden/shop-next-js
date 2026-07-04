import { describe, it, expect } from "vitest";
import { createProductSchema, productQuerySchema } from "./product";

describe("createProductSchema", () => {
  it("合法输入通过", () => {
    expect(() =>
      createProductSchema.parse({ name: "手机", slug: "phone", price: 999 }),
    ).not.toThrow();
  });

  it("负价格拒绝", () => {
    expect(() =>
      createProductSchema.parse({ name: "x", slug: "x", price: -1 }),
    ).toThrow();
  });

  it("status 默认 draft", () => {
    const r = createProductSchema.parse({
      name: "x",
      slug: "x",
      price: 1,
    });
    expect(r.status).toBe("draft");
  });

  it("status 非法值拒绝", () => {
    expect(() =>
      createProductSchema.parse({
        name: "x",
        slug: "x",
        price: 1,
        status: "xxx",
      }),
    ).toThrow();
  });
});

describe("productQuerySchema", () => {
  it("空输入走默认值", () => {
    const q = productQuerySchema.parse({});
    expect(q.page).toBe(1);
    expect(q.pageSize).toBe(20);
  });

  it("pageSize 超上限(999)被拒绝", () => {
    expect(() => productQuerySchema.parse({ pageSize: 999 })).toThrow();
  });

  it("page 非正数拒绝", () => {
    expect(() => productQuerySchema.parse({ page: 0 })).toThrow();
  });
});
