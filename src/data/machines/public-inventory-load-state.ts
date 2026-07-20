export type PublicInventoryLoadState<T> =
  | { status: "ready"; machines: T[] }
  | { status: "unavailable" };

export async function loadPublicInventoryState<T>(
  load: () => Promise<T[]>,
): Promise<PublicInventoryLoadState<T>> {
  try {
    return { status: "ready", machines: await load() };
  } catch {
    return { status: "unavailable" };
  }
}
