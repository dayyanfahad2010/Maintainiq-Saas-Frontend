import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Loader2, Bot, User2 } from "lucide-react";
import toast from "react-hot-toast";
import { sendAssetChatMessage } from "@/features/ai/aiSlice";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import { Textarea } from "@/components/common/Field";
import Button from "@/components/common/Button";
import { cn } from "@/utils/cn";

export default function AssetChatWidget({ assetId, assetName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendAssetChatMessage(assetId, text, messages);
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      toast.error(err.message || "The asset assistant didn't respond. Try again.");
      setMessages(messages); // roll back the optimistic user message on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <Bot className="size-4 text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]" />
        <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
          Ask about {assetName || "this asset"}
        </h3>
      </CardHeader>
      <CardBody className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">
            Ask anything about this asset's history, likely causes, or what to check next — the
            assistant only knows what's on record for this asset.
          </p>
        ) : (
          <div ref={scrollRef} className="max-h-80 space-y-3 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex gap-2", m.role === "user" ? "flex-row-reverse" : "flex-row")}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full",
                    m.role === "user"
                      ? "bg-[var(--color-graphite)] text-[var(--color-amber)] dark:bg-[var(--color-amber)] dark:text-[var(--color-graphite)]"
                      : "bg-[var(--color-surface-2)] text-[var(--color-ink-soft)]"
                  )}
                >
                  {m.role === "user" ? <User2 className="size-3.5" /> : <Sparkles className="size-3.5" />}
                </span>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-line",
                    m.role === "user"
                      ? "bg-[var(--color-graphite)] text-white dark:bg-[var(--color-amber)] dark:text-[var(--color-graphite)]"
                      : "bg-[var(--color-surface-2)] text-[var(--color-ink)]"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-ink-soft)]">
                <Loader2 className="size-3.5 animate-spin" /> Thinking…
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-end gap-2">
          <Textarea
            rows={1}
            placeholder="e.g. Why does this keep breaking?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            className="min-h-[42px] resize-none"
          />
          <Button type="submit" size="md" icon={Send} disabled={!input.trim()} loading={loading}>
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
