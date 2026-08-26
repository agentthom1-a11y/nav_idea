const fs = require('fs');
const file = 'src/pages/Planner.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = "const { content, updateContent } = useStore();";
const replacement1 = "const { content, updateContent, moveContent } = useStore();";
content = content.replace(target1, replacement1);

const target2 = `  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as Status;
    updateContent(draggableId, { status: newStatus });
  };`;

const replacement2 = `  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as Status;
    moveContent(draggableId, newStatus, destination.index);
  };`;
content = content.replace(target2, replacement2);

fs.writeFileSync(file, content);
console.log('Planner drag patched');
