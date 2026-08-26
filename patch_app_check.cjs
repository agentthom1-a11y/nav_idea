const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'function App() {',
  `function App() {
  console.log('App render. React:', React);`
);

fs.writeFileSync(file, content);
