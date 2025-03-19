import React, { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { cn } from "@/lib/utils";
import RichTextToolbar from "./RichTextToolbar";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange,
  className 
}) => {
  // Memoize extensions to prevent unnecessary re-renders
  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: true,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: true,
      },
    }),
    TextStyle,
    Color,
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right'],
      defaultAlignment: 'left',
    }),
    Link.configure({
      openOnClick: false,
      linkOnPaste: true,
      HTMLAttributes: {
        class: 'text-[#ea2be2] underline',
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'border-collapse table-auto w-full',
      },
    }),
    TableRow.configure({
      HTMLAttributes: {
        class: 'border-b border-gray-200',
      },
    }),
    TableHeader.configure({
      HTMLAttributes: {
        class: 'border border-gray-300 px-4 py-2 bg-gray-100 font-medium text-[#272f3c]',
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: 'border border-gray-300 px-4 py-2 text-[#67748a]',
      },
    }),
  ], []);

  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Atualizar o conteúdo do editor quando o valor muda externamente
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="flex flex-col gap-2 w-full font-inter">
      {editor && <RichTextToolbar editor={editor} />}
      
      {/* Editor Tiptap */}
      <div className={cn(
        "rounded-b-md border-x border-b border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-auto",
        "min-h-[250px] max-h-[500px] w-full resize-y",
        className
      )}>
        <EditorContent 
          editor={editor} 
          className="prose prose-custom max-w-none h-full" 
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
