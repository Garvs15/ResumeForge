export interface AppToolResult {
  toolCallId: string;
  toolName: string;
  result: any;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolInvocations?: AppToolResult[];
}
