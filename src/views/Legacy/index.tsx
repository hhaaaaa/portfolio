import { createElement, type CSSProperties, type ReactNode } from 'react';

import english from '@/data/legacy/en.json';
import korean from '@/data/legacy/ko.json';

type LegacyNode =
  | string
  | { tag: string; attrs: Record<string, string>; children: LegacyNode[] };
export type Locale = 'ko' | 'en';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const voidTags = new Set(['br', 'hr', 'img']);

function localPath(value: string) {
  return value.startsWith('/') && !value.startsWith('//')
    ? `${basePath}${value}`
    : value;
}

function inlineStyle(value: string): CSSProperties {
  const style: Record<string, string> = {};
  value.split(';').forEach((declaration) => {
    const colon = declaration.indexOf(':');
    if (colon < 0) {
      return;
    }
    const key = declaration
      .slice(0, colon)
      .trim()
      .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
    const content = declaration
      .slice(colon + 1)
      .trim()
      .replace(
        /url\((['"]?)(\/images\/[^)'"]+)\1\)/g,
        (_, quote: string, path: string) =>
          `url(${quote}${localPath(path)}${quote})`,
      );
    if (key && content) {
      style[key] = content;
    }
  });
  return style;
}

function renderNode(node: LegacyNode, key: string): ReactNode {
  if (typeof node === 'string') {
    return node;
  }
  const props: Record<string, unknown> = { key };
  Object.entries(node.attrs).forEach(([name, value]) => {
    if (name === 'class') {
      props.className = value;
    } else if (name === 'style') {
      props.style = inlineStyle(value);
    } else if (name === 'href' || name === 'src') {
      props[name] = localPath(value);
    } else {
      props[name] = value;
    }
  });
  if (props.target === '_blank') {
    props.rel = 'noopener noreferrer';
  }
  if (voidTags.has(node.tag)) {
    return createElement(node.tag, props);
  }
  return createElement(
    node.tag,
    props,
    ...node.children.map((child, index) =>
      renderNode(child, `${key}-${index}`),
    ),
  );
}

export default function LegacyView({ locale }: { locale: Locale }) {
  const nodes = (locale === 'ko' ? korean : english) as LegacyNode[];
  return <>{nodes.map((node, index) => renderNode(node, String(index)))}</>;
}
