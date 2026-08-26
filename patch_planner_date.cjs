const fs = require('fs');
const file = 'src/pages/Planner.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix onDragEnd
const targetDrag = `  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const newStatus = destination.droppableId as Status;
    updateContent(draggableId, { status: newStatus });
  };`;

const replacementDrag = `  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const newStatus = destination.droppableId as Status;
    if (moveContent) {
      moveContent(draggableId, newStatus, destination.index);
    } else {
      updateContent(draggableId, { status: newStatus });
    }
  };`;

if (content.includes(targetDrag)) {
  content = content.replace(targetDrag, replacementDrag);
  console.log('Patched onDragEnd');
} else {
  // Let's try to match it with regex in case formatting is off
  content = content.replace(
    /const onDragEnd = \(result: DropResult\) => \{[\s\S]*?updateContent\(draggableId, \{ status: newStatus \}\);\s*\};/,
    replacementDrag
  );
  console.log('Patched onDragEnd via regex');
}


// 2. Add Date Picker to card footer
const targetFooter = `<div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                                        <span>{item.publishAt ? formatFriendlyDate(item.publishAt) : 'No date'}</span>
                                      </div>`;

const replacementFooter = `<div 
                                        className="mt-4 flex items-center justify-between text-xs text-slate-500"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors w-full relative group/date">
                                          <Calendar className="w-3.5 h-3.5 text-slate-400 group-hover/date:text-blue-500 transition-colors" />
                                          <span className={cn(
                                            "font-medium truncate flex-1", 
                                            item.publishAt ? "text-slate-700 dark:text-slate-300" : "text-slate-400"
                                          )}>
                                            {item.publishAt ? formatFriendlyDate(item.publishAt) : 'Schedule date...'}
                                          </span>
                                          <input 
                                            type="date"
                                            value={item.publishAt ? item.publishAt.split('T')[0] : ''}
                                            onChange={(e) => {
                                              const date = e.target.value;
                                              if (date) {
                                                // Create a proper date string for noon to avoid timezone shift issues
                                                const newDate = new Date(\`\${date}T12:00:00Z\`).toISOString();
                                                updateContent(item.id, { 
                                                  publishAt: newDate,
                                                  status: item.status === 'PUBLISHED' ? 'PUBLISHED' : 'SCHEDULED' 
                                                });
                                              } else {
                                                updateContent(item.id, { publishAt: undefined });
                                              }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                          />
                                        </div>
                                      </div>`;

if (content.includes(targetFooter)) {
  content = content.replace(targetFooter, replacementFooter);
  console.log('Patched footer');
} else {
  console.log('Could not find target footer string, using regex fallback.');
  // Regex fallback
  const regexFooter = /<div className="mt-4 flex items-center justify-between text-xs text-slate-500">[\s\S]*?<span>\{item\.publishAt \? formatFriendlyDate\(item\.publishAt\) : 'No date'\}<\/span>[\s\S]*?<\/div>/;
  content = content.replace(regexFooter, replacementFooter);
  console.log('Patched footer via regex');
}

fs.writeFileSync(file, content);
console.log('Done patching Planner.tsx');
