import React from "react";
import ReactSelect from "react-select";

export const MemoizedSelect = React.memo(
  ({
    value,
    onChange,
    options,
    placeholder,
    isMulti = false,
    isLoading = false,
    noOptionsMessage,
    className,
    classNamePrefix,
    ...props
  }) => {
    const selectOptions = options.map((option) => {
      if (option?.label && option?.value !== undefined) {
        return {
          value: option.value,
          label: option.label,
          ...option, 
        };
      }
      return {
        value: option.value || option,
        label: option.label || option,
      };
    });

    const selectedOption = isMulti
      ? Array.isArray(value)
        ? value.map((v) => {
            const valueToFind = v?.value !== undefined ? v.value : v;
            const found = selectOptions.find(
              (opt) => opt.value === valueToFind
            );
            return found || v;
          })
        : []
      : value && value !== "" && value !== null
      ? (() => {
          const valueToFind = value?.value !== undefined ? value.value : value;
          const found = selectOptions.find(
            (option) => option.value === valueToFind
          );
          return found || value;
        })()
      : null;

    const customSelectStyles = {
      control: (base, state) => ({
        ...base,
        minHeight: "40px",
        borderColor: state.isFocused ? "hsl(var(--ring))" : "hsl(var(--input))",
        backgroundColor: "hsl(var(--background))",
        "&:hover": {
          borderColor: "hsl(var(--ring))",
        },
        boxShadow: state.isFocused ? "0 0 0 1px hsl(var(--ring))" : "none",
        borderRadius: "calc(var(--radius) - 2px)",
        cursor: "pointer",
        transition: "all 0.2s",
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: "hsl(var(--popover))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "calc(var(--radius) - 2px)",
        boxShadow: "var(--shadow-md)",
        zIndex: 50,
        marginTop: "4px",
      }),
      menuList: (base) => ({
        ...base,
        padding: "4px",
        maxHeight: "200px",
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "hsl(var(--accent))"
          : state.isFocused
          ? "hsl(var(--accent))"
          : "transparent",
        color: state.isSelected
          ? "hsl(var(--accent-foreground))"
          : "hsl(var(--foreground))",
        borderRadius: "calc(var(--radius) - 4px)",
        padding: "8px 12px",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 0.15s",
        "&:active": {
          backgroundColor: "hsl(var(--accent))",
        },
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: "hsl(var(--accent))",
        borderRadius: "calc(var(--radius) - 2px)",
        display: "flex",
        gap: "2px",
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: "hsl(var(--accent-foreground))",
        fontSize: "13px",
        padding: "2px 6px",
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: "hsl(var(--muted-foreground))",
        borderRadius: "0 calc(var(--radius) - 3px) calc(var(--radius) - 3px) 0",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "hsl(var(--destructive))",
          color: "hsl(var(--destructive-foreground))",
        },
      }),
      placeholder: (base) => ({
        ...base,
        color: "hsl(var(--muted-foreground))",
        fontSize: "14px",
      }),
      input: (base) => ({
        ...base,
        color: "hsl(var(--foreground))",
        fontSize: "14px",
      }),
      singleValue: (base) => ({
        ...base,
        color: "hsl(var(--foreground))",
        fontSize: "14px",
      }),
      indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: "hsl(var(--border))",
      }),
      dropdownIndicator: (base) => ({
        ...base,
        color: "hsl(var(--muted-foreground))",
        padding: "8px",
        "&:hover": {
          color: "hsl(var(--foreground))",
        },
      }),
      clearIndicator: (base) => ({
        ...base,
        color: "hsl(var(--muted-foreground))",
        padding: "8px",
        "&:hover": {
          color: "hsl(var(--destructive))",
        },
      }),
      loadingIndicator: (base) => ({
        ...base,
        color: "hsl(var(--muted-foreground))",
      }),
    };

    return (
      <ReactSelect
        value={selectedOption}
        onChange={(selected) => {
          if (isMulti) {
            const selectedValues = Array.isArray(selected)
              ? selected.map((s) => ({
                  value: s.value,
                  label: s.label,
                  ...s,
                }))
              : [];
            onChange(selectedValues);
          } else {
            if (selected) {
              onChange({
                value: selected.value,
                label: selected.label,
                ...selected,
              });
            } else {
              onChange(null);
            }
          }
        }}
        options={selectOptions}
        placeholder={placeholder || "Select..."}
        isMulti={isMulti}
        isLoading={isLoading}
        styles={customSelectStyles}
        components={{
          IndicatorSeparator: () => null,
        }}
        noOptionsMessage={
          noOptionsMessage
            ? () => noOptionsMessage
            : () => "No options available"
        }
        className={className}
        classNamePrefix={classNamePrefix}
        isClearable
        {...props}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.value) === JSON.stringify(nextProps.value) &&
      JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options) &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.isMulti === nextProps.isMulti
    );
  }
);

MemoizedSelect.displayName = "MemoizedSelect";

export default MemoizedSelect;
