const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // 1. Replace literal `$` before `{` in JSX (e.g. >${value} or " > ${value}")
  // We want to replace $ only when it's text in JSX, which usually follows >, or space, or ".
  content = content.replace(/>\s*\$\{/g, '>₹{');
  content = content.replace(/"\$\{/g, '"₹{');
  
  // 2. Replace Price ($) etc.
  content = content.replace(/Price \(\$\)/g, 'Price (₹)');
  content = content.replace(/Cost \(\$\)/g, 'Cost (₹)');
  
  // 3. Replace literal $ followed by a number
  content = content.replace(/\$([0-9])/g, '₹$1');
  
  // 4. Replace specific strings
  content = content.replace(/Total: \$/g, 'Total: ₹');
  content = content.replace(/Discount: \$/g, 'Discount: ₹');
  content = content.replace(/Raw: \$/g, 'Raw: ₹');
  content = content.replace(/Fixed: \$/g, 'Fixed: ₹');
  
  // 5. Replace `\${` inside backticks where the user intended a dollar sign followed by interpolation.
  // Wait, in JS template literals, `${var}` is interpolation. A literal dollar before it is `$${var}`.
  content = content.replace(/\$\$\{/g, '₹${');
  
  // 6. In some cases, we might have `\${` in string literals? 
  // Let's just fix the remaining >${ occurrences which might not have been caught
  content = content.replace(/>\$\{/g, '>₹{');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
