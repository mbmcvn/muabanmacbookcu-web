const HOMEPAGE_MACHINE_LIMIT = 3;

export function selectHomepageMachines<T>(machines: T[]): T[] {
  return machines.slice(0, HOMEPAGE_MACHINE_LIMIT);
}
