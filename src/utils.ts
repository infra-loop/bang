export function saveSelection(): Range | null {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    return selection.getRangeAt(0);
  }
  return null;
}

export function restoreSelection(range: Range | null): void {
  if (range) {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

export function isSelectionInElement(element: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;

  return element.contains(container.nodeType === 3 ? container.parentNode : container);
}

export function wrapSelectedText(tag: string): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();

  if (selectedText) {
    const wrapper = document.createElement(tag);
    wrapper.textContent = selectedText;
    range.deleteContents();
    range.insertNode(wrapper);
  }
}

export function createElement(tag: string, className?: string, attributes?: Record<string, string>): HTMLElement {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  return element;
}

// Void elements that should not have closing tags
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

// Inline elements that should not get extra newlines
const INLINE_ELEMENTS = new Set([
  'a', 'abbr', 'b', 'bdo', 'br', 'cite', 'code', 'dfn', 'em', 'i',
  'img', 'input', 'kbd', 'label', 'mark', 'q', 's', 'samp', 'small',
  'span', 'strong', 'sub', 'sup', 'time', 'u', 'var'
]);

export function formatHtml(html: string): string {
  // Remove existing whitespace between tags
  let formatted = html.replace(/>\s+</g, '><').trim();
  if (!formatted) return '';

  let result = '';
  let indent = 0;
  const tab = '  ';
  let i = 0;

  while (i < formatted.length) {
    if (formatted[i] === '<') {
      // Find end of tag
      const tagEnd = formatted.indexOf('>', i);
      if (tagEnd === -1) break;

      const fullTag = formatted.substring(i, tagEnd + 1);
      const tagNameMatch = fullTag.match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)/);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
      const isClosing = fullTag.startsWith('</');
      const isSelfClosing = fullTag.endsWith('/>') || VOID_ELEMENTS.has(tagName);
      const isInline = INLINE_ELEMENTS.has(tagName);

      if (isClosing) {
        indent = Math.max(0, indent - 1);
      }

      if (isInline) {
        // Inline elements: no extra newlines
        result += fullTag;
      } else {
        // Block elements: add newline and indent
        if (result && !result.endsWith('\n')) {
          result += '\n';
        }
        result += tab.repeat(indent) + fullTag;
      }

      if (!isClosing && !isSelfClosing && !isInline) {
        indent++;
      }

      i = tagEnd + 1;
    } else {
      // Text content
      let textEnd = formatted.indexOf('<', i);
      if (textEnd === -1) textEnd = formatted.length;
      const text = formatted.substring(i, textEnd);
      if (text.trim()) {
        // Check if this text is between inline elements
        const prevIsInline = result.length > 0 && !result.endsWith('\n');
        if (prevIsInline) {
          result += text;
        } else {
          if (result && !result.endsWith('\n')) {
            result += '\n';
          }
          result += tab.repeat(indent) + text;
        }
      }
      i = textEnd;
    }
  }

  return result.trim();
}

export function highlightHtml(html: string): string {
  // Escape HTML entities first for display
  let escaped = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Highlight HTML tags
  // Opening/closing tags
  escaped = escaped.replace(
    /(&lt;\/?)([\w-]+)((?:\s+[\w-]+(?:=&quot;[^&]*?&quot;)?)*\s*\/?)(&gt;)/g,
    (_, open, tagName, attrs, close) => {
      // Highlight attributes within the tag
      let highlightedAttrs = attrs.replace(
        /([\w-]+)(=)(&quot;)([^&]*?)(&quot;)/g,
        '<span class="bang-html-attr">$1</span>$2<span class="bang-html-string">$3$4$5</span>'
      );
      return `<span class="bang-html-bracket">${open}</span><span class="bang-html-tag">${tagName}</span>${highlightedAttrs}<span class="bang-html-bracket">${close}</span>`;
    }
  );

  return escaped;
}
