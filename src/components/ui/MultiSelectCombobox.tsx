import { useMemo, useState, type CSSProperties } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import {
  areAllOptionsSelected,
  getNextValues,
  getToggleAllValues,
} from "./multiSelectComboboxState";
import "./MultiSelectCombobox.css";

type MultiSelectOption = {
  value: string;
  label: string;
  color?: string;
};

type MultiSelectComboboxProps = {
  emptyText: string;
  minSelected?: number;
  onValueChange: (nextValues: string[]) => void;
  options: MultiSelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  selectAllLabel?: string;
  value: string[];
};

function getSelectionLabel(
  placeholder: string,
  selectedOptions: MultiSelectOption[],
): string {
  if (selectedOptions.length === 0) {
    return placeholder;
  }

  if (selectedOptions.length === 1) {
    return selectedOptions[0].label;
  }

  return `${selectedOptions.length} languages selected`;
}

export function MultiSelectCombobox({
  emptyText,
  minSelected = 0,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  selectAllLabel,
  value,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false);
  const optionValues = useMemo(
    () => options.map((option) => option.value),
    [options],
  );
  const selectedValueSet = useMemo(() => new Set(value), [value]);
  const allOptionsSelected = useMemo(
    () => areAllOptionsSelected(value, optionValues),
    [optionValues, value],
  );
  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValueSet.has(option.value)),
    [options, selectedValueSet],
  );
  const triggerLabel = getSelectionLabel(placeholder, selectedOptions);
  const toggleButtonLabel = allOptionsSelected ? "Clear all" : selectAllLabel;

  return (
    <div className="multi-combobox">
      <Popover.Root onOpenChange={setOpen} open={open}>
        <Popover.Trigger asChild>
          <button
            aria-expanded={open}
            className="number-input multi-combobox__trigger"
            type="button"
          >
            <span
              className={
                selectedOptions.length === 0
                  ? "multi-combobox__trigger-text multi-combobox__trigger-text--placeholder"
                  : "multi-combobox__trigger-text"
              }
            >
              {triggerLabel}
            </span>
            <svg
              aria-hidden="true"
              className="multi-combobox__chevron"
              viewBox="0 0 16 16"
            >
              <path
                d="M4 6.25 8 10.25l4-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            className="multi-combobox__content"
            data-controls-panel-interactive-root="true"
            sideOffset={8}
          >
            <Command className="multi-combobox__command">
              <div className="multi-combobox__search-shell">
                <Command.Input
                  className="multi-combobox__search"
                  placeholder={searchPlaceholder}
                />
              </div>

              {selectAllLabel ? (
                <div className="multi-combobox__actions">
                  <button
                    aria-pressed={allOptionsSelected}
                    className={
                      allOptionsSelected
                        ? "multi-combobox__action multi-combobox__action--active"
                        : "multi-combobox__action"
                    }
                    onClick={() => {
                      onValueChange(
                        getToggleAllValues({
                          currentValues: value,
                          minSelected,
                          optionValues,
                        }),
                      );
                    }}
                    type="button"
                  >
                    <span>{toggleButtonLabel}</span>
                    <span className="multi-combobox__action-count">
                      {value.length}/{options.length}
                    </span>
                  </button>
                </div>
              ) : null}

              <Command.List className="multi-combobox__list">
                <Command.Empty className="multi-combobox__empty">
                  {emptyText}
                </Command.Empty>
                <Command.Group
                  className="multi-combobox__group"
                  heading="Languages"
                >
                  {options.map((option) => {
                    const isSelected = selectedValueSet.has(option.value);
                    const isLocked = isSelected && value.length <= minSelected;
                    const swatchStyle = option.color
                      ? ({ "--language-color": option.color } as CSSProperties)
                      : undefined;

                    return (
                      <Command.Item
                        className="multi-combobox__item"
                        disabled={isLocked}
                        key={option.value}
                        keywords={[option.label]}
                        onSelect={() => {
                          onValueChange(
                            getNextValues(value, option.value, minSelected),
                          );
                        }}
                        value={option.value}
                      >
                        <span
                          aria-hidden="true"
                          className="multi-combobox__swatch"
                          style={swatchStyle}
                        />
                        <span className="multi-combobox__item-label">
                          {option.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className={
                            isSelected
                              ? "multi-combobox__check multi-combobox__check--selected"
                              : "multi-combobox__check"
                          }
                        >
                          <svg viewBox="0 0 16 16">
                            <path
                              d="M3.25 8.25 6.5 11.5l6.25-7"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.7"
                            />
                          </svg>
                        </span>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
