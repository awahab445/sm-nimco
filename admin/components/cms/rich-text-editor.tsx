'use client';

import { useEffect, useMemo, useRef } from 'react';

type RichTextEditorProps = {
  value: string;
  onChange: (next: string) => void;
  label?: string;
};

export function RichTextEditor({ value, onChange, label }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const toolbarId = useMemo(
    () => `rte-${Math.random().toString(36).slice(2, 10)}`,
    [],
  );

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
          className="min-h-[160px] w-full rounded-b-lg bg-white p-3 text-sm text-zinc-900 outline-none dark:bg-zinc-950 dark:text-zinc-100"
          onInput={(e) => onChange((e.currentTarget as HTMLDivElement).innerHTML)}
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
