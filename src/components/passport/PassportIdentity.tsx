import type { PassportIdentity as PassportIdentityModel } from "@/models";

export function PassportIdentity({ identity }: { identity: PassportIdentityModel }) {
  return (
    <section>
      <h3>Định danh</h3>
      <p>{identity.model}{identity.modelYear ? ` ${identity.modelYear}` : ""}</p>
      <p>Mã công khai: {identity.publicReference}</p>
    </section>
  );
}
