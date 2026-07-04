import { getCurrentUser } from "@/lib/auth/session";
import { CouponService } from "@/modules/marketing/service/coupon.service";
import { ClaimCouponButton } from "@/components/storefront/claim-coupon-button";

function couponDesc(c: {
  type: string;
  value: unknown;
  minAmount: unknown;
  maxDiscount: unknown;
}) {
  const value = Number(c.value);
  const min = Number(c.minAmount);
  if (c.type === "fixed") return `满 ${min} 减 ${value}`;
  const pct = (value * 100).toFixed(0);
  const cap = c.maxDiscount ? `, 上限 ${Number(c.maxDiscount)}` : "";
  return `满 ${min} 减 ${pct}%${cap}`;
}

export default async function CouponsPage() {
  const user = await getCurrentUser();
  const service = new CouponService();
  const [claimable, mine] = await Promise.all([
    service.listClaimable(),
    user ? service.listMy(user.userId) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold">优惠券</h1>

      <section>
        <h2 className="mb-3 font-medium">可领取</h2>
        {claimable.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无可领券</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {claimable.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {couponDesc(c)}
                  </div>
                </div>
                {user ? (
                  <ClaimCouponButton couponId={c.id} />
                ) : (
                  <span className="text-xs text-muted-foreground">需登录</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-medium">我的优惠券</h2>
        {mine.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {mine.map((uc) => (
              <div key={uc.id} className="rounded-lg border p-4">
                <div className="font-medium">{uc.coupon.name}</div>
                <div className="text-sm text-muted-foreground">
                  {couponDesc(uc.coupon)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
