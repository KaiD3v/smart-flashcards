import type { Request } from "express";

export function routeParamId(req: Request, paramName = "id"): string | undefined {
  const raw = req.params[paramName];
  if (Array.isArray(raw)) {
    return raw[0];
  }
  return raw;
}
