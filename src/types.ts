export type ToolbarButton =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'fontColor'
  | 'formatDropdown'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'paragraph'
  | 'alignDropdown'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignJustify'
  | 'orderedList'
  | 'unorderedList'
  | 'link'
  | 'unlink'
  | 'image'
  | 'video'
  | 'table'
  | 'code'
  | 'htmlView'
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
