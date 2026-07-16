import "server-only";

import { cache } from "react";
import { supabasePublicMachineRepository } from "./repositories/supabase-public-machine-repository";

export const getPublicMachineBySlug = cache((slug: string) =>
  supabasePublicMachineRepository.getBySlug(slug),
);
