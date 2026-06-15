export function ErrorBanner({ message, onFallback }: { message?: string; onFallback?: () => void }) {
  if (!message) return null;
  return (
    <div className="jl-error">
      <span>{message}</span>
      {onFallback ? (
        <button type="button" onClick={onFallback}>
          Continue with Fast & Free
        </button>
      ) : null}
    </div>
  );
}
