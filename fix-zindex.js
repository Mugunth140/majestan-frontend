const fs = require('fs');
let file = 'src/app/admin/properties/new/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace zIndex: 10 with zIndex: 0 so the ChevronDown with default auto z-index renders above it.
content = content.replace(/zIndex: 10/g, "zIndex: 0");

fs.writeFileSync(file, content);
console.log('Fixed zIndex');
