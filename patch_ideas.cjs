const fs = require('fs');
let ideas = fs.readFileSync('src/pages/Ideas.tsx', 'utf8');

ideas = ideas.replace(
  "const { ideas, addIdea, currentUser, brandContext } = useStore();",
  "const { ideas, addIdea, addContent, deleteIdea, currentUser, brandContext } = useStore();\n  const navigate = useNavigate();"
);

ideas = ideas.replace(
  "import { Plus, Search, Filter, MoreHorizontal, Lightbulb, Sparkles, Loader2 } from 'lucide-react';",
  "import { Plus, Search, Filter, MoreHorizontal, Lightbulb, Sparkles, Loader2 } from 'lucide-react';\nimport { useNavigate } from 'react-router-dom';\nimport { Platform, ContentType } from '../types';"
);

ideas = ideas.replace(
  /<button className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">\s*Create Content\s*<\/button>/g,
  `<button onClick={() => {
                  const newId = generateId();
                  addContent({
                    id: newId,
                    title: idea.title,
                    description: idea.description,
                    platform: (idea.platform || 'LinkedIn') as Platform,
                    contentType: 'Post' as ContentType,
                    status: 'DRAFT',
                    priority: 'MEDIUM',
                    ownerId: currentUser.id,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  });
                  deleteIdea(idea.id);
                  navigate(\`/content/\${newId}\`);
                }} className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Create Content
                </button>`
);

fs.writeFileSync('src/pages/Ideas.tsx', ideas);
