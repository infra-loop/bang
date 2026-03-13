# Quick Start Guide - BangEditor

## 🚀 Get Started in 3 Steps

### 1. View the Demo

```bash
npm run dev
```

Then open your browser to `http://localhost:5173/demo/` to see the full demo.

### 2. Use in Your Project

#### Option A: Direct HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="path/to/dist/style.css">
</head>
<body>
  <div id="editor"></div>
  
  <script type="module">
    import BangEditor from 'path/to/dist/bang-editor.js';
    
    const editor = new BangEditor('#editor', {
      placeholder: 'Start typing...',
      height: '400px'
    });
  </script>
</body>
</html>
```

#### Option B: Module Bundler (Webpack/Vite/etc)

```typescript
import BangEditor from './path/to/src/index';
import './path/to/src/styles/bang-editor.css';

const editor = new BangEditor('#editor', {
  placeholder: 'Start typing...',
  height: '400px',
  toolbar: [
    'bold', 'italic', 'underline', '|',
    'h1', 'h2', '|',
    'link', 'image'
  ],
  onChange: (content) => {
    console.log('Content:', content);
  }
});
```

### 3. Customize & Extend

#### Get/Set Content

```javascript
// Get HTML content
const html = editor.getContent();

// Set content
editor.setContent('<h1>Hello World</h1><p>Welcome!</p>');

// Get plain text
const text = editor.getText();
```

#### Handle Events

```javascript
editor.on('change', (content) => {
  // Save to backend
  saveToServer(content);
});

editor.on('focus', () => {
  console.log('Editor focused');
});
```

#### Form Integration

```javascript
const form = document.getElementById('myForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const content = editor.getContent();
  // Submit content to your backend
  fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
});
```

## 📚 Available Toolbar Buttons

```javascript
const toolbar = [
  // Formatting
  'bold', 'italic', 'underline', 'strikethrough',
  
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'paragraph',
  
  // Alignment
  'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
  
  // Lists
  'orderedList', 'unorderedList',
  
  // Insert
  'link', 'unlink', 'image', 'table', 'code',
  
  // History
  'undo', 'redo',
  
  // Separator
  '|'
];
```

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo

## 🎨 Custom Styling

Override CSS classes:

```css
.bang-editor-wrapper {
  border: 2px solid #your-color;
}

.bang-toolbar-button.active {
  background: #your-active-color;
}

.bang-editor-content {
  font-family: 'Your Font', sans-serif;
}
```

## 📦 Build for Production

```bash
npm run build
```

Output will be in `dist/`:
- `bang-editor.js` - ES module
- `bang-editor.umd.cjs` - UMD for browsers
- `style.css` - Styles
- `*.d.ts` - TypeScript definitions

## 🔗 Full Documentation

See [README.md](./README.md) for complete API reference and advanced usage.

## 💡 Examples

Check out:
- `demo/index.html` - Full-featured demo
- `demo/simple.html` - Simple integration example
