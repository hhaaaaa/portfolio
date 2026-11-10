"""Convert trusted, locally downloaded legacy pages into structured React data.

Usage: python scripts/import-legacy.py <korean-html> <english-html>
The generated JSON retains text, semantic elements and display attributes only.
"""
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
VOID = {'br', 'hr', 'img'}
ALLOWED = {'a', 'b', 'br', 'code', 'div', 'h1', 'h2', 'h3', 'h4', 'hr',
           'img', 'li', 'main', 'mark', 'p', 'span', 'strong', 'table', 'tbody',
           'td', 'th', 'tr', 'ul'}
ATTRS = {'aria-label', 'class', 'href', 'src', 'style', 'target', 'title', 'alt'}


class LegacyParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = {'tag': 'body', 'children': []}
        self.stack = [self.root]
        self.in_body = False

    def handle_starttag(self, tag, attrs):
        if tag == 'body':
            self.in_body = True
            return
        if not self.in_body:
            return
        if tag not in ALLOWED:
            raise ValueError(f'Unexpected legacy element: {tag}')
        props = {k: v for k, v in attrs if k in ATTRS and v is not None}
        for key in ('href', 'src'):
            value = props.get(key, '')
            if value and not (value.startswith(('/', '#', 'https://', 'http://', 'mailto:', 'tel:'))):
                raise ValueError(f'Unexpected {key}: {value}')
        if tag == 'img' and 'alt' not in props:
            path = unquote(urlparse(props.get('src', '')).path)
            badge = re.search(r'/badge/(.+?)-[0-9A-Fa-f]{6}$', path)
            props['alt'] = badge.group(1).replace('--', '-').replace('_', ' ') if badge else ''
        node = {'tag': tag, 'attrs': props, 'children': []}
        self.stack[-1]['children'].append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.in_body:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == 'body':
            self.in_body = False
        elif self.in_body and tag not in VOID:
            if len(self.stack) == 1 or self.stack[-1]['tag'] != tag:
                raise ValueError(f'Unexpected closing tag: {tag}')
            self.stack.pop()

    def handle_data(self, data):
        if self.in_body and data:
            self.stack[-1]['children'].append(data)


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    output = ROOT / 'src' / 'data' / 'legacy'
    output.mkdir(parents=True, exist_ok=True)
    for locale, file in zip(('ko', 'en'), sys.argv[1:]):
        parser = LegacyParser()
        parser.feed(Path(file).read_text(encoding='utf-8'))
        if len(parser.stack) != 1:
            raise ValueError('Legacy HTML contains unclosed elements')
        (output / f'{locale}.json').write_text(
            json.dumps(parser.root['children'], ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
        )


if __name__ == '__main__':
    main()
