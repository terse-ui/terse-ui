import {By} from '@angular/platform-browser';
import {terse} from '@terse-ui/core/testing';
import {screen} from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import {AtomFocus} from './atom-focus';

describe('AtomFocus', () => {
  it('should not have data-focus or data-focus-visible initially', async () => {
    await terse(`<button atomFocus>Click me</button>`, {
      imports: [AtomFocus],
    });

    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('data-focus');
    expect(button).not.toHaveAttribute('data-focus-visible');
  });

  it('should set data-focus on any focus', async () => {
    const {fixture} = await terse(`<button atomFocus>Click me</button>`, {
      imports: [AtomFocus],
    });

    const button = screen.getByRole('button');
    button.focus();
    fixture.detectChanges();
    expect(button).toHaveAttribute('data-focus', '');
  });

  it('should set data-focus-visible on keyboard focus', async () => {
    const {fixture} = await terse(`<button atomFocus>Click me</button>`, {
      imports: [AtomFocus],
    });

    const button = screen.getByRole('button');
    await userEvent.tab();
    fixture.detectChanges();
    expect(button).toHaveAttribute('data-focus-visible', '');
  });

  it('should remove data-focus on blur', async () => {
    const {fixture} = await terse(`<button atomFocus>Click me</button>`, {
      imports: [AtomFocus],
    });

    const button = screen.getByRole('button');
    button.focus();
    fixture.detectChanges();
    expect(button).toHaveAttribute('data-focus', '');

    button.blur();
    fixture.detectChanges();
    expect(button).not.toHaveAttribute('data-focus');
  });

  it('should remove data-focus-visible on blur', async () => {
    const {fixture} = await terse(`<button atomFocus>Click me</button>`, {
      imports: [AtomFocus],
    });

    await userEvent.tab();
    fixture.detectChanges();
    expect(screen.getByRole('button')).toHaveAttribute('data-focus-visible', '');

    await userEvent.tab();
    fixture.detectChanges();
    expect(screen.getByRole('button')).not.toHaveAttribute('data-focus-visible');
  });

  it('should not set attributes when disabled', async () => {
    const {fixture} = await terse(`<button atomFocus>Click me</button>`, {
      imports: [AtomFocus],
    });

    fixture.debugElement.query(By.directive(AtomFocus)).injector.get(AtomFocus).disabled.set(true);
    fixture.detectChanges();

    await userEvent.tab();
    fixture.detectChanges();
    expect(screen.getByRole('button')).not.toHaveAttribute('data-focus');
    expect(screen.getByRole('button')).not.toHaveAttribute('data-focus-visible');
  });

  it('should expose isFocused writable signal', async () => {
    const {fixture} = await terse(`<button atomFocus>Click me</button>`, {
      imports: [AtomFocus],
    });

    const directive = fixture.debugElement.query(By.directive(AtomFocus)).injector.get(AtomFocus);

    expect(directive.isFocused()).toBe(false);

    directive.isFocused.set(true);
    fixture.detectChanges();
    expect(directive.isFocused()).toBe(true);
    expect(screen.getByRole('button')).toHaveAttribute('data-focus', '');
  });

  describe('element types', () => {
    it('should work on button elements', async () => {
      const {fixture} = await terse(`<button atomFocus>Button</button>`, {
        imports: [AtomFocus],
      });

      await userEvent.tab();
      fixture.detectChanges();
      expect(screen.getByRole('button')).toHaveAttribute('data-focus', '');
      expect(screen.getByRole('button')).toHaveAttribute('data-focus-visible', '');
    });

    it('should work on input elements', async () => {
      const {fixture} = await terse(`<input atomFocus aria-label="Name" />`, {
        imports: [AtomFocus],
      });

      await userEvent.tab();
      fixture.detectChanges();
      expect(screen.getByRole('textbox')).toHaveAttribute('data-focus', '');
    });
  });
});
