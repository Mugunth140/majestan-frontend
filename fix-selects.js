const fs = require('fs');

const files = [
  'src/app/admin/cities/new/page.tsx',
  'src/app/admin/properties/new/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace <select ...> with <select ... style={{ display: 'block', width: '100%', minHeight: '45px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#111827', borderRadius: '0.75rem', padding: '0.625rem 1rem', opacity: 1, position: 'relative', zIndex: 50 }}>
  
  // Need to be careful. Properties/new uses relative custom dropdown with appearance-none.
  content = content.replace(/<select([\s\S]*?)className="(.*?)"(.*?)>/g, (match, p1, p2, p3) => {
    // If it already has style, skip to avoid breaking
    if (match.includes('style={{')) return match;
    
    // For properties/new, it has ChevronDown, so appearance: 'none' is better.
    let appearance = 'auto';
    if (p2.includes('appearance-none')) {
      appearance = 'none';
    }
    
    return `<select${p1}className="${p2}"${p3} style={{ display: 'block', width: '100%', minHeight: '45px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#111827', borderRadius: '0.75rem', padding: '0.625rem 1rem', opacity: 1, position: 'relative', zIndex: 10, appearance: '${appearance}' }}>`;
  });

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
