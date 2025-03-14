import React from 'react';
import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  height: string;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  language,
  value,
  onChange,
  height,
}) => {
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <Editor
      height={height}
      defaultLanguage={language}
      value={value}
      onChange={handleEditorChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        tabSize: 2,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
};