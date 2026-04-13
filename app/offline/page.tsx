export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl font-bold font-mono opacity-20">:/</div>
      <h1 className="text-2xl font-semibold tracking-tight">You&apos;re offline</h1>
      <p className="text-muted-foreground max-w-xs text-sm">
        No internet connection. Reconnect and refresh to continue.
      </p>
    </div>
  );
}
