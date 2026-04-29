const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const filepath = path.join(dir, file);
      if (fs.statSync(filepath).isDirectory()) {
        filelist = walkSync(filepath, filelist);
      } else if (filepath.endsWith('.jsx') || filepath.endsWith('.js')) {
        filelist.push(filepath);
      }
    });
  }
  return filelist;
};

const files = walkSync(path.join(__dirname, 'frontend/src'));

let fixes = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  const rel = path.relative(path.dirname(file), path.join(__dirname, 'frontend/src')).replace(/\\/g, '/');
  
  // Basic context fixes
  content = content.replace(/from '(?:\.\.\/)+context\//g, `from '${rel || '.'}/context/`);
  content = content.replace(/from '(?:\.\.\/)+shared\//g, `from '${rel || '.'}/shared/`);
  
  // Fix specific shared component imports
  const sharedComps = ['Navbar', 'Pagination', 'LoadingSpinner', 'EmptyState', 'ProtectedRoute'];
  sharedComps.forEach(comp => {
    // If it imports from some form of components/Comp
    const regex = new RegExp(`from '(?:\.\\/|\\.\\.\\/)+components\\/${comp}'`, 'g');
    content = content.replace(regex, `from '${rel || '.'}/shared/components/${comp}'`);
  });

  // Fix hooks
  const sharedHooks = ['useFetch', 'useMutation'];
  sharedHooks.forEach(hook => {
    const regex = new RegExp(`from '(?:\.\\/|\\.\\.\\/)+hooks\\/${hook}'`, 'g');
    content = content.replace(regex, `from '${rel || '.'}/shared/hooks/${hook}'`);
  });

  // Fix shared services
  const sharedServices = ['api', 'auth.service'];
  sharedServices.forEach(srv => {
    const regex = new RegExp(`from '(?:\.\\/|\\.\\.\\/)+services\\/${srv}'`, 'g');
    content = content.replace(regex, `from '${rel || '.'}/shared/services/${srv}'`);
  });

  // Fix specific module services
  content = content.replace(/from '(?:\.\.\/)+services\/product\.service'/g, `from '${rel || '.'}/modules/user/services/product.service'`);
  content = content.replace(/from '(?:\.\.\/)+services\/shop\.service'/g, `from '${rel || '.'}/modules/seller/services/shop.service'`);
  content = content.replace(/from '(?:\.\.\/)+services\/admin\.service'/g, `from '${rel || '.'}/modules/admin/services/admin.service'`);

  // Fix components
  content = content.replace(/from '(?:\.\.\/)+components\/ProductCard'/g, `from '${rel || '.'}/modules/user/components/ProductCard'`);
  content = content.replace(/from '(?:\.\.\/)+components\/ShopCard'/g, `from '${rel || '.'}/modules/user/components/ShopCard'`);

  // Specific admin internal fixes
  if (file.includes('modules\\admin\\pages') || file.includes('modules/admin/pages')) {
    content = content.replace(/from '\.\.\/components\//g, `from '../components/`);
  }
  if (file.includes('modules\\admin\\components') || file.includes('modules/admin/components')) {
    content = content.replace(/from '\.\.\/components\//g, `from './`);
  }

  // Optimize path dot dots if they resolve to standard (e.g., ../../shared -> correctly resolved relative to the file)
  // Let's resolve the absolute path and turn back to relative
  // A simpler regex approach:
  const fixRelativeImports = (content, fileDir) => {
    return content.replace(/from '([^']+)'/g, (match, p1) => {
      if (!p1.startsWith('.')) return match; // skip absolute/npm modules
      // Resolve against current file dir
      let absPath;
      if (p1.startsWith(`${rel}/`)) {
        absPath = path.resolve(__dirname, 'frontend/src', p1.substring(rel.length + 1));
      } else {
        absPath = path.resolve(fileDir, p1);
      }
      
      let newRel = path.relative(fileDir, absPath).replace(/\\/g, '/');
      if (!newRel.startsWith('.')) newRel = './' + newRel;
      
      // Remove trailing index.js or jsx if it was added implicitly? No need, path.relative just compares strings.
      return `from '${newRel}'`;
    });
  };

  content = fixRelativeImports(content, path.dirname(file));

  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    fixes++;
    console.log(`Fixed imports in ${file}`);
  }
});

console.log(`Fixed ${fixes} files.`);
