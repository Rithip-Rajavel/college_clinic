const fs = require('fs');
const path = require('path');

function replaceFileContent(filePath, replacer) {
  const p = path.join(__dirname, filePath);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  let newContent = replacer(content);
  if (content !== newContent) {
    fs.writeFileSync(p, newContent, 'utf8');
    console.log('Fixed ' + filePath);
  }
}

// 1. UserDetailsScreen: Add Share import
replaceFileContent('src/screens/common/UserDetailsScreen.tsx', content => {
  if (!content.includes(' Share ') && !content.includes(', Share}')) {
     return content.replace(/import \{(.*?)\} from 'react-native';/, (match, p1) => {
        if (!p1.includes('Share')) {
           return `import {${p1}, Share} from 'react-native';`;
        }
        return match;
     });
  }
  return content;
});

// 2. NurseInventoryScreen: fix bordercolor
replaceFileContent('src/screens/nurse/NurseInventoryScreen.tsx', content => {
  return content.replace(/bordercolor:/g, 'borderColor:');
});

// 3. NurseUsersScreen: fix bordercolor
replaceFileContent('src/screens/nurse/NurseUsersScreen.tsx', content => {
  return content.replace(/bordercolor:/g, 'borderColor:');
});

// 4. StaffPrescriptionsScreen: Add styles if missing
replaceFileContent('src/screens/staff/StaffPrescriptionsScreen.tsx', content => {
  if (!content.includes('const styles = makeStyles(colors);')) {
     return content.replace(/(const \{ colors \} = useTheme\(\);)/, "$1\n  const styles = makeStyles(colors);");
  }
  return content;
});

// 5. NurseReportsScreen: Fix duplicate reportDetails and add typeChipText
replaceFileContent('src/screens/nurse/NurseReportsScreen.tsx', content => {
  let c = content;
  // Rename the second reportDetails to reportDetailsContainer or just rename it since it's only used for margin
  c = c.replace(/  reportDetails: \{\n    marginBottom: responsive\.margin\.md,\n  \},/, "  reportDetailsSection: {\n    marginBottom: responsive.margin.md,\n  },");
  
  // Also rename the usage
  c = c.replace(/style=\{styles\.reportDetails\}\>\n\s*<View style=\{styles\.detailRow\}\>/, "style={styles.reportDetailsSection}>\n                  <View style={styles.detailRow}>");

  if (!c.includes('typeChipText: {')) {
     c = c.replace(/  typeChip: \{/, "  typeChipText: {\n    color: 'white',\n    fontSize: responsive.fontSize.xs,\n  },\n  typeChip: {");
  }
  return c;
});

