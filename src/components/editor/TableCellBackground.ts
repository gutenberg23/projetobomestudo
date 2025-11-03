import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableCellBackground: {
      /**
       * Set the background color of a table cell
       */
      setTableCellBackground: (backgroundColor: string) => ReturnType;
    }
  }
}

export const TableCellBackground = Extension.create({
  name: 'tableCellBackground',

  addOptions() {
    return {
      types: ['tableCell', 'tableHeader'],
      backgroundColors: [
        { name: 'Default', value: '' },
        { name: 'Purple', value: 'rgb(95, 46, 190)' },
        { name: 'Light Gray', value: 'rgb(226, 232, 240)' },
        { name: 'Yellow', value: 'rgb(254, 252, 232)' },
        { name: 'Blue', value: 'rgb(219, 234, 254)' },
        { name: 'Green', value: 'rgb(220, 252, 231)' },
        { name: 'Red', value: 'rgb(254, 226, 226)' },
      ],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: element => element.style.backgroundColor || null,
            renderHTML: attributes => {
              if (!attributes.backgroundColor) {
                return {};
              }
              return {
                style: `background-color: ${attributes.backgroundColor}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTableCellBackground: (backgroundColor) => ({ commands }) => {
        return commands.updateAttributes('tableCell', { backgroundColor }) ||
               commands.updateAttributes('tableHeader', { backgroundColor });
      },
    };
  },
});