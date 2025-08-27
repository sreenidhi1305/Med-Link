import { useOthers } from "@liveblocks/react";

export default function PresenceBar() {
  const hasKey = Boolean(import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY);
  if (!hasKey) return null;
  const others = useOthers();
  const count = others.length;
  const maxAvatars = 5;
  const avatars = others.slice(0, maxAvatars).map((o, i) => {
    const name: string | undefined = (o as any).info?.name || (o as any).presence?.name;
    const initials = name ? name.split(/\s+/).map((n: string) => n[0]).slice(0,2).join('').toUpperCase() : 'U';
    return (
      <span key={i} className="-ml-2 first:ml-0 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-gradient-to-br from-emerald-500 to-emerald-600 text-[10px] font-semibold text-white shadow">
        {initials}
      </span>
    );
  });
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-emerald-800">
      <div className="flex items-center">{avatars}</div>
      <span className="text-xs">
        {count === 0 ? "You're the first" : `${count} viewing`}
      </span>
    </div>
  );
}
