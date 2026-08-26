const fs = require('fs');
const file = 'src/store/index.ts';
let content = fs.readFileSync(file, 'utf8');

// Add to interface
const interfaceTarget = "deleteContent: (id: string) => void;";
const interfaceReplacement = "deleteContent: (id: string) => void;\n  moveContent: (id: string, newStatus: any, newIndex: number) => void;";
content = content.replace(interfaceTarget, interfaceReplacement);

// Add to implementation
const implTarget = "deleteContent: (id) => set((state) => ({\n    content: state.content.filter(c => c.id !== id)\n  })),";
const implReplacement = `deleteContent: (id) => set((state) => ({
    content: state.content.filter(c => c.id !== id)
  })),
  moveContent: (id, newStatus, newIndex) => set((state) => {
    const itemIndex = state.content.findIndex(c => c.id === id);
    if (itemIndex === -1) return state;
    
    const item = { ...state.content[itemIndex], status: newStatus, updatedAt: new Date().toISOString() };
    
    const newContent = [...state.content];
    newContent.splice(itemIndex, 1);
    
    const targetColumnItems = newContent.filter(c => c.status === newStatus);
    
    if (newIndex >= targetColumnItems.length) {
      const lastItemInStatus = targetColumnItems[targetColumnItems.length - 1];
      if (lastItemInStatus) {
        const lastGlobalIndex = newContent.indexOf(lastItemInStatus);
        newContent.splice(lastGlobalIndex + 1, 0, item);
      } else {
        newContent.push(item);
      }
    } else {
      const itemAtNewIndex = targetColumnItems[newIndex];
      const insertGlobalIndex = newContent.indexOf(itemAtNewIndex);
      newContent.splice(insertGlobalIndex, 0, item);
    }
    
    return { content: newContent };
  }),`;
content = content.replace(implTarget, implReplacement);

fs.writeFileSync(file, content);
console.log('Store patched');
