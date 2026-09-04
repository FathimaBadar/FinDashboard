import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

@Component({
  imports: [BadgeComponent],
  template: `<app-badge [variant]="variant" class="ml-2">{{ label }}</app-badge>`
})
class HostComponent {
  variant: 'neutral' | 'success' | 'danger' = 'neutral';
  label = 'Approved';
}

describe('BadgeComponent', () => {
  const badgeOf = (fixture: { nativeElement: unknown }) =>
    (fixture.nativeElement as HTMLElement).querySelector('app-badge')!;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  it('projects its content', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(badgeOf(fixture).textContent?.trim()).toBe('Approved');
  });

  it('applies the variant classes and swaps them when the variant changes', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.variant = 'success';
    fixture.detectChanges();

    expect(badgeOf(fixture).classList).toContain('bg-success');
    expect(badgeOf(fixture).classList).toContain('text-on-success');

    fixture.componentInstance.variant = 'danger';
    fixture.detectChanges();

    expect(badgeOf(fixture).classList).toContain('bg-danger');
    // The previous variant's classes must be removed, or variants would accumulate.
    expect(badgeOf(fixture).classList).not.toContain('bg-success');
  });

  it('keeps its static host classes and the consumer\'s own classes', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.variant = 'success';
    fixture.detectChanges();

    // The [class] host binding must merge with, not replace, these two sources —
    // otherwise `class="ml-2"` at the call site would be silently dropped.
    expect(badgeOf(fixture).classList).toContain('rounded-full');
    expect(badgeOf(fixture).classList).toContain('ml-2');
  });
});
