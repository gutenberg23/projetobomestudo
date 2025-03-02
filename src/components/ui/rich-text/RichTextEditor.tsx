
import React from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
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
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
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
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  return (
    <div className="flex flex-col gap-2 w-full font-inter">
      {editor && <RichTextToolbar editor={editor} />}
      
      {/* Editor Tiptap */}
      <div className={cn(
        "rounded-b-md border-x border-b border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-auto",
        "min-h-[80px] w-full",
        className
      )}>
        {editor && <EditorContent editor={editor} />}
      </div>
    </div>
  );
};

export default RichTextEditor;
