const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
let changed = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace tailwind class prefixes
    let newContent = content.replace(/indigo-/g, 'blue-')
                            .replace(/violet-/g, 'blue-')
                            .replace(/purple-/g, 'blue-');
                            
    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        changed++;
        console.log(`Updated ${file}`);
    }
});
console.log(`Changed ${changed} files.`);
