import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatMessage({ text }: { text: string }) {
  return (
    <div className="message-markdown">
      <Markdown remarkPlugins={[remarkGfm]} skipHtml components={{
        h1: ({ children }) => <h3>{children}</h3>,
        h2: ({ children }) => <h3>{children}</h3>,
        h3: ({ children }) => <h4>{children}</h4>,
        table: ({ children }) => <div className="message-table" tabIndex={0} role="region" aria-label="Response table"><table>{children}</table></div>,
        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
        img: ({ alt }) => <span>{alt}</span>,
      }}>{text}</Markdown>
    </div>
  );
}
