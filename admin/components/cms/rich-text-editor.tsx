'use client';

import { useEffect, useId, useRef, type ClipboardEvent } from 'react';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Editor area styles mirror the storefront `.cms-content-wrapper` so admins see the real
 * heading / paragraph hierarchy (Tailwind preflight otherwise makes headings look like body text).
 */
const EDITOR_CONTENT_CLASSES =
  '[&_h1]:mt-5 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline [&>*:first-child]:mt-0';

type RichTextEditorProps = {
  value: string;
  onChange: (next: string) => void;
  label?: string;
};

export function RichTextEditor({ value, onChange, label }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const toolbarId = `rte-${useId()}`;

  useEffect(() => {
    // Enter starts a <p>, not a <div> or a continued heading.
    document.execCommand('defaultParagraphSeparator', false, 'p');
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const exec = (command: string, commandValue?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current.innerHTML);
  };

  /** Paste as plain text so source formatting (e.g. headings from a chat or web page) can't wrap body text. */
  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    e.preventDefault();
    const blocks = text
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (blocks.length <= 1) {
      exec('insertText', blocks[0] ?? '');
    } else {
      exec('insertHTML', blocks.map((line) => `<p>${escapeHtml(line)}</p>`).join(''));
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL (https://...)');
    if (!url) return;
    exec('createLink', url.trim());
  };

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={toolbarId} className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </label>
      ) : null}
      <div id={toolbarId} className="rounded-lg border border-zinc-300 dark:border-zinc-700">
        <div className="flex flex-wrap gap-1 border-b border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900">
          <ToolbarButton onClick={() => exec('formatBlock', '<h2>')} title="Heading">
            H2
          </ToolbarButton>
          <ToolbarButton onClick={() => exec('formatBlock', '<h3>')} title="Subheading">
            H3
          </ToolbarButton>
          <ToolbarButton onClick={() => exec('formatBlock', '<p>')} title="Normal paragraph text">
            Paragraph
          </ToolbarButton>
          <ToolbarButton onClick={() => exec('bold')} title="Bold">
            B
          </ToolbarButton>
          <ToolbarButton onClick={() => exec('italic')} title="Italic">
            I
          </ToolbarButton>
          <ToolbarButton onClick={() => exec('underline')} title="Underline">
            U
          </ToolbarButton>
          <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Bulleted list">
            • List
          </ToolbarButton>
          <ToolbarButton onClick={() => exec('insertOrderedList')} title="Numbered list">
            1. List
          </ToolbarButton>
          <ToolbarButton onClick={addLink} title="Insert link">
            Link
          </ToolbarButton>
          <ToolbarButton onClick={() => exec('removeFormat')} title="Clear formatting">
            Clear
          </ToolbarButton>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className={`min-h-[160px] w-full rounded-b-lg bg-white p-3 text-sm text-zinc-900 outline-none dark:bg-zinc-950 dark:text-zinc-100 ${EDITOR_CONTENT_CLASSES}`}
          onInput={(e) => onChange((e.currentTarget as HTMLDivElement).innerHTML)}
          onPaste={handlePaste}
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  children,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
    >
      {children}
    </button>
  );
}
