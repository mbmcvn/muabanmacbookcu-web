type MachineMetadataInput = {
  summary: {
    conditionSummary: string;
  };
};

export function publicMachineMetadataDescription(
  machine: MachineMetadataInput,
): string {
  return machine.summary.conditionSummary;
}
