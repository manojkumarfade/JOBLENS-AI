"use client";

import type { ModelProvider } from "@joblens/shared";
import { Select } from "@/components/ui/select";

export function ModelProviderSelector({
  value,
  onChange
}: {
  value: ModelProvider;
  onChange: (value: ModelProvider) => void;
}) {
  return (
    <Select value={value} onChange={(event) => onChange(event.target.value as ModelProvider)}>
      <option value="platform">Platform Default</option>
      <option value="typegpt">TypeGPT</option>
    </Select>
  );
}
