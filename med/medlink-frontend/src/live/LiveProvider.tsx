import { LiveblocksProvider } from "@liveblocks/react";
import type { PropsWithChildren } from "react";

export default function LiveProvider({ children }: PropsWithChildren) {
  const publicApiKey = import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY as string | undefined;
  if (!publicApiKey) {
    return <>{children}</>;
  }
  return (
    <LiveblocksProvider publicApiKey={publicApiKey}>{children}</LiveblocksProvider>
  );
}
