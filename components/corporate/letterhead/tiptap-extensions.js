'use client';

/**
 * Custom TipTap nodes for letterhead (page break).
 * Font size / line height come from @tiptap/extension-text-style.
 */

import {Node, mergeAttributes} from '@tiptap/core';

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  parseHTML() {
    return [{tag: 'div[data-page-break]'}];
  },

  renderHTML({HTMLAttributes}) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-page-break': '',
        class: 'lh-page-break',
        contenteditable: 'false',
      }),
      ['span', {class: 'lh-page-break-label'}, 'Page break'],
    ];
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({commands}) =>
          commands.insertContent({type: this.name}),
    };
  },
});
