import {render, screen} from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import {BaseHover} from './index';

describe('BaseHover', () => {
  describe('pointer hover', () => {
    it('should set data-hover on mouse pointerenter', async () => {
      const {fixture} = await render(`<button baseHover>Hover me</button>`, {
        imports: [BaseHover],
      });

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('data-hover');

      await userEvent.hover(button);
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-hover', '');
    });

    it('should remove data-hover on mouse pointerleave', async () => {
      const {fixture} = await render(`<button baseHover>Hover me</button>`, {
        imports: [BaseHover],
      });

      const button = screen.getByRole('button');

      await userEvent.hover(button);
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-hover', '');

      await userEvent.unhover(button);
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-hover');
    });

    it('should not have data-hover initially', async () => {
      await render(`<button baseHover>Hover me</button>`, {imports: [BaseHover]});

      expect(screen.getByRole('button')).not.toHaveAttribute('data-hover');
    });
  });

  describe('mouse events fallback', () => {
    it('should track hover with mouseenter/mouseleave', async () => {
      const {fixture} = await render(`<button baseHover>Hover me</button>`, {
        imports: [BaseHover],
      });

      const button = screen.getByRole('button');

      await userEvent.hover(button);
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-hover', '');

      await userEvent.unhover(button);
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-hover');
    });
  });

  describe('touch events', () => {
    it('should ignore touch pointer events', async () => {
      const {fixture} = await render(`<button baseHover>Hover me</button>`, {
        imports: [BaseHover],
      });

      const button = screen.getByRole('button');

      await userEvent.pointer({keys: '[TouchA]', target: button});
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-hover');
    });

    it('should ignore emulated mouse events after touch', async () => {
      const {fixture} = await render(`<button baseHover>Hover me</button>`, {
        imports: [BaseHover],
      });

      const button = screen.getByRole('button');

      await userEvent.pointer({keys: '[TouchA]', target: button});
      await userEvent.hover(button);
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-hover');
    });
  });

  describe('disabled state', () => {
    it('should not trigger hover when disabled', async () => {
      const userNoPointerCheck = userEvent.setup({pointerEventsCheck: 0});
      const {fixture} = await render(
        `<button baseHover [baseHoverDisabled]="true">Hover me</button>`,
        {imports: [BaseHover]},
      );

      const button = screen.getByRole('button');

      await userNoPointerCheck.hover(button);
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-hover');
    });

    it('should reset hover when becoming disabled while hovered', async () => {
      const {fixture, rerender} = await render(
        `<button baseHover [baseHoverDisabled]="isDisabled">Hover me</button>`,
        {imports: [BaseHover], componentProperties: {isDisabled: false}},
      );

      const button = screen.getByRole('button');

      await userEvent.hover(button);
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-hover', '');

      await rerender({componentProperties: {isDisabled: true}});
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-hover');
    });

    it('should allow hover after re-enabling', async () => {
      const {fixture, rerender} = await render(
        `<button baseHover [baseHoverDisabled]="isDisabled">Hover me</button>`,
        {imports: [BaseHover], componentProperties: {isDisabled: true}},
      );

      const button = screen.getByRole('button');

      await rerender({componentProperties: {isDisabled: false}});
      fixture.detectChanges();

      await userEvent.hover(button);
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-hover', '');
    });
  });

  describe('element types', () => {
    it('should work with button elements', async () => {
      const {fixture} = await render(`<button baseHover>Button</button>`, {
        imports: [BaseHover],
      });

      const button = screen.getByRole('button');
      await userEvent.hover(button);
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-hover', '');
    });

    it('should work with div elements', async () => {
      const {fixture} = await render(`<div baseHover tabindex="0">Custom</div>`, {
        imports: [BaseHover],
      });

      const div = screen.getByText('Custom');
      await userEvent.hover(div);
      fixture.detectChanges();
      expect(div).toHaveAttribute('data-hover', '');
    });

    it('should work with anchor elements', async () => {
      const {fixture} = await render(`<a baseHover href="#">Link</a>`, {
        imports: [BaseHover],
      });

      const link = screen.getByRole('link', {name: 'Link'});
      await userEvent.hover(link);
      fixture.detectChanges();
      expect(link).toHaveAttribute('data-hover', '');
    });
  });

  describe('mouseenter/mouseleave sequence', () => {
    it('should handle multiple enter/leave cycles', async () => {
      const {fixture} = await render(`<button baseHover>Hover me</button>`, {
        imports: [BaseHover],
      });

      const button = screen.getByRole('button');

      for (let i = 0; i < 3; i++) {
        await userEvent.hover(button);
        fixture.detectChanges();
        expect(button).toHaveAttribute('data-hover', '');

        await userEvent.unhover(button);
        fixture.detectChanges();
        expect(button).not.toHaveAttribute('data-hover');
      }
    });
  });
});
