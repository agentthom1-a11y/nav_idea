const fs = require('fs');
const file = 'src/pages/ContentEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add io import
content = content.replace(
  "import { aiService, SeoAnalysis } from '../services/ai';",
  "import { aiService, SeoAnalysis } from '../services/ai';\nimport { io } from 'socket.io-client';\nimport { User } from '../types';"
);

// 2. Add states and useEffect
const targetState = "const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);";
const replacementState = `const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysis | null>(null);
  const [activeCollaborators, setActiveCollaborators] = useState<User[]>([]);

  useEffect(() => {
    if (!id || id === 'new') return;

    const socket = io();

    socket.on('connect', () => {
      socket.emit('join-document', { documentId: id, user: currentUser });
    });

    socket.on('presence-update', (users: User[]) => {
      // Create a unique list based on user ID and filter out self
      const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
      setActiveCollaborators(uniqueUsers.filter(u => u.id !== currentUser.id));
    });

    return () => {
      socket.disconnect();
    };
  }, [id, currentUser]);
`;
content = content.replace(targetState, replacementState);

// 3. Add UI in header
const headerTarget = `<div className="flex items-center gap-3">
          <div className="text-sm text-slate-500 hidden sm:block">`;
const headerReplacement = `<div className="flex items-center gap-3">
          {activeCollaborators.length > 0 && (
            <div className="flex items-center -space-x-2 mr-2">
              {activeCollaborators.map(collaborator => (
                <div 
                  key={collaborator.id} 
                  className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white dark:border-slate-950 flex items-center justify-center text-indigo-700 font-bold text-xs relative group z-20"
                >
                  {collaborator.avatar ? (
                    <img src={collaborator.avatar} alt={collaborator.name} className="w-full h-full rounded-full" />
                  ) : (
                    collaborator.name.charAt(0)
                  )}
                  <div className="absolute top-10 right-0 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                    {collaborator.name} is here
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-sm text-slate-500 hidden sm:block">`;
content = content.replace(headerTarget, headerReplacement);

fs.writeFileSync(file, content);
console.log('Editor patched for collab');
