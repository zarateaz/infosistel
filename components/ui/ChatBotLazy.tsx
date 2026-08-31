"use client";

import dynamic from "next/dynamic";

// `ssr: false` is only allowed inside a Client Component — this thin wrapper
// exists so app/layout.tsx (a Server Component) can still lazy-load the chat
// widget without pulling @ai-sdk/react into every route's initial bundle.
const ChatBot = dynamic(() => import("@/components/ui/ChatBot"), { ssr: false });

export default ChatBot;
