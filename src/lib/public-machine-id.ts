/** Public projection codes are canonical MBMC IDs, never internal UUIDs or shorthand. */
export function publicMachineId(code: string | null | undefined): string | null {
  return code && /^MBMC-[A-Z0-9]+$/.test(code) ? code : null;
}

export async function copyPublicMachineId(
  code: string | null | undefined,
  writeText: (value: string) => Promise<void>,
): Promise<boolean> {
  const id = publicMachineId(code);
  if (!id) return false;
  try {
    await writeText(id);
    return true;
  } catch {
    return false;
  }
}
