const fs = require('fs');
const file = 'src/pages/Planner.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldColumns = `const COLUMNS: { id: Status; title: string }[] = [
  { id: 'IDEA', title: 'Ideas & Backlog' },
  { id: 'DRAFT', title: 'Drafting' },
  { id: 'REVIEW', title: 'In Review' },
  { id: 'SCHEDULED', title: 'Scheduled' },
];`;

const newColumns = `const COLUMNS: { id: Status; title: string }[] = [
  { id: 'IDEA', title: 'Ideas' },
  { id: 'RESEARCH', title: 'Research' },
  { id: 'BRIEF', title: 'Briefing' },
  { id: 'DRAFT', title: 'Drafting' },
  { id: 'DESIGN', title: 'Design' },
  { id: 'REVIEW', title: 'In Review' },
  { id: 'APPROVED', title: 'Approved' },
  { id: 'SCHEDULED', title: 'Scheduled' },
  { id: 'PUBLISHED', title: 'Published' }
];`;

content = content.replace(oldColumns, newColumns);

const oldFilter = `                    const columnItems = content.filter(item => {
                      if (column.id === 'DRAFT' && ['RESEARCH', 'BRIEF', 'DESIGN', 'EDITING'].includes(item.status)) return true;
                      if (column.id === 'REVIEW' && item.status === 'CHANGES_REQUESTED') return true;
                      return item.status === column.id;
                    });`;

const newFilter = `                    const columnItems = content.filter(item => item.status === column.id);`;

content = content.replace(oldFilter, newFilter);

// Also add a little padding at the end of the columns container so you can scroll to the end nicely
content = content.replace(
  '<div className="flex gap-6 h-full items-start">',
  '<div className="flex gap-6 h-full items-start pr-6">'
);

fs.writeFileSync(file, content);
console.log('patched');
