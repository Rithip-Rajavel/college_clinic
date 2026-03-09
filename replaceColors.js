const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace colors
  content = content.replace(/backgroundColor:\s*['"]#f5f5f5['"]/g, 'backgroundColor: colors.background');
  content = content.replace(/backgroundColor:\s*['"]#ffffff['"]|backgroundColor:\s*['"]#fff['"]/gi, 'backgroundColor: colors.surface');
  content = content.replace(/backgroundColor:\s*['"]#f8f9fa['"]/g, 'backgroundColor: colors.surfaceVariant');
  content = content.replace(/backgroundColor:\s*['"]#3498db['"]/g, 'backgroundColor: colors.primary');
  content = content.replace(/color:\s*['"]#2c3e50['"]/gi, 'color: colors.text');
  content = content.replace(/color:\s*['"]#7f8c8d['"]/gi, 'color: colors.textSecondary');
  content = content.replace(/color:\s*['"]#95a5a6['"]/gi, 'color: colors.textMuted');
  content = content.replace(/color:\s*['"]#e74c3c['"]/gi, 'color: colors.danger');
  content = content.replace(/backgroundColor:\s*['"]#e74c3c['"]/gi, 'backgroundColor: colors.danger');
  content = content.replace(/backgroundColor:\s*['"]#27ae60['"]/gi, 'backgroundColor: colors.success');
  content = content.replace(/color:\s*['"]#27ae60['"]/gi, 'color: colors.success');
  content = content.replace(/borderBottomColor:\s*['"]#eee['"]|borderBottomColor:\s*['"]#eeeeee['"]/gi, 'borderBottomColor: colors.divider');
  content = content.replace(/borderTopColor:\s*['"]#eee['"]|borderTopColor:\s*['"]#eeeeee['"]/gi, 'borderTopColor: colors.divider');
  content = content.replace(/borderColor:\s*['"]#eee['"]|borderColor:\s*['"]#eeeeee['"]/gi, 'borderColor: colors.divider');

  if (content !== originalContent) {
    if (!content.includes('useTheme')) {
        content = content.replace(/(import.*from ['"]react-native['"];)/, "$\nimport { useTheme } from '../../contexts/ThemeContext';");
    }
    
    // Inject hook if missing
    if (!content.includes('const { colors } = useTheme();')) {
      content = content.replace(/(const \w+Screen: React\.FC = \(\) => {)/, "$\n  const { colors } = useTheme();\n  const styles = makeStyles(colors);");
    }

    content = content.replace(/const styles = StyleSheet\.create/g, 'const makeStyles = (colors: any) => StyleSheet.create');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

traverse(screensDir);
