import { TableOptions } from './types';

export class Commands {
  private editorElement: HTMLElement;

  constructor(editorElement: HTMLElement) {
    this.editorElement = editorElement;
  }

  execute(command: string, value?: string): void {
    this.editorElement.focus();
    document.execCommand(command, false, value);
  }

  bold(): void {
    this.execute('bold');
  }

  italic(): void {
    this.execute('italic');
  }

  underline(): void {
    this.execute('underline');
  }

  strikethrough(): void {
    this.execute('strikeThrough');
  }

  heading(level: number): void {
    this.execute('formatBlock', `<h${level}>`);
  }

  paragraph(): void {
    this.execute('formatBlock', '<p>');
  }

  alignLeft(): void {
    this.execute('justifyLeft');
  }

  alignCenter(): void {
    this.execute('justifyCenter');
  }

  alignRight(): void {
    this.execute('justifyRight');
  }

  alignJustify(): void {
    this.execute('justifyFull');
  }

  orderedList(): void {
    this.execute('insertOrderedList');
  }

  unorderedList(): void {
    this.execute('insertUnorderedList');
  }

  createLink(url: string): void {
    if (url) {
      this.execute('createLink', url);
    }
  }

  unlink(): void {
    this.execute('unlink');
  }

  insertImage(url: string, alt?: string): void {
    if (url) {
      if (alt) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = alt;
        this.insertElement(img);
      } else {
        this.execute('insertImage', url);
      }
    }
  }

  insertTable(options: TableOptions): void {
    const { rows, cols } = options;
    const table = document.createElement('table');
    table.className = 'bang-table';

    for (let i = 0; i < rows; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < cols; j++) {
        const td = document.createElement('td');
        td.innerHTML = '<br>'; // Ensure cells are editable
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    this.insertElement(table);
  }

  private insertElement(element: HTMLElement): void {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(element);

      // Move cursor after inserted element
      range.setStartAfter(element);
      range.setEndAfter(element);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      this.editorElement.appendChild(element);
    }
  }

  undo(): void {
    this.execute('undo');
  }

  redo(): void {
    this.execute('redo');
  }

  queryCommandState(command: string): boolean {
    return document.queryCommandState(command);
  }

  queryCommandValue(command: string): string {
    return document.queryCommandValue(command);
  }
}
