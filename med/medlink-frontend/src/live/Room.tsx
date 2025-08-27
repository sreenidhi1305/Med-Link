import { RoomProvider } from "@liveblocks/react";
import type { PropsWithChildren } from "react";

export default function Room({ children }: PropsWithChildren) {
  const hasKey = Boolean(import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY);
  if (!hasKey) return <>{children}</>;
  return (
    <RoomProvider id="medlink-finder">
      {children}
    </RoomProvider>
  );
}
