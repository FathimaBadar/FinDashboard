import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeVariant = 'neutral' | 'success' | 'warn' | 'info' | 'danger' | 'accent';

// Each variant pairs a fill token with the "on-" token guaranteed to be legible
// against it, so a badge can never end up with an unreadable colour combination.
const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: 'bg-surface-variant text-text',
  success: 'bg-success text-on-success',
  warn:    'bg-warn text-on-warn',
  info:    'bg-info text-on-info',
  danger:  'bg-danger text-on-danger',
  accent:  'bg-accent text-on-accent'
};

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
    '[class]': 'variantClasses()'
  },
  template: `<ng-content />`
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('neutral');

  protected readonly variantClasses = computed(() => VARIANT_CLASSES[this.variant()]);
}
