import { ButtonConfig, ToolbarButton } from './types';
import { createElement, saveSelection, restoreSelection } from './utils';
import { Commands } from './commands';

export class Toolbar {
  private container: HTMLElement;
  private commands: Commands;
  private buttons: Map<string, HTMLButtonElement> = new Map();
  private formatDropdown: HTMLElement | null = null;
  private alignDropdown: HTMLElement | null = null;
  private onHtmlViewToggle: (() => void) | null = null;
  private isHtmlView: boolean = false;
  private activePopover: HTMLElement | null = null;
  private savedRange: Range | null = null;

  private buttonConfigs: ButtonConfig[] = [
    { name: 'bold', icon: '<b>B</b>', title: 'Bold (Ctrl+B)', command: 'bold' },
    { name: 'italic', icon: '<i>I</i>', title: 'Italic (Ctrl+I)', command: 'italic' },
    { name: 'underline', icon: '<u>U</u>', title: 'Underline (Ctrl+U)', command: 'underline' },
    { name: 'strikethrough', icon: '<s>S</s>', title: 'Strikethrough', command: 'strikeThrough' },
    { name: 'fontColor', icon: '<span class="bang-icon-fontcolor">A</span>', title: 'Font Color', action: () => this.handleFontColor() },
    { name: 'h1', icon: 'H1', title: 'Heading 1', command: 'formatBlock', value: '<h1>' },
    { name: 'h2', icon: 'H2', title: 'Heading 2', command: 'formatBlock', value: '<h2>' },
    { name: 'h3', icon: 'H3', title: 'Heading 3', command: 'formatBlock', value: '<h3>' },
    { name: 'h4', icon: 'H4', title: 'Heading 4', command: 'formatBlock', value: '<h4>' },
    { name: 'h5', icon: 'H5', title: 'Heading 5', command: 'formatBlock', value: '<h5>' },
    { name: 'h6', icon: 'H6', title: 'Heading 6', command: 'formatBlock', value: '<h6>' },
    { name: 'paragraph', icon: 'P', title: 'Paragraph', command: 'formatBlock', value: '<p>' },
    { name: 'alignLeft', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`, title: 'Align Left', command: 'justifyLeft' },
    { name: 'alignCenter', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`, title: 'Align Center', command: 'justifyCenter' },
    { name: 'alignRight', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`, title: 'Align Right', command: 'justifyRight' },
    { name: 'alignJustify', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`, title: 'Justify', command: 'justifyFull' },
    { name: 'orderedList', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="3" y="7" font-size="6" fill="currentColor" stroke="none">1</text><text x="3" y="13" font-size="6" fill="currentColor" stroke="none">2</text><text x="3" y="19" font-size="6" fill="currentColor" stroke="none">3</text></svg>`, title: 'Ordered List', command: 'insertOrderedList' },
    { name: 'unorderedList', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>`, title: 'Unordered List', command: 'insertUnorderedList' },
    { name: 'link', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`, title: 'Insert Link', action: () => this.handleLinkInsert() },
    { name: 'unlink', icon: '🚫', title: 'Remove Link', command: 'unlink' },
    { name: 'image', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`, title: 'Insert Image', action: () => this.handleImageInsert() },
    { name: 'video', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10 8 16 12 10 16" fill="currentColor" stroke="none"/></svg>`, title: 'Insert Video', action: () => this.handleVideoInsert() },
    { name: 'table', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`, title: 'Insert Table', action: () => this.handleTableInsert() },
    { name: 'htmlView', icon: `&lt;/&gt;`, title: 'Toggle HTML View', action: () => this.toggleHtmlView() },
    { name: 'undo', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`, title: 'Undo', command: 'undo' },
    { name: 'redo', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>`, title: 'Redo', command: 'redo' },
  ];

  constructor(commands: Commands, _editorElement: HTMLElement, toolbarButtons?: ToolbarButton[]) {
    this.commands = commands;
    this.container = createElement('div', 'bang-toolbar');
    this.createButtons(toolbarButtons);

    // Close popovers on outside click
    document.addEventListener('click', (e) => {
      if (this.activePopover && !this.activePopover.contains(e.target as Node)) {
        // Check if click was on the button that owns this popover
        const parentWrapper = this.activePopover.closest('.bang-popover-wrapper');
        if (parentWrapper && parentWrapper.contains(e.target as Node)) return;
        this.closeActivePopover();
      }
    });
  }

  setHtmlViewToggle(callback: () => void): void {
    this.onHtmlViewToggle = callback;
  }

  setHtmlViewState(isActive: boolean): void {
    this.isHtmlView = isActive;
    const btn = this.buttons.get('htmlView');
    if (btn) {
      btn.classList.toggle('active', isActive);
    }
  }

  private toggleHtmlView(): void {
    if (this.onHtmlViewToggle) {
      this.onHtmlViewToggle();
    }
  }

  private closeActivePopover(): void {
    if (this.activePopover) {
      this.activePopover.style.display = 'none';
      this.activePopover = null;
    }
  }

  private createButtons(toolbarButtons?: ToolbarButton[]): void {
    const buttonsToShow = toolbarButtons || [
      'formatDropdown', '|',
      'bold', 'italic', 'underline', 'fontColor', '|',
      'alignDropdown', '|',
      'link', 'image', 'video', 'table', 'code', 'htmlView'
    ];

    buttonsToShow.forEach(buttonName => {
      if (buttonName === '|') {
        const separator = createElement('span', 'bang-toolbar-separator');
        this.container.appendChild(separator);
        return;
      }

      if (buttonName === 'formatDropdown') {
        this.formatDropdown = this.createFormatDropdown();
        this.container.appendChild(this.formatDropdown);
        return;
      }

      if (buttonName === 'alignDropdown') {
        this.alignDropdown = this.createAlignDropdown();
        this.container.appendChild(this.alignDropdown);
        return;
      }

      // Buttons that need popovers
      if (buttonName === 'link') {
        this.container.appendChild(this.createLinkButton());
        return;
      }
      if (buttonName === 'image') {
        this.container.appendChild(this.createImageButton());
        return;
      }
      if (buttonName === 'video') {
        this.container.appendChild(this.createVideoButton());
        return;
      }
      if (buttonName === 'table') {
        this.container.appendChild(this.createTableButton());
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

  private createPopoverWrapper(buttonConfig: ButtonConfig, popoverContent: HTMLElement): HTMLElement {
    const wrapper = createElement('div', 'bang-popover-wrapper');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bang-toolbar-button';
    button.innerHTML = buttonConfig.icon;
    button.title = buttonConfig.title;
    button.setAttribute('data-command', buttonConfig.name);
    this.buttons.set(buttonConfig.name, button);

    const popover = createElement('div', 'bang-popover');
    popover.style.display = 'none';
    popover.appendChild(popoverContent);

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Save the editor selection before opening popover
      this.savedRange = saveSelection();

      // Close other popovers/dropdowns
      this.closeActivePopover();
      this.closeAllDropdowns();

      popover.style.display = 'block';
      this.activePopover = popover;

      // Focus first input
      const firstInput = popover.querySelector('input') as HTMLInputElement;
      if (firstInput) firstInput.focus();
    });

    wrapper.appendChild(button);
    wrapper.appendChild(popover);
    return wrapper;
  }

  private createLinkButton(): HTMLElement {
    const config = this.buttonConfigs.find(b => b.name === 'link')!;

    const form = createElement('div', 'bang-popover-form');

    const urlGroup = createElement('div', 'bang-popover-field');
    const urlLabel = document.createElement('label');
    urlLabel.textContent = 'URL';
    urlLabel.className = 'bang-popover-label';
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.className = 'bang-popover-input';
    urlInput.placeholder = 'https://example.com';
    urlGroup.appendChild(urlLabel);
    urlGroup.appendChild(urlInput);

    const textGroup = createElement('div', 'bang-popover-field');
    const textLabel = document.createElement('label');
    textLabel.textContent = 'Text (optional)';
    textLabel.className = 'bang-popover-label';
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'bang-popover-input';
    textInput.placeholder = 'Link text';
    textGroup.appendChild(textLabel);
    textGroup.appendChild(textInput);

    const actions = createElement('div', 'bang-popover-actions');
    const insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.className = 'bang-popover-btn bang-popover-btn--primary';
    insertBtn.textContent = 'Insert';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'bang-popover-btn';
    cancelBtn.textContent = 'Cancel';

    actions.appendChild(cancelBtn);
    actions.appendChild(insertBtn);

    form.appendChild(urlGroup);
    form.appendChild(textGroup);
    form.appendChild(actions);

    const submit = () => {
      const url = urlInput.value.trim();
      if (url) {
        restoreSelection(this.savedRange);
        const text = textInput.value.trim();
        if (text) {
          // Insert text then make it a link
          document.execCommand('insertText', false, text);
          // Select the just-inserted text
          const sel = window.getSelection();
          if (sel && sel.focusNode) {
            const range = document.createRange();
            range.setStart(sel.focusNode, sel.focusOffset - text.length);
            range.setEnd(sel.focusNode, sel.focusOffset);
            sel.removeAllRanges();
            sel.addRange(range);
          }
          this.commands.createLink(url);
        } else {
          this.commands.createLink(url);
        }
      }
      urlInput.value = '';
      textInput.value = '';
      this.closeActivePopover();
    };

    insertBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      submit();
    });

    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      urlInput.value = '';
      textInput.value = '';
      this.closeActivePopover();
    });

    // Enter key submits
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeActivePopover();
      }
    };
    urlInput.addEventListener('keydown', handleKeydown);
    textInput.addEventListener('keydown', handleKeydown);

    return this.createPopoverWrapper(config, form);
  }

  private createImageButton(): HTMLElement {
    const config = this.buttonConfigs.find(b => b.name === 'image')!;

    const form = createElement('div', 'bang-popover-form');

    const urlGroup = createElement('div', 'bang-popover-field');
    const urlLabel = document.createElement('label');
    urlLabel.textContent = 'Image URL';
    urlLabel.className = 'bang-popover-label';
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.className = 'bang-popover-input';
    urlInput.placeholder = 'https://example.com/image.png';
    urlGroup.appendChild(urlLabel);
    urlGroup.appendChild(urlInput);

    const altGroup = createElement('div', 'bang-popover-field');
    const altLabel = document.createElement('label');
    altLabel.textContent = 'Alt text (optional)';
    altLabel.className = 'bang-popover-label';
    const altInput = document.createElement('input');
    altInput.type = 'text';
    altInput.className = 'bang-popover-input';
    altInput.placeholder = 'Image description';
    altGroup.appendChild(altLabel);
    altGroup.appendChild(altInput);

    const actions = createElement('div', 'bang-popover-actions');
    const insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.className = 'bang-popover-btn bang-popover-btn--primary';
    insertBtn.textContent = 'Insert';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'bang-popover-btn';
    cancelBtn.textContent = 'Cancel';

    actions.appendChild(cancelBtn);
    actions.appendChild(insertBtn);

    form.appendChild(urlGroup);
    form.appendChild(altGroup);
    form.appendChild(actions);

    const submit = () => {
      const url = urlInput.value.trim();
      if (url) {
        restoreSelection(this.savedRange);
        this.commands.insertImage(url, altInput.value.trim());
      }
      urlInput.value = '';
      altInput.value = '';
      this.closeActivePopover();
    };

    insertBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      submit();
    });

    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      urlInput.value = '';
      altInput.value = '';
      this.closeActivePopover();
    });

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeActivePopover();
      }
    };
    urlInput.addEventListener('keydown', handleKeydown);
    altInput.addEventListener('keydown', handleKeydown);

    return this.createPopoverWrapper(config, form);
  }

  private createVideoButton(): HTMLElement {
    const config = this.buttonConfigs.find(b => b.name === 'video')!;

    const form = createElement('div', 'bang-popover-form');

    const urlGroup = createElement('div', 'bang-popover-field');
    const urlLabel = document.createElement('label');
    urlLabel.textContent = 'Video URL';
    urlLabel.className = 'bang-popover-label';
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.className = 'bang-popover-input';
    urlInput.placeholder = 'YouTube, Vimeo, Loom, or direct URL';
    urlGroup.appendChild(urlLabel);
    urlGroup.appendChild(urlInput);

    const hint = createElement('div', 'bang-popover-hint');
    hint.textContent = 'Supports YouTube, Vimeo, Dailymotion, Loom, or direct .mp4/.webm links';

    const actions = createElement('div', 'bang-popover-actions');
    const insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.className = 'bang-popover-btn bang-popover-btn--primary';
    insertBtn.textContent = 'Insert';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'bang-popover-btn';
    cancelBtn.textContent = 'Cancel';

    actions.appendChild(cancelBtn);
    actions.appendChild(insertBtn);

    form.appendChild(urlGroup);
    form.appendChild(hint);
    form.appendChild(actions);

    const submit = () => {
      const url = urlInput.value.trim();
      if (url) {
        restoreSelection(this.savedRange);
        this.commands.insertVideo(url);
      }
      urlInput.value = '';
      this.closeActivePopover();
    };

    insertBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      submit();
    });

    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      urlInput.value = '';
      this.closeActivePopover();
    });

    urlInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeActivePopover();
      }
    });

    return this.createPopoverWrapper(config, form);
  }

  private createTableButton(): HTMLElement {
    const config = this.buttonConfigs.find(b => b.name === 'table')!;

    const form = createElement('div', 'bang-popover-form');

    const rowGroup = createElement('div', 'bang-popover-field');
    const rowLabel = document.createElement('label');
    rowLabel.textContent = 'Rows';
    rowLabel.className = 'bang-popover-label';
    const rowInput = document.createElement('input');
    rowInput.type = 'number';
    rowInput.className = 'bang-popover-input';
    rowInput.value = '3';
    rowInput.min = '1';
    rowInput.max = '20';
    rowGroup.appendChild(rowLabel);
    rowGroup.appendChild(rowInput);

    const colGroup = createElement('div', 'bang-popover-field');
    const colLabel = document.createElement('label');
    colLabel.textContent = 'Columns';
    colLabel.className = 'bang-popover-label';
    const colInput = document.createElement('input');
    colInput.type = 'number';
    colInput.className = 'bang-popover-input';
    colInput.value = '3';
    colInput.min = '1';
    colInput.max = '20';
    colGroup.appendChild(colLabel);
    colGroup.appendChild(colInput);

    const fieldRow = createElement('div', 'bang-popover-row');
    fieldRow.appendChild(rowGroup);
    fieldRow.appendChild(colGroup);

    const actions = createElement('div', 'bang-popover-actions');
    const insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.className = 'bang-popover-btn bang-popover-btn--primary';
    insertBtn.textContent = 'Insert';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'bang-popover-btn';
    cancelBtn.textContent = 'Cancel';

    actions.appendChild(cancelBtn);
    actions.appendChild(insertBtn);

    form.appendChild(fieldRow);
    form.appendChild(actions);

    const submit = () => {
      const rows = parseInt(rowInput.value, 10);
      const cols = parseInt(colInput.value, 10);
      if (rows > 0 && cols > 0) {
        restoreSelection(this.savedRange);
        this.commands.insertTable({ rows, cols });
      }
      rowInput.value = '3';
      colInput.value = '3';
      this.closeActivePopover();
    };

    insertBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      submit();
    });

    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rowInput.value = '3';
      colInput.value = '3';
      this.closeActivePopover();
    });

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.closeActivePopover();
      }
    };
    rowInput.addEventListener('keydown', handleKeydown);
    colInput.addEventListener('keydown', handleKeydown);

    return this.createPopoverWrapper(config, form);
  }

  private createFormatDropdown(): HTMLElement {
    const wrapper = createElement('div', 'bang-dropdown');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'bang-dropdown-trigger';
    trigger.innerHTML = `<span class="bang-dropdown-label">Normal</span><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
    trigger.title = 'Text Format';

    const menu = createElement('div', 'bang-dropdown-menu');
    menu.style.display = 'none';

    const formats = [
      { label: 'Normal', value: '<p>', tag: 'p' },
      { label: 'Heading 1', value: '<h1>', tag: 'h1' },
      { label: 'Heading 2', value: '<h2>', tag: 'h2' },
      { label: 'Heading 3', value: '<h3>', tag: 'h3' },
      { label: 'Heading 4', value: '<h4>', tag: 'h4' },
      { label: 'Heading 5', value: '<h5>', tag: 'h5' },
      { label: 'Heading 6', value: '<h6>', tag: 'h6' },
    ];

    formats.forEach(format => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'bang-dropdown-item';
      item.setAttribute('data-format', format.tag);

      const el = document.createElement(format.tag === 'p' ? 'span' : format.tag);
      el.textContent = format.label;
      el.style.margin = '0';
      el.style.padding = '0';
      item.appendChild(el);

      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.commands.execute('formatBlock', format.value);
        const label = trigger.querySelector('.bang-dropdown-label');
        if (label) label.textContent = format.label;
        menu.style.display = 'none';
        this.updateButtonStates();
      });

      menu.appendChild(item);
    });

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeActivePopover();
      if (this.alignDropdown) {
        const otherMenu = this.alignDropdown.querySelector('.bang-dropdown-menu') as HTMLElement;
        if (otherMenu) otherMenu.style.display = 'none';
      }
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', () => {
      menu.style.display = 'none';
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);
    return wrapper;
  }

  private createAlignDropdown(): HTMLElement {
    const wrapper = createElement('div', 'bang-dropdown');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'bang-dropdown-trigger bang-dropdown-trigger--icon';
    trigger.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`;
    trigger.title = 'Text Alignment';

    const menu = createElement('div', 'bang-dropdown-menu');
    menu.style.display = 'none';

    const alignments = [
      { label: 'Align Left', command: 'justifyLeft', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>` },
      { label: 'Align Center', command: 'justifyCenter', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>` },
      { label: 'Align Right', command: 'justifyRight', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>` },
      { label: 'Justify', command: 'justifyFull', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>` },
    ];

    alignments.forEach(align => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'bang-dropdown-item bang-dropdown-item--icon';
      item.innerHTML = `${align.icon}<span>${align.label}</span>`;

      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.commands.execute(align.command);
        menu.style.display = 'none';
      });

      menu.appendChild(item);
    });

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeActivePopover();
      if (this.formatDropdown) {
        const otherMenu = this.formatDropdown.querySelector('.bang-dropdown-menu') as HTMLElement;
        if (otherMenu) otherMenu.style.display = 'none';
      }
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', () => {
      menu.style.display = 'none';
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);
    return wrapper;
  }

  private closeAllDropdowns(): void {
    if (this.formatDropdown) {
      const menu = this.formatDropdown.querySelector('.bang-dropdown-menu') as HTMLElement;
      if (menu) menu.style.display = 'none';
    }
    if (this.alignDropdown) {
      const menu = this.alignDropdown.querySelector('.bang-dropdown-menu') as HTMLElement;
      if (menu) menu.style.display = 'none';
    }
  }

  private handleFontColor(): void {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = '#000000';
    input.style.position = 'absolute';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
    document.body.appendChild(input);
    input.addEventListener('input', () => {
      this.commands.execute('foreColor', input.value);
    });
    input.addEventListener('change', () => {
      document.body.removeChild(input);
    });
    input.addEventListener('blur', () => {
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
    });
    input.click();
  }

  private handleButtonClick(config: ButtonConfig): void {
    if (config.action) {
      config.action();
    } else if (config.command) {
      this.commands.execute(config.command, config.value);
    }
    this.updateButtonStates();
  }

  // Keep these as fallbacks (no longer used by default toolbar, but available for custom toolbars)
  private handleLinkInsert(): void {
    this.savedRange = saveSelection();
    // Toggle the link popover if it exists
    const wrapper = this.buttons.get('link')?.closest('.bang-popover-wrapper');
    if (wrapper) {
      const popover = wrapper.querySelector('.bang-popover') as HTMLElement;
      if (popover) {
        this.closeActivePopover();
        this.closeAllDropdowns();
        popover.style.display = 'block';
        this.activePopover = popover;
        const firstInput = popover.querySelector('input') as HTMLInputElement;
        if (firstInput) firstInput.focus();
      }
    }
  }

  private handleImageInsert(): void {
    this.savedRange = saveSelection();
    const wrapper = this.buttons.get('image')?.closest('.bang-popover-wrapper');
    if (wrapper) {
      const popover = wrapper.querySelector('.bang-popover') as HTMLElement;
      if (popover) {
        this.closeActivePopover();
        this.closeAllDropdowns();
        popover.style.display = 'block';
        this.activePopover = popover;
        const firstInput = popover.querySelector('input') as HTMLInputElement;
        if (firstInput) firstInput.focus();
      }
    }
  }

  private handleVideoInsert(): void {
    this.savedRange = saveSelection();
    const wrapper = this.buttons.get('video')?.closest('.bang-popover-wrapper');
    if (wrapper) {
      const popover = wrapper.querySelector('.bang-popover') as HTMLElement;
      if (popover) {
        this.closeActivePopover();
        this.closeAllDropdowns();
        popover.style.display = 'block';
        this.activePopover = popover;
        const firstInput = popover.querySelector('input') as HTMLInputElement;
        if (firstInput) firstInput.focus();
      }
    }
  }

  private handleTableInsert(): void {
    this.savedRange = saveSelection();
    const wrapper = this.buttons.get('table')?.closest('.bang-popover-wrapper');
    if (wrapper) {
      const popover = wrapper.querySelector('.bang-popover') as HTMLElement;
      if (popover) {
        this.closeActivePopover();
        this.closeAllDropdowns();
        popover.style.display = 'block';
        this.activePopover = popover;
        const firstInput = popover.querySelector('input') as HTMLInputElement;
        if (firstInput) firstInput.focus();
      }
    }
  }

  updateButtonStates(): void {
    if (this.isHtmlView) return;

    const formatButtons: [string, string][] = [
      ['bold', 'bold'],
      ['italic', 'italic'],
      ['underline', 'underline'],
      ['strikethrough', 'strikeThrough'],
    ];

    formatButtons.forEach(([name, command]) => {
      const button = this.buttons.get(name);
      if (button) {
        const isActive = this.commands.queryCommandState(command);
        button.classList.toggle('active', isActive);
      }
    });

    const blockFormat = this.commands.queryCommandValue('formatBlock').toLowerCase();
    if (this.formatDropdown) {
      const label = this.formatDropdown.querySelector('.bang-dropdown-label');
      if (label) {
        const formatMap: Record<string, string> = {
          'h1': 'Heading 1', 'h2': 'Heading 2', 'h3': 'Heading 3',
          'h4': 'Heading 4', 'h5': 'Heading 5', 'h6': 'Heading 6',
          'p': 'Normal', '': 'Normal'
        };
        label.textContent = formatMap[blockFormat] || 'Normal';
      }
    }

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
