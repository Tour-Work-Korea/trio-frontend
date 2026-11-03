import React from 'react';
import {programBlocks, programInline} from '../services/programText';

const inline = text =>
  programInline(text).map((part, index) => {
    if (part.href)
      return (
        <a
          key={index}
          className="le-inline-link"
          href={part.href}
          target="_blank"
          rel="noopener noreferrer">
          {part.text}
        </a>
      );
    if (part.bold) return <strong key={index}>{inline(part.text)}</strong>;
    return part.text;
  });

export function InlineText({text}) {
  return inline(text);
}

export default function ProgramDescription({text}) {
  return (
    <div className="le-program-description">
      {programBlocks(text).map((block, index) => {
        if (block.type === 'heading') {
          const Heading = `h${Math.max(3, block.level)}`;
          return <Heading key={index}>{inline(block.text)}</Heading>;
        }
        if (block.items) {
          const List = block.type === 'ordered' ? 'ol' : 'ul';
          return (
            <List key={index} start={block.start}>
              {block.items.map((item, i) => (
                <li key={i}>{inline(item)}</li>
              ))}
            </List>
          );
        }
        return <p key={index}>{inline(block.text)}</p>;
      })}
    </div>
  );
}
