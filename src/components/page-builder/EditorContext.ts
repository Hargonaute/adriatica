import { createContext, useContext } from 'react';

interface EditorContextValue {
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
}

export const EditorContext = createContext<EditorContextValue>({
  selectedBlockId: null,
  setSelectedBlockId: () => {},
});

export function useEditorContext() {
  return useContext(EditorContext);
}
