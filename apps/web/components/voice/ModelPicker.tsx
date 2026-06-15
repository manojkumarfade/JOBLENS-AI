"use client";

import type { BrainModelCatalogItem } from "@joblens/shared";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

export function ModelPicker({
  label,
  value,
  models,
  disabled,
  onChange
}: {
  label: string;
  value: string;
  models: BrainModelCatalogItem[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <Select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled}>
        {models.map((model) => (
          <option key={model.id} value={model.id}>{model.label}</option>
        ))}
      </Select>
      <div className="space-y-2">
        {models.map((model) => (
          <div key={model.id} className="rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{model.label}</span>
              <Badge variant="secondary">{model.speedTier}</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">{model.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
