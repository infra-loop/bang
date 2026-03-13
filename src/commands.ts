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

  insertVideo(url: string): void {
    if (!url) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'bang-video-wrapper';
    wrapper.contentEditable = 'false';

    // Detect provider and build embed
    const embedUrl = this.getEmbedUrl(url);
    if (embedUrl) {
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      wrapper.appendChild(iframe);
    } else {
      // Treat as direct video file URL
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.preload = 'metadata';
      wrapper.appendChild(video);
    }

    this.insertElement(wrapper);

    // Insert a paragraph after so the user can keep typing
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    wrapper.after(p);
  }

  private getEmbedUrl(url: string): string | null {
    // YouTube
    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;

    // Vimeo
    match = url.match(/vimeo\.com\/(\d+)/);
    if (match) return `https://player.vimeo.com/video/${match[1]}`;

    // Dailymotion
    match = url.match(/dailymotion\.com\/video\/([\w]+)/);
    if (match) return `https://www.dailymotion.com/embed/video/${match[1]}`;

    // Loom
    match = url.match(/loom\.com\/share\/([\w]+)/);
    if (match) return `https://www.loom.com/embed/${match[1]}`;

    return null;
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
