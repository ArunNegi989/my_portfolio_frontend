import { Fragment } from "react";
import { parseInline, type MdBlock } from "@/lib/markdown";
import CodeBlock from "./CodeBlock";
import styles from "./Markdown.module.css";

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((token, index) => {
        switch (token.type) {
          case "code":
            return <code key={index}>{token.value}</code>;
          case "strong":
            return <strong key={index}>{token.value}</strong>;
          case "em":
            return <em key={index}>{token.value}</em>;
          case "link": {
            const external = /^https?:/.test(token.href);
            return (
              <a key={index} href={token.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {token.value}
              </a>
            );
          }
          default:
            return <Fragment key={index}>{token.value}</Fragment>;
        }
      })}
    </>
  );
}

/** Renders parsed blog Markdown. Used by article pages and the admin live preview. */
export default function Markdown({ blocks }: { blocks: MdBlock[] }) {
  return (
    <div className={styles.prose}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return block.level === 2 ? (
              <h2 key={index} id={block.id}>
                <Inline text={block.text} />
              </h2>
            ) : (
              <h3 key={index} id={block.id}>
                <Inline text={block.text} />
              </h3>
            );
          case "paragraph":
            return (
              <p key={index}>
                <Inline text={block.text} />
              </p>
            );
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag key={index}>
                {block.items.map((item, i) => (
                  <li key={i}>
                    <Inline text={item} />
                  </li>
                ))}
              </Tag>
            );
          }
          case "quote":
            return (
              <blockquote key={index}>
                <Inline text={block.text} />
              </blockquote>
            );
          case "code":
            return <CodeBlock key={index} code={block.code} lang={block.lang} />;
          case "image":
            return (
              <figure key={index}>
                {/* Article images can come from any host, so a plain lazy <img> is used. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.src} alt={block.alt} loading="lazy" decoding="async" />
                {block.alt && <figcaption>{block.alt}</figcaption>}
              </figure>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
