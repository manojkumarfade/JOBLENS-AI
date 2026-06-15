import { modelCatalog } from "@joblens/shared";
import { json } from "@/lib/api";

export function GET() {
  return json(modelCatalog);
}
