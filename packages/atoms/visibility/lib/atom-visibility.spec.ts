import type {WritableSignal} from '@angular/core';
import {signal} from '@angular/core';
import type {ElementVisibilityValue} from '@signality/core';
import {terse} from '@terse-ui/core/testing';
import {screen} from '@testing-library/angular';
import {AtomVisibility} from './atom-visibility';

let mockVisibilitySignal: WritableSignal<ElementVisibilityValue>;

vi.mock('@signality/core', () => ({
  elementVisibility: () => mockVisibilitySignal,
}));

beforeEach(() => {
  mockVisibilitySignal = signal({isVisible: false, ratio: 0});
});

describe('AtomVisibility', () => {
  it('should set data-visible when visible', async () => {
    mockVisibilitySignal.set({isVisible: true, ratio: 1});

    const {fixture} = await terse(`<div atomVisibility>Content</div>`, {
      imports: [AtomVisibility],
    });

    fixture.detectChanges();
    expect(screen.getByText('Content')).toHaveAttribute('data-visible', '');
    expect(screen.getByText('Content')).not.toHaveAttribute('data-hidden');
  });

  it('should set data-hidden when not visible', async () => {
    const {fixture} = await terse(`<div atomVisibility>Content</div>`, {
      imports: [AtomVisibility],
    });

    fixture.detectChanges();
    expect(screen.getByText('Content')).toHaveAttribute('data-hidden', '');
    expect(screen.getByText('Content')).not.toHaveAttribute('data-visible');
  });

  it('should not set data attributes when disabled', async () => {
    mockVisibilitySignal.set({isVisible: true, ratio: 1});

    const {fixture} = await terse(
      `<div atomVisibility [atomVisibilityDisabled]="true">Content</div>`,
      {
        imports: [AtomVisibility],
      },
    );

    fixture.detectChanges();
    expect(screen.getByText('Content')).not.toHaveAttribute('data-visible');
    expect(screen.getByText('Content')).not.toHaveAttribute('data-hidden');
  });

  it('should expose isVisible signal', async () => {
    mockVisibilitySignal.set({isVisible: true, ratio: 0.75});

    const {fixture} = await terse(`<div atomVisibility>Content</div>`, {
      imports: [AtomVisibility],
    });

    const directive = fixture.query(AtomVisibility);
    expect(directive.isVisible()).toBe(true);

    mockVisibilitySignal.set({isVisible: false, ratio: 0});
    expect(directive.isVisible()).toBe(false);
  });

  it('should expose ratio signal', async () => {
    mockVisibilitySignal.set({isVisible: true, ratio: 0.5});

    const {fixture} = await terse(`<div atomVisibility>Content</div>`, {
      imports: [AtomVisibility],
    });

    const directive = fixture.query(AtomVisibility);
    expect(directive.ratio()).toBe(0.5);

    mockVisibilitySignal.set({isVisible: true, ratio: 1});
    expect(directive.ratio()).toBe(1);
  });
});
