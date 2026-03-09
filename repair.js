const fs = require('fs');

const filesToFix = [
  'src/screens/auth/LoginScreen.tsx',
  'src/screens/auth/SignupScreen.tsx',
  'src/screens/common/InventoryDetailsScreen.tsx',
  'src/screens/common/ProfileScreen.tsx',
  'src/screens/common/UserDetailsScreen.tsx',
  'src/screens/nurse/NurseInventoryScreen.tsx',
  'src/screens/nurse/NurseReportsScreen.tsx',
  'src/screens/nurse/NurseUsersScreen.tsx',
  'src/screens/staff/StaffPrescriptionsScreen.tsx'
];

filesToFix.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add the import if it's missing
  if (!content.includes("../../contexts/ThemeContext")) {
    content = "import { useTheme } from '../../contexts/ThemeContext';\n" + content;
    changed = true;
  }
  
  if (!content.includes("../contexts/ThemeContext") && file.includes('/auth/')) {
     if (!content.includes("../../contexts/ThemeContext")) {
         // for auth it's also ../../
     }
  }

  // Inject colors inside the component block if not present
  // The component signature is usually `const ScreenName... => {`
  const compRegex = /(const \w+Screen.*?=>\s*\{)/;
  if (!content.includes('const { colors } = useTheme();')) {
    if (compRegex.test(content)) {
      content = content.replace(compRegex, "$1\n  const { colors } = useTheme();\n  const styles = makeStyles(colors);");
      changed = true;
    }
  } else if (!content.includes('const styles = makeStyles(colors);')) {
    // Has useTheme but not styles
    content = content.replace(/(const \{ colors \} = useTheme\(\);)/, "$1\n  const styles = makeStyles(colors);");
    changed = true;
  }

  // Fix double style definition
  if (content.includes('const { colors } = useTheme(); const styles = makeStyles(colors); makeStyles(colors)({')) {
     content = content.replace('const { colors } = useTheme(); const styles = makeStyles(colors); makeStyles(colors)({', 'const makeStyles = (colors: any) => StyleSheet.create({');
     changed = true;
  }

  // Final sanity check for double import
  content = content.replace(/import \{ useTheme \} from '\.\.\/\.\.\/contexts\/ThemeContext';\s*import \{ useTheme \} from '\.\.\/\.\.\/contexts\/ThemeContext';/, "import { useTheme } from '../../contexts/ThemeContext';");

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log("Fixed " + file);
  }
});
