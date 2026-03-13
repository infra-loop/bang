# BangEditor

A lightweight, modern WYSIWYG editor library built with TypeScript. Simple to integrate, powerful to use.

## Features

- **Rich Text Formatting**: Bold, italic, underline, strikethrough
- **Headings**: Support for H1-H6
- **Text Alignment**: Left, center, right, justify
- **Lists**: Ordered and unordered lists
- **Links**: Insert and edit hyperlinks
- **Images**: Insert images via URL
- **Tables**: Create and edit tables
- **Code Blocks**: Insert formatted code blocks
- **Undo/Redo**: Full history support with keyboard shortcuts
- **TypeScript**: Full type definitions included
- **Customizable**: Configure toolbar and styling
- **Lightweight**: No dependencies, small bundle size
- **Modern**: Built with ES modules and Vite

## Installation

```bash
npm install bang-editor
```

## Quick Start

### HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/bang-editor/dist/style.css">
</head>
<body>
  <div id="editor"></div>
  
  <script type="module">
    import BangEditor from './node_modules/bang-editor/dist/bang-editor.js';
    
    const editor = new BangEditor('#editor', {
      placeholder: 'Start typing...',
      height: '400px'
    });
  </script>
</body>
</html>
```

### TypeScript/JavaScript (with bundler)

```typescript
import BangEditor from 'bang-editor';
import 'bang-editor/style.css';

const editor = new BangEditor('#editor', {
  placeholder: 'Start typing...',
  height: '400px',
  onChange: (content) => {
    console.log('Content changed:', content);
  }
});
```

## Configuration Options

```typescript
interface EditorOptions {
  // Placeholder text when editor is empty
  placeholder?: string;
  
  // Fixed height of editor
  height?: string;
  
  // Minimum height of editor
  minHeight?: string;
  
  // Custom toolbar buttons (use '|' for separator)
  toolbar?: ToolbarButton[];
  
  // Callback when content changes
  onChange?: (content: string) => void;
  
  // Callback when editor receives focus
  onFocus?: () => void;
  
  // Callback when editor loses focus
  onBlur?: () => void;
  
  // Custom image upload handler
  imageUploadHandler?: (file: File) => Promise<string>;
}
```

## Toolbar Buttons

Available toolbar buttons:

- **Formatting**: `'bold'`, `'italic'`, `'underline'`, `'strikethrough'`
- **Headings**: `'h1'`, `'h2'`, `'h3'`, `'h4'`, `'h5'`, `'h6'`, `'paragraph'`
- **Alignment**: `'alignLeft'`, `'alignCenter'`, `'alignRight'`, `'alignJustify'`
- **Lists**: `'orderedList'`, `'unorderedList'`
- **Insert**: `'link'`, `'unlink'`, `'image'`, `'table'`, `'code'`
- **History**: `'undo'`, `'redo'`
- **Separator**: `'|'`

### Custom Toolbar Example

```typescript
const editor = new BangEditor('#editor', {
  toolbar: [
    'bold', 'italic', 'underline', '|',
    'h1', 'h2', 'h3', '|',
    'link', 'image', '|',
    'undo', 'redo'
  ]
});
```

## API Methods

### Content Methods

```typescript
// Get HTML content
const html = editor.getContent();

// Set HTML content
editor.setContent('<p>Hello World</p>');

// Get plain text content
const text = editor.getText();

// Clear editor content
editor.clear();
```

### Control Methods

```typescript
// Focus the editor
editor.focus();

// Blur the editor
editor.blur();

// Disable editing
editor.disable();

// Enable editing
editor.enable();

// Destroy editor instance
editor.destroy();
```

### Event Methods

```typescript
// Subscribe to events
editor.on('change', (content) => {
  console.log('Content:', content);
});

editor.on('focus', () => {
  console.log('Editor focused');
});

editor.on('blur', () => {
  console.log('Editor blurred');
});

// Unsubscribe from events
const callback = (content) => console.log(content);
editor.on('change', callback);
editor.off('change', callback);
```

### Execute Commands

```typescript
// Execute any formatting command
editor.executeCommand('bold');
editor.executeCommand('formatBlock', '<h1>');
```

## Keyboard Shortcuts

- **Ctrl/Cmd + B**: Bold
- **Ctrl/Cmd + I**: Italic
- **Ctrl/Cmd + U**: Underline
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Shift + Z**: Redo
- **Ctrl/Cmd + Y**: Redo (Windows)

## Examples

### Basic Usage

```typescript
import BangEditor from 'bang-editor';
import 'bang-editor/style.css';

const editor = new BangEditor('#editor', {
  placeholder: 'Write something amazing...',
  height: '500px'
});
```

### With Change Handler

```typescript
const editor = new BangEditor('#editor', {
  onChange: (content) => {
    // Save content to backend
    fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify({ content }),
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

### Form Integration

```html
<form id="myForm">
  <div id="editor"></div>
  <input type="hidden" name="content" id="content">
  <button type="submit">Submit</button>
</form>

<script type="module">
  import BangEditor from 'bang-editor';
  import 'bang-editor/style.css';
  
  const editor = new BangEditor('#editor');
  
  document.getElementById('myForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const content = editor.getContent();
    document.getElementById('content').value = content;
    // Submit form
    e.target.submit();
  });
</script>
```

### Load Initial Content

```typescript
const editor = new BangEditor('#editor');

// Load content from API
fetch('/api/content')
  .then(res => res.json())
  .then(data => {
    editor.setContent(data.content);
  });
```

### Multiple Editors

```typescript
const editor1 = new BangEditor('#editor-1', {
  placeholder: 'First editor...'
});

const editor2 = new BangEditor('#editor-2', {
  placeholder: 'Second editor...',
  toolbar: ['bold', 'italic', 'link']
});
```

## Styling

The editor comes with default styling that you can customize via CSS:

```css
/* Customize editor wrapper */
.bang-editor-wrapper {
  border: 2px solid #your-color;
  border-radius: 8px;
}

/* Customize toolbar */
.bang-toolbar {
  background: #your-background;
}

/* Customize buttons */
.bang-toolbar-button {
  color: #your-color;
}

.bang-toolbar-button.active {
  background: #your-active-color;
}

/* Customize editor content */
.bang-editor-content {
  font-family: 'Your Font', sans-serif;
  font-size: 16px;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

```bash
# Install dependencies
npm install

# Run development server with demo
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
bang/
├── src/
│   ├── index.ts          # Main entry point
│   ├── editor.ts         # BangEditor class
│   ├── toolbar.ts        # Toolbar component
│   ├── commands.ts       # Command execution
│   ├── types.ts          # TypeScript types
│   ├── utils.ts          # Helper functions
│   └── styles/
│       └── bang-editor.css
├── demo/
│   └── index.html        # Demo page
├── dist/                 # Build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

Built with TypeScript and Vite
