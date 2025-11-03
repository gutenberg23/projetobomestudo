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
    // Renderizar como uma tag especial que pode ser identificada posteriormente
    // Mas também incluir o formato de texto [question:id] para garantir compatibilidade
    return ['div', mergeAttributes(HTMLAttributes, { 'data-question-node': 'true' }), `[question:${HTMLAttributes['data-question-id']}]`];
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