import { Mic } from "lucide-react";

export function FloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="jl-floating-button" type="button" onClick={onClick}>
      <Mic size={18} />
      <span>Ask JobLens about this page</span>
    </button>
  );
}
