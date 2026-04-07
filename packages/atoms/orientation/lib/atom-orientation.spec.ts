import {By} from '@angular/platform-browser';
import {terse} from '@terse-ui/core/testing';
import {screen} from '@testing-library/angular';
import {AtomOrientation} from './atom-orientation';

describe('AtomOrientation', () => {
  describe('default state', () => {
    it('should default to horizontal', async () => {
      await terse(`<div atomOrientation="horizontal">Content</div>`, {
        imports: [AtomOrientation],
      });

      const el = screen.getByText('Content');
      expect(el).toHaveAttribute('data-orientation', 'horizontal');
      expect(el).toHaveAttribute('aria-orientation', 'horizontal');
    });
  });

  describe('vertical orientation', () => {
    it('should set vertical on both attributes', async () => {
      await terse(`<div atomOrientation="vertical">Content</div>`, {
        imports: [AtomOrientation],
      });

      const el = screen.getByText('Content');
      expect(el).toHaveAttribute('data-orientation', 'vertical');
      expect(el).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('toggling orientation', () => {
    it('should update attributes when orientation changes', async () => {
      const {fixture} = await terse(`<div atomOrientation="horizontal">Content</div>`, {
        imports: [AtomOrientation],
      });

      const el = screen.getByText('Content');
      const directive = fixture.debugElement
        .query(By.directive(AtomOrientation))
        .injector.get(AtomOrientation);

      expect(el).toHaveAttribute('data-orientation', 'horizontal');
      expect(el).toHaveAttribute('aria-orientation', 'horizontal');

      directive.orientation.set('vertical');
      fixture.detectChanges();
      expect(el).toHaveAttribute('data-orientation', 'vertical');
      expect(el).toHaveAttribute('aria-orientation', 'vertical');

      directive.orientation.set('horizontal');
      fixture.detectChanges();
      expect(el).toHaveAttribute('data-orientation', 'horizontal');
      expect(el).toHaveAttribute('aria-orientation', 'horizontal');
    });
  });

  describe('element types', () => {
    it('should work with div elements', async () => {
      await terse(`<div atomOrientation="vertical">Content</div>`, {
        imports: [AtomOrientation],
      });

      expect(screen.getByText('Content')).toHaveAttribute('data-orientation', 'vertical');
    });

    it('should work with ul elements', async () => {
      await terse(`<ul atomOrientation="vertical"><li>Item</li></ul>`, {
        imports: [AtomOrientation],
      });

      const ul = screen.getByRole('list');
      expect(ul).toHaveAttribute('data-orientation', 'vertical');
      expect(ul).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('should work with nav elements', async () => {
      await terse(`<nav atomOrientation="horizontal" aria-label="Main">Nav</nav>`, {
        imports: [AtomOrientation],
      });

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('data-orientation', 'horizontal');
      expect(nav).toHaveAttribute('aria-orientation', 'horizontal');
    });
  });
});
