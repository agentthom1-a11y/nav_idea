const fs = require('fs');

let daily = fs.readFileSync('src/components/DailyScheduler.tsx', 'utf8');
daily = daily.replace(
  "const { addContent, currentUser } = useStore();",
  "const { addContent, currentUser, brandContext } = useStore();"
);
daily = daily.replace(
  "const results = await aiService.generateDailySuggestions(platforms, topics, date);",
  "const results = await aiService.generateDailySuggestions(platforms, topics, date, brandContext);"
);
fs.writeFileSync('src/components/DailyScheduler.tsx', daily);

let weekly = fs.readFileSync('src/components/WeeklyPlannerModal.tsx', 'utf8');
weekly = weekly.replace(
  "const { addContent, currentUser } = useStore();",
  "const { addContent, currentUser, brandContext } = useStore();"
);
weekly = weekly.replace(
  "const results = await aiService.generateWeeklyPlan(platforms, topics, startDate);",
  "const results = await aiService.generateWeeklyPlan(platforms, topics, startDate, brandContext);"
);
fs.writeFileSync('src/components/WeeklyPlannerModal.tsx', weekly);

