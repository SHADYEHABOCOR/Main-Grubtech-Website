import { describe, it, expect } from 'vitest';
import { sanitizeHtml, stripHtml } from './sanitizeHtml';

describe('sanitizeHtml utility', () => {
  describe('sanitizeHtml', () => {
    describe('safe HTML passthrough', () => {
      it('preserves safe paragraph tags', () => {
        const input = '<p>Hello world</p>';
        expect(sanitizeHtml(input)).toBe('<p>Hello world</p>');
      });

      it('preserves safe text formatting tags', () => {
        expect(sanitizeHtml('<strong>Bold</strong>')).toBe('<strong>Bold</strong>');
        expect(sanitizeHtml('<em>Italic</em>')).toBe('<em>Italic</em>');
        expect(sanitizeHtml('<u>Underline</u>')).toBe('<u>Underline</u>');
      });

      it('preserves safe heading tags', () => {
        expect(sanitizeHtml('<h1>Title</h1>')).toBe('<h1>Title</h1>');
        expect(sanitizeHtml('<h2>Subtitle</h2>')).toBe('<h2>Subtitle</h2>');
        expect(sanitizeHtml('<h3>Section</h3>')).toBe('<h3>Section</h3>');
        expect(sanitizeHtml('<h4>Subsection</h4>')).toBe('<h4>Subsection</h4>');
        expect(sanitizeHtml('<h5>Minor</h5>')).toBe('<h5>Minor</h5>');
        expect(sanitizeHtml('<h6>Smallest</h6>')).toBe('<h6>Smallest</h6>');
      });

      it('preserves safe list tags', () => {
        const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
        expect(sanitizeHtml(input)).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
      });

      it('preserves safe ordered list tags', () => {
        const input = '<ol><li>First</li><li>Second</li></ol>';
        expect(sanitizeHtml(input)).toBe('<ol><li>First</li><li>Second</li></ol>');
      });

      it('preserves safe link tags with allowed attributes', () => {
        const input = '<a href="https://example.com" title="Example" target="_blank" rel="noopener">Link</a>';
        expect(sanitizeHtml(input)).toBe('<a href="https://example.com" title="Example" target="_blank" rel="noopener">Link</a>');
      });

      it('preserves safe image tags with allowed attributes', () => {
        const input = '<img src="image.jpg" alt="Description" title="Image title" class="img-class">';
        expect(sanitizeHtml(input)).toBe('<img src="image.jpg" alt="Description" title="Image title" class="img-class">');
      });

      it('preserves safe table tags', () => {
        const input = '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Data</td></tr></tbody></table>';
        expect(sanitizeHtml(input)).toBe('<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Data</td></tr></tbody></table>');
      });

      it('preserves safe code and pre tags', () => {
        expect(sanitizeHtml('<code>const x = 1;</code>')).toBe('<code>const x = 1;</code>');
        expect(sanitizeHtml('<pre>Preformatted text</pre>')).toBe('<pre>Preformatted text</pre>');
      });

      it('preserves blockquote tags', () => {
        const input = '<blockquote>Quote text</blockquote>';
        expect(sanitizeHtml(input)).toBe('<blockquote>Quote text</blockquote>');
      });

      it('preserves br and hr tags', () => {
        expect(sanitizeHtml('Line 1<br>Line 2')).toBe('Line 1<br>Line 2');
        expect(sanitizeHtml('<hr>')).toBe('<hr>');
      });

      it('preserves class attributes', () => {
        const input = '<p class="text-center highlight">Styled text</p>';
        expect(sanitizeHtml(input)).toBe('<p class="text-center highlight">Styled text</p>');
      });
    });

    describe('XSS attack vector removal', () => {
      describe('script tag removal', () => {
        it('removes simple script tags', () => {
          const input = '<p>Safe</p><script>alert("xss")</script>';
          expect(sanitizeHtml(input)).toBe('<p>Safe</p>');
        });

        it('removes script tags with various quotes', () => {
          expect(sanitizeHtml("<script>alert('xss')</script>")).toBe('');
          expect(sanitizeHtml('<script>alert(`xss`)</script>')).toBe('');
        });

        it('removes script tags with attributes', () => {
          const input = '<script type="text/javascript">alert("xss")</script>';
          expect(sanitizeHtml(input)).toBe('');
        });

        it('removes inline script tags', () => {
          const input = '<p>Text<script>alert("xss")</script>More text</p>';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('<script');
          expect(result).not.toContain('alert');
        });
      });

      describe('event handler removal', () => {
        it('removes onerror handlers from img tags', () => {
          const input = '<img src="x" onerror="alert(\'xss\')">';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('onerror');
          expect(result).not.toContain('alert');
        });

        it('removes onclick handlers', () => {
          const input = '<a href="#" onclick="alert(\'xss\')">Click</a>';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('onclick');
          expect(result).not.toContain('alert');
        });

        it('removes onload handlers', () => {
          const input = '<img src="x" onload="alert(\'xss\')">';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('onload');
        });

        it('removes onmouseover handlers', () => {
          const input = '<p onmouseover="alert(\'xss\')">Hover me</p>';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('onmouseover');
        });

        it('removes multiple event handlers', () => {
          const input = '<a href="#" onclick="bad()" onmouseover="worse()" onload="worst()">Link</a>';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('onclick');
          expect(result).not.toContain('onmouseover');
          expect(result).not.toContain('onload');
        });
      });

      describe('javascript: URL removal', () => {
        it('removes javascript: URLs from href attributes', () => {
          const input = '<a href="javascript:alert(\'xss\')">Click</a>';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('javascript:');
          expect(result).not.toContain('alert');
        });

        it('removes javascript: URLs with various encodings', () => {
          const input = '<a href="javascript:void(0)">Link</a>';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('javascript:');
        });

        it('removes javascript: URLs from img src', () => {
          const input = '<img src="javascript:alert(\'xss\')">';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('javascript:');
        });

        it('allows safe URLs in href', () => {
          const input = '<a href="https://example.com">Safe link</a>';
          expect(sanitizeHtml(input)).toContain('href="https://example.com"');
        });

        it('allows safe relative URLs', () => {
          const input = '<a href="/path/to/page">Internal link</a>';
          expect(sanitizeHtml(input)).toContain('href="/path/to/page"');
        });
      });

      describe('data attribute removal', () => {
        it('removes data attributes from elements', () => {
          const input = '<div data-malicious="payload">Content</div>';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('data-malicious');
          expect(result).not.toContain('payload');
        });

        it('removes multiple data attributes', () => {
          const input = '<p data-id="123" data-action="execute">Text</p>';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('data-id');
          expect(result).not.toContain('data-action');
        });

        it('removes data attributes from allowed tags', () => {
          const input = '<a href="#" data-tracking="evil">Link</a>';
          const result = sanitizeHtml(input);
          expect(result).toContain('href');
          expect(result).not.toContain('data-tracking');
        });
      });

      describe('SVG-based XSS removal', () => {
        it('removes svg tags with onload', () => {
          const input = '<svg onload="alert(\'xss\')"></svg>';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('svg');
          expect(result).not.toContain('onload');
        });

        it('removes svg tags entirely', () => {
          const input = '<p>Safe</p><svg><circle cx="50" cy="50" r="40"/></svg>';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('svg');
          expect(result).not.toContain('circle');
        });
      });

      describe('other malicious tags removal', () => {
        it('removes iframe tags', () => {
          const input = '<iframe src="malicious.com"></iframe>';
          expect(sanitizeHtml(input)).not.toContain('iframe');
        });

        it('removes object tags', () => {
          const input = '<object data="malicious.swf"></object>';
          expect(sanitizeHtml(input)).not.toContain('object');
        });

        it('removes embed tags', () => {
          const input = '<embed src="malicious.swf">';
          expect(sanitizeHtml(input)).not.toContain('embed');
        });

        it('removes style tags', () => {
          const input = '<style>body { background: url("javascript:alert(1)") }</style>';
          expect(sanitizeHtml(input)).not.toContain('style');
        });

        it('removes style attributes', () => {
          const input = '<p style="background: url(javascript:alert(1))">Text</p>';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('style=');
        });
      });

      describe('complex attack scenarios', () => {
        it('handles mixed safe and malicious content', () => {
          const input = '<p>Safe paragraph</p><script>alert("xss")</script><strong>Safe bold</strong>';
          const result = sanitizeHtml(input);
          expect(result).toContain('<p>Safe paragraph</p>');
          expect(result).toContain('<strong>Safe bold</strong>');
          expect(result).not.toContain('script');
          expect(result).not.toContain('alert');
        });

        it('handles nested malicious tags', () => {
          const input = '<div><script><script>alert("xss")</script></script></div>';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('script');
        });

        it('handles malicious attributes on multiple tags', () => {
          const input = '<a href="javascript:void(0)" onclick="bad()">Link</a><img src="x" onerror="bad()">';
          const result = sanitizeHtml(input);
          expect(result).not.toContain('javascript:');
          expect(result).not.toContain('onclick');
          expect(result).not.toContain('onerror');
          expect(result).not.toContain('bad()');
        });
      });
    });

    describe('edge cases', () => {
      it('handles empty string', () => {
        expect(sanitizeHtml('')).toBe('');
      });

      it('handles whitespace-only string', () => {
        expect(sanitizeHtml('   ')).toBe('   ');
      });

      it('handles plain text without HTML', () => {
        const input = 'Plain text content';
        expect(sanitizeHtml(input)).toBe('Plain text content');
      });

      it('handles unclosed tags gracefully', () => {
        const input = '<p>Unclosed paragraph';
        const result = sanitizeHtml(input);
        expect(result).toContain('Unclosed paragraph');
      });

      it('handles malformed HTML', () => {
        const input = '<p>Text</p><>Invalid<p>More</p>';
        const result = sanitizeHtml(input);
        expect(result).toContain('Text');
        expect(result).toContain('More');
      });

      it('handles special characters', () => {
        const input = '<p>&amp; &lt; &gt; &quot;</p>';
        expect(sanitizeHtml(input)).toContain('&amp;');
      });

      it('handles unicode characters', () => {
        const input = '<p>Hello 世界 🌍</p>';
        expect(sanitizeHtml(input)).toBe('<p>Hello 世界 🌍</p>');
      });

      it('handles very long content', () => {
        const longText = 'A'.repeat(10000);
        const input = `<p>${longText}</p>`;
        const result = sanitizeHtml(input);
        expect(result).toContain(longText);
      });

      it('handles deeply nested safe tags', () => {
        const input = '<ul><li><strong><em>Nested</em></strong></li></ul>';
        expect(sanitizeHtml(input)).toBe('<ul><li><strong><em>Nested</em></strong></li></ul>');
      });
    });
  });

  describe('stripHtml', () => {
    it('removes all HTML tags from simple content', () => {
      const input = '<p>Hello world</p>';
      expect(stripHtml(input)).toBe('Hello world');
    });

    it('removes all HTML tags while preserving text', () => {
      const input = '<p>Hello <strong>world</strong></p>';
      expect(stripHtml(input)).toBe('Hello world');
    });

    it('removes multiple different tags', () => {
      const input = '<h1>Title</h1><p>Paragraph</p><a href="#">Link</a>';
      expect(stripHtml(input)).toBe('TitleParagraphLink');
    });

    it('removes nested tags', () => {
      const input = '<div><p><strong>Bold</strong> and <em>italic</em></p></div>';
      expect(stripHtml(input)).toBe('Bold and italic');
    });

    it('preserves text content spacing', () => {
      const input = '<p>First sentence. Second sentence.</p>';
      expect(stripHtml(input)).toBe('First sentence. Second sentence.');
    });

    it('handles empty string', () => {
      expect(stripHtml('')).toBe('');
    });

    it('handles plain text without HTML', () => {
      const input = 'Plain text';
      expect(stripHtml(input)).toBe('Plain text');
    });

    it('removes malicious HTML safely', () => {
      const input = '<script>alert("xss")</script>Normal text';
      const result = stripHtml(input);
      expect(result).not.toContain('<script');
      expect(result).toContain('Normal text');
    });

    it('handles self-closing tags', () => {
      const input = 'Text<br>More text<hr>End';
      expect(stripHtml(input)).toBe('TextMore textEnd');
    });

    it('handles special characters', () => {
      const input = '<p>&amp; &lt; &gt;</p>';
      const result = stripHtml(input);
      expect(result).toContain('&amp;');
    });

    it('handles unicode and emojis', () => {
      const input = '<p>Hello 世界 🌍</p>';
      expect(stripHtml(input)).toBe('Hello 世界 🌍');
    });

    it('removes attributes along with tags', () => {
      const input = '<a href="http://example.com" class="link">Click here</a>';
      expect(stripHtml(input)).toBe('Click here');
    });

    it('handles unclosed tags gracefully', () => {
      const input = '<p>Unclosed paragraph text';
      expect(stripHtml(input)).toContain('Unclosed paragraph text');
    });

    it('handles complex HTML structure', () => {
      const input = `
        <article>
          <h1>Title</h1>
          <p>First paragraph.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </article>
      `;
      const result = stripHtml(input);
      expect(result).toContain('Title');
      expect(result).toContain('First paragraph.');
      expect(result).toContain('Item 1');
      expect(result).toContain('Item 2');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });
  });
});
