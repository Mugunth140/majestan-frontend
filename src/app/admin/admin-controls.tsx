"use client";
import {
  Children,
  isValidElement,
  type SelectHTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
} from "react";
import { Select, Checkbox } from "@radix-ui/themes";
/** Adapters keep existing form state handlers while using Radix accessible controls. */
export function AdminSelect({
  children,
  value,
  defaultValue,
  onChange,
  className,
  disabled,
  required,
  name,
  "aria-label": label,
  id,
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const options = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement<{
    value?: string | number;
    children?: React.ReactNode;
    disabled?: boolean;
  }>[];
  const empty = "__seo_empty__";
  return (
    <Select.Root
      value={value == null ? undefined : String(value) || empty}
      defaultValue={
        defaultValue == null ? undefined : String(defaultValue) || empty
      }
      onValueChange={(next) =>
        onChange?.({
          target: { value: next === empty ? "" : next },
        } as React.ChangeEvent<HTMLSelectElement>)
      }
      disabled={disabled}
      required={required}
      name={name}
      size="2"
    >
      <Select.Trigger id={id} aria-label={label} className={className} />
      <Select.Content position="popper">
        {options.map((option, index) => (
          <Select.Item
            key={index}
            value={String(option.props.value ?? "") || empty}
            disabled={option.props.disabled}
          >
            {option.props.children}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
export function AdminCheckbox({
  checked,
  defaultChecked,
  onChange,
  disabled,
  name,
  id,
  "aria-label": label,
  className,
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Checkbox
      id={id}
      name={name}
      aria-label={label}
      className={className}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      size="2"
      onCheckedChange={(next) =>
        onChange?.({
          target: { checked: next === true },
        } as React.ChangeEvent<HTMLInputElement>)
      }
    />
  );
}
