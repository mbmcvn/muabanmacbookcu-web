import "server-only";

import { cache } from "react";
import { adaptPublicDetailForCurrentView } from "./adapters/public-machine-adapter";
import { supabasePublicMachineRepository } from "./repositories/supabase-public-machine-repository";

export const getMachineBySlug = cache(async (slug: string) => {
  const machine = await supabasePublicMachineRepository.getBySlug(slug);
  return machine ? adaptPublicDetailForCurrentView(machine) : null;
});
