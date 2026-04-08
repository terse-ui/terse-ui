import {By} from '@angular/platform-browser';
import {terse} from '@terse-ui/core/testing';
import {screen} from '@testing-library/angular';
import {AtomOpenClose} from './atom-open-close';

describe('AtomOpenClose', () => {
  describe('initial state', () => {
    it('should default to closed', async () => {
      await terse(`<button [atomOpenClose]="false">Toggle</button>`, {
        imports: [AtomOpenClose],
      });

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('data-open');
      expect(button).toHaveAttribute('data-closed', '');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('open state', () => {
    it('should set data-open when open', async () => {
      const {fixture} = await terse(`<button [atomOpenClose]="false">Toggle</button>`, {
        imports: [AtomOpenClose],
      });

      fixture.debugElement
        .query(By.directive(AtomOpenClose))
        .injector.get(AtomOpenClose)
        .isOpen.set(true);
      fixture.detectChanges();

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-open', '');
      expect(button).not.toHaveAttribute('data-closed');
    });

    it('should set aria-expanded to true when open', async () => {
      const {fixture} = await terse(`<button [atomOpenClose]="false">Toggle</button>`, {
        imports: [AtomOpenClose],
      });

      fixture.debugElement
        .query(By.directive(AtomOpenClose))
        .injector.get(AtomOpenClose)
        .isOpen.set(true);
      fixture.detectChanges();

      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('closed state', () => {
    it('should set data-closed when closed', async () => {
      await terse(`<button [atomOpenClose]="false">Toggle</button>`, {
        imports: [AtomOpenClose],
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-closed', '');
      expect(button).not.toHaveAttribute('data-open');
    });

    it('should set aria-expanded to false when closed', async () => {
      await terse(`<button [atomOpenClose]="false">Toggle</button>`, {
        imports: [AtomOpenClose],
      });

      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('toggling', () => {
    it('should toggle attributes correctly', async () => {
      const {fixture} = await terse(`<button [atomOpenClose]="false">Toggle</button>`, {
        imports: [AtomOpenClose],
      });

      const button = screen.getByRole('button');
      const directive = fixture.debugElement
        .query(By.directive(AtomOpenClose))
        .injector.get(AtomOpenClose);

      directive.isOpen.set(true);
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-open', '');
      expect(button).not.toHaveAttribute('data-closed');
      expect(button).toHaveAttribute('aria-expanded', 'true');

      directive.isOpen.set(false);
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-open');
      expect(button).toHaveAttribute('data-closed', '');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('element types', () => {
    it('should work with div elements', async () => {
      const {fixture} = await terse(`<div [atomOpenClose]="false">Content</div>`, {
        imports: [AtomOpenClose],
      });

      const div = screen.getByText('Content');
      expect(div).toHaveAttribute('data-closed', '');

      fixture.debugElement
        .query(By.directive(AtomOpenClose))
        .injector.get(AtomOpenClose)
        .isOpen.set(true);
      fixture.detectChanges();
      expect(div).toHaveAttribute('data-open', '');
    });

    it('should work with details elements', async () => {
      const {fixture} = await terse(
        `<details [atomOpenClose]="false"><summary>Summary</summary>Details</details>`,
        {imports: [AtomOpenClose]},
      );

      const details = screen.getByText('Summary').closest('details')!;
      expect(details).toHaveAttribute('data-closed', '');

      fixture.debugElement
        .query(By.directive(AtomOpenClose))
        .injector.get(AtomOpenClose)
        .isOpen.set(true);
      fixture.detectChanges();
      expect(details).toHaveAttribute('data-open', '');
    });

    it('should work with section elements', async () => {
      const {fixture} = await terse(`<section [atomOpenClose]="false">Section</section>`, {
        imports: [AtomOpenClose],
      });

      const section = screen.getByText('Section');
      expect(section).toHaveAttribute('data-closed', '');

      fixture.debugElement
        .query(By.directive(AtomOpenClose))
        .injector.get(AtomOpenClose)
        .isOpen.set(true);
      fixture.detectChanges();
      expect(section).toHaveAttribute('data-open', '');
    });
  });
});
