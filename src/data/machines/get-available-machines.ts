import "server-only";

import { supabasePublicMachineRepository } from "./repositories/supabase-public-machine-repository";

export function getAvailableMachines() {
  return supabasePublicMachineRepository.list();
}
