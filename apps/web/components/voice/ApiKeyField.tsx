"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ApiKeyField({
  label,
  configured,
  value,
  onChange,
  onRemove
}: {
  label: string;
  configured: boolean;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(!configured);
  const [visible, setVisible] = useState(false);

  if (configured && !editing) {
    return (
      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">Configured. Raw value is never shown again.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setEditing(true)}>Replace</Button>
          <Button type="button" variant="ghost" onClick={onRemove}>Remove</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Paste API key" />
        <Button type="button" variant="outline" size="icon" title={visible ? "Hide key" : "Show key"} aria-label={visible ? "Hide key" : "Show key"} onClick={() => setVisible((next) => !next)}>
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
