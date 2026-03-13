export type ToolbarButton =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'paragraph'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignJustify'
  | 'orderedList'
  | 'unorderedList'
  | 'link'
  | 'unlink'
  | 'image'
  | 'table'
  | 'code'
  | 'undo'
  | 'redo'
  | '|'; // Separator

export interface EditorOptions {
  placeholder?: string;
  height?: string;
  minHeight?: string;
  toolbar?: ToolbarButton[];
  onChange?: (content: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  imageUploadHandler?: (file: File) => Promise<string>;
}

export interface ButtonConfig {
  name: ToolbarButton;
  icon: string;
  title: string;
  command?: string;
  value?: string;
  action?: () => void;
}

export interface TableOptions {
  rows: number;
  cols: number;
}
