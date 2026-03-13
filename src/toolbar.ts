import { ButtonConfig, ToolbarButton } from './types';
import { createElement } from './utils';
import { Commands } from './commands';

export class Toolbar {
  private container: HTMLElement;
  private commands: Commands;
  private buttons: Map<string, HTMLButtonElement> = new Map();

  private buttonConfigs: ButtonConfig[] = [
    { name: 'bold', icon: '𝐁', title: 'Bold (Ctrl+B)', command: 'bold' },
    { name: 'italic', icon: '𝐼', title: 'Italic (Ctrl+I)', command: 'italic' },
    { name: 'underline', icon: '𝐔', title: 'Underline (Ctrl+U)', command: 'underline' },
    { name: 'strikethrough', icon: 'S̶', title: 'Strikethrough', command: 'strikeThrough' },
    { name: 'h1', icon: 'H1', title: 'Heading 1', command: 'formatBlock', value: '<h1>' },
    { name: 'h2', icon: 'H2', title: 'Heading 2', command: 'formatBlock', value: '<h2>' },
    { name: 'h3', icon: 'H3', title: 'Heading 3', command: 'formatBlock', value: '<h3>' },
    { name: 'h4', icon: 'H4', title: 'Heading 4', command: 'formatBlock', value: '<h4>' },
    { name: 'h5', icon: 'H5', title: 'Heading 5', command: 'formatBlock', value: '<h5>' },
    { name: 'h6', icon: 'H6', title: 'Heading 6', command: 'formatBlock', value: '<h6>' },
    { name: 'paragraph', icon: 'P', title: 'Paragraph', command: 'formatBlock', value: '<p>' },
    { name: 'alignLeft', icon: '≡', title: 'Align Left', command: 'justifyLeft' },
    { name: 'alignCenter', icon: '≡', title: 'Align Center', command: 'justifyCenter' },
    { name: 'alignRight', icon: '≡', title: 'Align Right', command: 'justifyRight' },
    { name: 'alignJustify', icon: '≡', title: 'Justify', command: 'justifyFull' },
    { name: 'orderedList', icon: '1.', title: 'Ordered List', command: 'insertOrderedList' },
    { name: 'unorderedList', icon: '•', title: 'Unordered List', command: 'insertUnorderedList' },
    { name: 'link', icon: '🔗', title: 'Insert Link', action: () => this.handleLinkInsert() },
    { name: 'unlink', icon: '🚫', title: 'Remove Link', command: 'unlink' },
    { name: 'image', icon: '🖼', title: 'Insert Image', action: () => this.handleImageInsert() },
    { name: 'table', icon: '⊞', title: 'Insert Table', action: () => this.handleTableInsert() },
    { name: 'code', icon: '<>', title: 'Code Block', action: () => this.commands.insertCode() },
    { name: 'undo', icon: '↶', title: 'Undo', command: 'undo' },
    { name: 'redo', icon: '↷', title: 'Redo', command: 'redo' },
  ];

  constructor(commands: Commands, _editorElement: HTMLElement, toolbarButtons?: ToolbarButton[]) {
    this.commands = commands;
    this.container = createElement('div', 'bang-toolbar');
    this.createButtons(toolbarButtons);
  }

  private createButtons(toolbarButtons?: ToolbarButton[]): void {
    const buttonsToShow = toolbarButtons || [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'h1', 'h2', 'h3', '|',
      'alignLeft', 'alignCenter', 'alignRight', '|',
      'orderedList', 'unorderedList', '|',
      'link', 'image', 'table', 'code', '|',
      'undo', 'redo'
    ];

    buttonsToShow.forEach(buttonName => {
      if (buttonName === '|') {
        const separator = createElement('span', 'bang-toolbar-separator');
        this.container.appendChild(separator);
        return;
      }

      const config = this.buttonConfigs.find(b => b.name === buttonName);
      if (!config) return;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bang-toolbar-button';
      button.innerHTML = config.icon;
      button.title = config.title;
      button.setAttribute('data-command', config.name);

      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleButtonClick(config);
      });

      this.buttons.set(config.name, button);
      this.container.appendChild(button);
    });
  }

  private handleButtonClick(config: ButtonConfig): void {
    if (config.action) {
      config.action();
    } else if (config.command) {
      this.commands.execute(config.command, config.value);
    }
    this.updateButtonStates();
  }

  private handleLinkInsert(): void {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
      this.commands.createLink(url);
    }
  }

  private handleImageInsert(): void {
    const url = prompt('Enter image URL:', 'https://');
    if (url) {
      this.commands.insertImage(url);
    }
  }

  private handleTableInsert(): void {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    
    if (rows && cols) {
      this.commands.insertTable({
        rows: parseInt(rows, 10),
        cols: parseInt(cols, 10)
      });
    }
  }

  updateButtonStates(): void {
    // Update active states for formatting buttons
    const formatButtons = ['bold', 'italic', 'underline', 'strikeThrough'];
    
    formatButtons.forEach(command => {
      const button = this.buttons.get(command);
      if (button) {
        const isActive = this.commands.queryCommandState(command);
        button.classList.toggle('active', isActive);
      }
    });

    // Check for heading states
    const blockFormat = this.commands.queryCommandValue('formatBlock').toLowerCase();
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].forEach(tag => {
      const button = this.buttons.get(tag === 'p' ? 'paragraph' : tag);
      if (button) {
        button.classList.toggle('active', blockFormat === tag);
      }
    });

    // Check for list states
    const orderedListBtn = this.buttons.get('orderedList');
    const unorderedListBtn = this.buttons.get('unorderedList');
    
    if (orderedListBtn) {
      orderedListBtn.classList.toggle('active', this.commands.queryCommandState('insertOrderedList'));
    }
    if (unorderedListBtn) {
      unorderedListBtn.classList.toggle('active', this.commands.queryCommandState('insertUnorderedList'));
    }
  }

  getElement(): HTMLElement {
    return this.container;
  }
}
