const fs = require('fs');
const file = 'src/pages/ContentEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFunction = `  const generateWithAI = async (field: 'script' | 'caption') => {`;
const newFunctions = `
  const generateAllWithAI = async () => {
    if (!item.title && !item.description) {
      alert("Please provide at least a rough topic, title, or idea in the Title or Overview description.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-all-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: item.platform,
          contentType: item.contentType,
          topic: \`\${item.title || ''} \${item.description || ''}\`
        })
      });
      const data = await response.json();
      if (data.details) {
        setItem(prev => ({ 
          ...prev, 
          title: data.details.title || prev.title,
          description: data.details.description || prev.description,
          script: data.details.script || prev.script,
          caption: data.details.caption || prev.caption
        }));
        alert("Successfully generated complete content details and researched trends!");
      }
    } catch (error) {
      console.error("Failed to generate all details", error);
      alert("Failed to generate details. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWithAI = async (field: 'script' | 'caption') => {`;

if (content.includes(targetFunction)) {
  content = content.replace(targetFunction, newFunctions);
}

const targetButton = `<button 
            onClick={handleSave}`;

const newButton = `<button 
            onClick={generateAllWithAI}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-3 py-2 rounded-md font-medium hover:bg-blue-600/20 transition-colors border border-blue-600/20 shadow-sm"
            title="Auto-generate complete content details and brief based on title"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? 'Generating...' : 'Magic Generate'}
          </button>
          <button 
            onClick={handleSave}`;

if (content.includes(targetButton)) {
  content = content.replace(targetButton, newButton);
}

fs.writeFileSync(file, content);
console.log('Patched ContentEditor.tsx');
