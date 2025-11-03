import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { QuestionNode } from './QuestionNode';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    questionNode: {
      setQuestionNode: (options: { questionId: string }) => ReturnType;
    }
  }
}

export const QuestionExtension = Node.create({
  name: 'questionNode',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      questionId: {
        default: null,
        parseHTML: element => element.getAttribute('data-question-id'),
        renderHTML: attributes => {
          if (!attributes.questionId) {
            return {};
          }
          return {
            'data-question-id': attributes.questionId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-question-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuestionNode);
  },

  addCommands() {
    return {
      setQuestionNode: (options: { questionId: string }) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            questionId: options.questionId,
          },
        });
      },
    };
  },
});