import {By} from '@angular/platform-browser';
import {terse} from '@terse-ui/core/testing';
import {screen} from '@testing-library/angular';
import {AtomDisabled} from './atom-disabled';

describe('AtomDisabled', () => {
  describe('initial state', () => {
    it('should not have data-disabled or aria-disabled when not disabled', async () => {
      await terse(`<button atomDisabled>Save</button>`, {
        imports: [AtomDisabled],
      });

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('data-disabled');
      expect(button).not.toHaveAttribute('aria-disabled');
    });
  });

  describe('disabled state', () => {
    it('should set data-disabled when disabled', async () => {
      const {fixture} = await terse(`<button atomDisabled>Save</button>`, {
        imports: [AtomDisabled],
      });

      fixture.debugElement
        .query(By.directive(AtomDisabled))
        .injector.get(AtomDisabled)
        .disabled.set(true);
      fixture.detectChanges();

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', '');
    });

    it('should set aria-disabled to true when disabled', async () => {
      const {fixture} = await terse(`<button atomDisabled>Save</button>`, {
        imports: [AtomDisabled],
      });

      fixture.debugElement
        .query(By.directive(AtomDisabled))
        .injector.get(AtomDisabled)
        .disabled.set(true);
      fixture.detectChanges();

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('toggling', () => {
    it('should toggle disabled on and off correctly', async () => {
      const {fixture} = await terse(`<button atomDisabled>Save</button>`, {
        imports: [AtomDisabled],
      });

      const button = screen.getByRole('button');
      const directive = fixture.debugElement
        .query(By.directive(AtomDisabled))
        .injector.get(AtomDisabled);

      directive.disabled.set(true);
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-disabled', '');
      expect(button).toHaveAttribute('aria-disabled', 'true');

      directive.disabled.set(false);
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-disabled');
      expect(button).not.toHaveAttribute('aria-disabled');
    });
  });

  describe('element types', () => {
    it('should work with button elements', async () => {
      const {fixture} = await terse(`<button atomDisabled>Click</button>`, {
        imports: [AtomDisabled],
      });

      fixture.debugElement
        .query(By.directive(AtomDisabled))
        .injector.get(AtomDisabled)
        .disabled.set(true);
      fixture.detectChanges();

      expect(screen.getByRole('button')).toHaveAttribute('data-disabled', '');
    });

    it('should work with div elements', async () => {
      const {fixture} = await terse(`<div atomDisabled>Content</div>`, {
        imports: [AtomDisabled],
      });

      fixture.debugElement
        .query(By.directive(AtomDisabled))
        .injector.get(AtomDisabled)
        .disabled.set(true);
      fixture.detectChanges();

      const div = screen.getByText('Content');
      expect(div).toHaveAttribute('data-disabled', '');
      expect(div).toHaveAttribute('aria-disabled', 'true');
    });

    it('should work with anchor elements', async () => {
      const {fixture} = await terse(`<a atomDisabled href="#">Link</a>`, {
        imports: [AtomDisabled],
      });

      fixture.debugElement
        .query(By.directive(AtomDisabled))
        .injector.get(AtomDisabled)
        .disabled.set(true);
      fixture.detectChanges();

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('data-disabled', '');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
