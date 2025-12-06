/**
 * Dracula-inspired theme with violet accents matching the app's design
 * Based on Dracula theme but adapted to use violet (rgb(139, 92, 246)) as primary accent
 */
export const slingshotDraculaTheme = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: '', foreground: 'f8f8f2', background: '1e1e2e' },
    { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'bd93f9', fontStyle: 'bold' },
    { token: 'number', foreground: 'bd93f9' },
    { token: 'string', foreground: 'f1fa8c' },
    { token: 'string.escape', foreground: 'ff79c6' },
    { token: 'type', foreground: '8be9fd' },
    { token: 'class', foreground: '50fa7b' },
    { token: 'function', foreground: '50fa7b' },
    { token: 'variable', foreground: '8be9fd' },
    { token: 'constant', foreground: 'bd93f9' },
    { token: 'operator', foreground: 'ff79c6' },
    { token: 'delimiter', foreground: 'f8f8f2' },
    { token: 'tag', foreground: 'ff79c6' },
    { token: 'attribute.name', foreground: '50fa7b' },
    { token: 'attribute.value', foreground: 'f1fa8c' },
    { token: 'property', foreground: '8b5cf6' }, // Violet accent
    { token: 'key', foreground: '8b5cf6' }, // Violet accent for JSON keys
  ],
  colors: {
    'editor.background': '#1e1e2e',
    'editor.foreground': '#f8f8f2',
    'editor.lineHighlightBackground': '#282a36',
    'editor.selectionBackground': '#44475a',
    'editor.inactiveSelectionBackground': '#3a3a4a',
    'editorCursor.foreground': '#f8f8f2',
    'editorWhitespace.foreground': '#3b3b4d',
    'editorIndentGuide.background': '#3b3b4d',
    'editorIndentGuide.activeBackground': '#4a4a5c',
    'editorLineNumber.foreground': '#6272a4',
    'editorLineNumber.activeForeground': '#bd93f9',
    'editorGutter.background': '#1e1e2e',
    'editorWidget.background': '#282a36',
    'editorWidget.border': '#44475a',
    'editorSuggestWidget.background': '#282a36',
    'editorSuggestWidget.border': '#44475a',
    'editorSuggestWidget.selectedBackground': '#44475a',
    'editorBracketMatch.background': '#44475a',
    'editorBracketMatch.border': '#6272a4',
  },
};
