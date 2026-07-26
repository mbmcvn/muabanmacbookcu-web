import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/server") {
      return { url: new URL("../../../node_modules/next/server.js", import.meta.url).href, shortCircuit: true };
    }
    if (specifier === "server-only")
      return {
        url: "data:text/javascript,export%20default%20undefined",
        shortCircuit: true,
      };
    if (specifier.startsWith("@/"))
      return {
        url: pathToFileURL(
          resolvePath(process.cwd(), "src", specifier.slice(2) + ".ts"),
        ).href,
        shortCircuit: true,
      };
    if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
      const candidate = new URL(specifier + ".ts", context.parentURL);
      if (existsSync(candidate))
        return { url: candidate.href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
