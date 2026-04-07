import {By} from '@angular/platform-browser';
import {terse} from '@terse-ui/core/testing';
import {screen} from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import {AtomEscapeKey} from './atom-escape-key';

describe('AtomEscapeKey', () => {
  describe('escape key emission', () => {
    it('should emit on Escape key press', async () => {
      const onEscape = vi.fn();
      const {fixture} = await terse(
        `<button atomEscapeKey (atomEscapeKey)="onEscape($event)">Press me</button>`,
        {imports: [AtomEscapeKey], componentProperties: {onEscape}},
      );

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard('{Escape}');
      fixture.detectChanges();

      expect(onEscape).toHaveBeenCalledTimes(1);
      expect(onEscape).toHaveBeenCalledWith(expect.any(KeyboardEvent));
    });

    it('should NOT emit on other keys', async () => {
      const onEscape = vi.fn();
      const {fixture} = await terse(
        `<button atomEscapeKey (atomEscapeKey)="onEscape($event)">Press me</button>`,
        {imports: [AtomEscapeKey], componentProperties: {onEscape}},
      );

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      await userEvent.keyboard('{Tab}');
      fixture.detectChanges();

      expect(onEscape).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should NOT emit when disabled', async () => {
      const onEscape = vi.fn();
      const {fixture} = await terse(
        `<button atomEscapeKey (atomEscapeKey)="onEscape($event)">Press me</button>`,
        {imports: [AtomEscapeKey], componentProperties: {onEscape}},
      );

      fixture.debugElement
        .query(By.directive(AtomEscapeKey))
        .injector.get(AtomEscapeKey)
        .disabled.set(true);
      fixture.detectChanges();

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard('{Escape}');
      fixture.detectChanges();

      expect(onEscape).not.toHaveBeenCalled();
    });

    it('should emit after re-enabling', async () => {
      const onEscape = vi.fn();
      const {fixture} = await terse(
        `<button atomEscapeKey (atomEscapeKey)="onEscape($event)">Press me</button>`,
        {imports: [AtomEscapeKey], componentProperties: {onEscape}},
      );

      const directive = fixture.debugElement
        .query(By.directive(AtomEscapeKey))
        .injector.get(AtomEscapeKey);

      directive.disabled.set(true);
      fixture.detectChanges();

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard('{Escape}');
      fixture.detectChanges();
      expect(onEscape).not.toHaveBeenCalled();

      directive.disabled.set(false);
      fixture.detectChanges();

      await userEvent.keyboard('{Escape}');
      fixture.detectChanges();
      expect(onEscape).toHaveBeenCalledTimes(1);
    });
  });

  describe('element types', () => {
    it('should work with button elements', async () => {
      const onEscape = vi.fn();
      const {fixture} = await terse(
        `<button atomEscapeKey (atomEscapeKey)="onEscape($event)">Button</button>`,
        {imports: [AtomEscapeKey], componentProperties: {onEscape}},
      );

      const button = screen.getByRole('button');
      button.focus();
      await userEvent.keyboard('{Escape}');
      fixture.detectChanges();

      expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('should work with div elements', async () => {
      const onEscape = vi.fn();
      const {fixture} = await terse(
        `<div atomEscapeKey (atomEscapeKey)="onEscape($event)" tabindex="0">Custom</div>`,
        {imports: [AtomEscapeKey], componentProperties: {onEscape}},
      );

      const div = screen.getByText('Custom');
      div.focus();
      await userEvent.keyboard('{Escape}');
      fixture.detectChanges();

      expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('should work with anchor elements', async () => {
      const onEscape = vi.fn();
      const {fixture} = await terse(
        `<a atomEscapeKey (atomEscapeKey)="onEscape($event)" href="#">Link</a>`,
        {imports: [AtomEscapeKey], componentProperties: {onEscape}},
      );

      const link = screen.getByRole('link', {name: 'Link'});
      link.focus();
      await userEvent.keyboard('{Escape}');
      fixture.detectChanges();

      expect(onEscape).toHaveBeenCalledTimes(1);
    });
  });
});
