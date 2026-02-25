import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { responsive } from '../../utils/dimensions';

interface DropdownComponentProps {
  label: string;
  data: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorText?: string;
}

const DropdownComponent: React.FC<DropdownComponentProps> = ({
  label,
  data,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error = false,
  errorText,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      <Dropdown
        style={[styles.dropdown, error && styles.dropdownError, disabled && styles.disabled]}
        data={data}
        placeholder={placeholder}
        labelField="label"
        valueField="value"
        value={value}
        onChange={(item) => onChange(item.value)}
        disable={disabled}
        maxHeight={responsive.height(200)}
      />
      {error && errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: responsive.margin.md,
  },
  label: {
    fontSize: responsive.fontSize.sm,
    marginBottom: responsive.margin.xs,
    color: '#666',
    fontWeight: '500',
  },
  labelError: {
    color: '#f44336',
  },
  dropdown: {
    height: responsive.height(56),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: responsive.borderRadius.md,
    paddingHorizontal: responsive.padding.md,
    backgroundColor: '#fff',
  },
  dropdownError: {
    borderColor: '#f44336',
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  errorText: {
    fontSize: responsive.fontSize.xs,
    color: '#f44336',
    marginTop: responsive.margin.xs,
  },
});

export default DropdownComponent;
