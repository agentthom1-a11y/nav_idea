const fs = require('fs');

// Patch ContentEditor.tsx
if (fs.existsSync('src/pages/ContentEditor.tsx')) {
  let content = fs.readFileSync('src/pages/ContentEditor.tsx', 'utf8');
  if (!content.includes('brandContext =')) {
    content = content.replace(
      'const { content, updateContent, addContent, currentUser } = useStore();',
      'const { content, updateContent, addContent, currentUser, brandContext } = useStore();'
    );
  }
  
  content = content.replace(
    /body:\s*JSON\.stringify\(\{\s*platform:\s*item\.platform,\s*contentType:\s*item\.contentType,\s*topic:\s*`\$\{item\.title\s*\|\|\s*''\}\s*\$\{item\.description\s*\|\|\s*''\}`\s*\}\)/g,
    "body: JSON.stringify({\n          platform: item.platform,\n          contentType: item.contentType,\n          topic: `${item.title || ''} ${item.description || ''}`,\n          brandContext\n        })"
  );
  
  content = content.replace(
    /body:\s*JSON\.stringify\(\{\s*platform:\s*item\.platform,\s*topic:\s*item\.title,\s*pillar:\s*item\.description,?\s*\}\)/g,
    "body: JSON.stringify({\n          platform: item.platform,\n          topic: item.title,\n          pillar: item.description,\n          brandContext\n        })"
  );

  fs.writeFileSync('src/pages/ContentEditor.tsx', content);
  console.log('ContentEditor patched');
}

// Patch Ideas.tsx
if (fs.existsSync('src/pages/Ideas.tsx')) {
  let ideas = fs.readFileSync('src/pages/Ideas.tsx', 'utf8');
  if (!ideas.includes('brandContext =')) {
    ideas = ideas.replace(
      'const { ideas, addIdea, currentUser } = useStore();',
      'const { ideas, addIdea, currentUser, brandContext } = useStore();'
    );
  }
  
  ideas = ideas.replace(
    /date:\s*new Date\(\)\.toISOString\(\)\s*\n\s*\}/g,
    "date: new Date().toISOString(),\n          brandContext\n        }"
  );
  
  fs.writeFileSync('src/pages/Ideas.tsx', ideas);
  console.log('Ideas patched');
}

// Patch Planner.tsx
if (fs.existsSync('src/pages/Planner.tsx')) {
  let planner = fs.readFileSync('src/pages/Planner.tsx', 'utf8');
  if (!planner.includes('brandContext =')) {
    planner = planner.replace(
      'const { content, pillars, addContent, currentUser } = useStore();',
      'const { content, pillars, addContent, currentUser, brandContext } = useStore();'
    );
  }
  
  planner = planner.replace(
    /startDate:\s*format\(currentDate, "yyyy-MM-dd"\)\s*\n\s*\}/g,
    "startDate: format(currentDate, \"yyyy-MM-dd\"),\n          brandContext\n        }"
  );
  
  fs.writeFileSync('src/pages/Planner.tsx', planner);
  console.log('Planner patched');
}
