import { EditorOptions } from './types';
import { Commands } from './commands';
import { Toolbar } from './toolbar';
import { createElement, isSelectionInElement } from './utils';

export class BangEditor {
  private container: HTMLElement;
  private editorElement: HTMLElement;
  private toolbar: Toolbar;
  private commands: Commands;
  private options: EditorOptions;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(selector: string | HTMLElement, options: EditorOptions = {}) {
    this.options = {
      placeholder: 'Start typing...',
      height: '400px',
      minHeight: '200px',
      toolbar: undefined,
      onChange: undefined,
      onFocus: undefined,
      onBlur: undefined,
      imageUploadHandler: undefined,
      ...options
    };

    // Get or create container
    if (typeof selector === 'string') {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = selector;
    }

    // Initialize editor
    this.editorElement = this.createEditor();
    this.commands = new Commands(this.editorElement);
    this.toolbar = new Toolbar(this.commands, this.editorElement, this.options.toolbar);

    this.render();
    this.attachEvents();
  }

  private createEditor(): HTMLElement {
    const editor = createElement('div', 'bang-editor-content');
    editor.contentEditable = 'true';
    editor.setAttribute('data-placeholder', this.options.placeholder || '');
    
    if (this.options.height) {
      editor.style.height = this.options.height;
    }
    if (this.options.minHeight) {
      editor.style.minHeight = this.options.minHeight;
    }

    return editor;
  }

  private render(): void {
    // Clear container
    this.container.innerHTML = '';
    this.container.className = 'bang-editor-wrapper';

    // Add toolbar
    this.container.appendChild(this.toolbar.getElement());

    // Add editor
    this.container.appendChild(this.editorElement);
  }

  private attachEvents(): void {
    // Input event for change detection
    this.editorElement.addEventListener('input', () => {
      this.handleChange();
    });

    // Selection change for toolbar updates
    document.addEventListener('selectionchange', () => {
      if (isSelectionInElement(this.editorElement)) {
        this.toolbar.updateButtonStates();
      }
    });

    // Focus event
    this.editorElement.addEventListener('focus', () => {
      this.container.classList.add('focused');
      if (this.options.onFocus) {
        this.options.onFocus();
      }
      this.emit('focus');
    });

    // Blur event
    this.editorElement.addEventListener('blur', () => {
      this.container.classList.remove('focused');
      if (this.options.onBlur) {
        this.options.onBlur();
      }
      this.emit('blur');
    });

    // Keyboard shortcuts
    this.editorElement.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });

    // Paste event - clean up pasted content
    this.editorElement.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain');
      if (text) {
        document.execCommand('insertText', false, text);
      }
    });
  }

  private handleChange(): void {
    const content = this.getContent();
    if (this.options.onChange) {
      this.options.onChange(content);
    }
    this.emit('change', content);
  }

  private handleKeyboard(e: KeyboardEvent): void {
    // Ctrl/Cmd + B = Bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      this.commands.bold();
    }
    // Ctrl/Cmd + I = Italic
    else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      this.commands.italic();
    }
    // Ctrl/Cmd + U = Underline
    else if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      this.commands.underline();
    }
    // Ctrl/Cmd + Z = Undo
    else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.commands.undo();
    }
    // Ctrl/Cmd + Shift + Z = Redo
    else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      this.commands.redo();
    }
    // Ctrl/Cmd + Y = Redo (Windows)
    else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      this.commands.redo();
    }
  }

  // Public API Methods

  getContent(): string {
    return this.editorElement.innerHTML;
  }

  setContent(html: string): void {
    this.editorElement.innerHTML = html;
    this.handleChange();
  }

  getText(): string {
    return this.editorElement.textContent || '';
  }

  focus(): void {
    this.editorElement.focus();
  }

  blur(): void {
    this.editorElement.blur();
  }

  disable(): void {
    this.editorElement.contentEditable = 'false';
    this.container.classList.add('disabled');
  }

  enable(): void {
    this.editorElement.contentEditable = 'true';
    this.container.classList.remove('disabled');
  }

  clear(): void {
    this.editorElement.innerHTML = '';
    this.handleChange();
  }

  destroy(): void {
    this.container.innerHTML = '';
    this.eventListeners.clear();
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(...args));
    }
  }

  // Commands API
  executeCommand(command: string, value?: string): void {
    this.commands.execute(command, value);
  }
}
