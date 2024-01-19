import {
  Description as HeadlessDescription,
  type DescriptionProps as HeadlessDescriptionProps,
  Field as HeadlessField,
  type FieldProps as HeadlessFieldProps,
  Fieldset as HeadlessFieldset,
  type FieldsetProps as HeadlessFieldsetProps,
  Label as HeadlessLabel,
  type LabelProps as HeadlessLabelProps,
  Legend as HeadlessLegend,
  type LegendProps as HeadlessLegendProps,
} from '@headlessui/react';
import clsx from 'clsx';
import React from 'react';

export function Fieldset({
  className,
  ...props
}: { disabled?: boolean } & HeadlessFieldsetProps) {
  return (
    <HeadlessFieldset
      {...props}
      className={clsx(
        className,
        '[&>*+[data-slot=control]]:mt-6 [&>[data-slot=text]]:mt-1',
      )}
    />
  );
}

export function Legend({ ...props }: HeadlessLegendProps) {
  return (
    <HeadlessLegend
      {...props}
      className={clsx(
        props.className,
        'text-base/6 font-semibold text-slate-950 data-[disabled]:opacity-50 sm:text-sm/6 dark:text-white',
      )}
      data-slot="legend"
    />
  );
}

export function FieldGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(className, 'space-y-8')}
      data-slot="control"
    />
  );
}

export function Field({ className, ...props }: HeadlessFieldProps) {
  return (
    <HeadlessField
      className={clsx(
        className,
        '[&>[data-slot=label]+[data-slot=control]]:mt-3',
        '[&>[data-slot=label]+[data-slot=description]]:mt-1',
        '[&>[data-slot=description]+[data-slot=control]]:mt-3',
        '[&>[data-slot=control]+[data-slot=description]]:mt-3',
        '[&>[data-slot=control]+[data-slot=error]]:mt-3',
        '[&>[data-slot=label]]:font-medium',
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: { className?: string } & HeadlessLabelProps) {
  return (
    <HeadlessLabel
      {...props}
      className={clsx(
        className,
        'select-none text-base/6 text-slate-950 data-[disabled]:opacity-50 sm:text-sm/6 dark:text-white',
      )}
      data-slot="label"
    />
  );
}

export function Description({
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  disabled,
  ...props
}: { className?: string; disabled?: boolean } & HeadlessDescriptionProps) {
  return (
    <HeadlessDescription
      {...props}
      className={clsx(
        className,
        'text-base/6 text-slate-500 data-[disabled]:opacity-50 sm:text-sm/6 dark:text-slate-400',
      )}
      data-slot="description"
    />
  );
}

export function ErrorMessage({
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  disabled,
  ...props
}: { className?: string; disabled?: boolean } & HeadlessDescriptionProps) {
  return (
    <HeadlessDescription
      {...props}
      className={clsx(
        className,
        'text-base/6 text-red-600 data-[disabled]:opacity-50 sm:text-sm/6 dark:text-red-500',
      )}
      data-slot="error"
    />
  );
}
