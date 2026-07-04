import { getCurrentUser } from "@/lib/auth/session";
import { AddressService } from "@/modules/member/service/address.service";
import { AddressForm } from "@/components/storefront/address-form";
import { DeleteAddressButton } from "@/components/storefront/delete-address-button";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        请先在右上角完成 <strong>钱包登录</strong>
      </div>
    );
  }

  const service = new AddressService();
  const addresses = await service.listMy(user.userId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">收货地址</h1>
      <div className="mb-6 space-y-3">
        {addresses.length === 0 ? (
          <p className="text-muted-foreground">暂无地址,请在下方添加</p>
        ) : (
          addresses.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <div className="text-sm font-medium">
                  {a.receiver} {a.phone}
                </div>
                <div className="text-sm text-muted-foreground">
                  {a.province}
                  {a.city}
                  {a.district}
                  {a.detail}
                </div>
              </div>
              <DeleteAddressButton id={a.id} />
            </div>
          ))
        )}
      </div>
      <AddressForm />
    </div>
  );
}
