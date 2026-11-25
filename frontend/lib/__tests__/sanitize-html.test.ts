import { promoteCmsSectionTitles } from '@/lib/sanitize-html';

describe('promoteCmsSectionTitles', () => {
  it('promotes a bold-only paragraph to h2', () => {
    expect(promoteCmsSectionTitles('<p><strong>Refunds</strong></p>')).toBe('<h2>Refunds</h2>');
  });

  it('never merges several paragraphs into one heading', () => {
    const html = '<p><b>Note</b> short</p><p>Body</p><p><b>Next</b></p>';
    expect(promoteCmsSectionTitles(html)).toBe('<p><b>Note</b> short</p><p>Body</p><h2>Next</h2>');
  });
});
