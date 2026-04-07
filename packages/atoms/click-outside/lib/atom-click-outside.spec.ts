import {By} from '@angular/platform-browser';
import {terse} from '@terse-ui/core/testing';
import {screen} from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import {AtomClickOutside} from './atom-click-outside';

describe('AtomClickOutside', () => {
  describe('click outside detection', () => {
    it('should emit when clicking outside the host element', async () => {
      const onClickOutside = vi.fn();
      const {fixture} = await terse(
        `<div>
          <div atomClickOutside (atomClickOutside)="onClickOutside($event)">Inside</div>
          <button>Outside</button>
        </div>`,
        {imports: [AtomClickOutside], componentProperties: {onClickOutside}},
      );

      const outsideButton = screen.getByRole('button', {name: 'Outside'});
      await userEvent.click(outsideButton);
      fixture.detectChanges();

      expect(onClickOutside).toHaveBeenCalledTimes(1);
      expect(onClickOutside).toHaveBeenCalledWith(expect.any(PointerEvent));
    });

    it('should NOT emit when clicking inside the host element', async () => {
      const onClickOutside = vi.fn();
      const {fixture} = await terse(
        `<div>
          <div atomClickOutside (atomClickOutside)="onClickOutside($event)">Inside</div>
          <button>Outside</button>
        </div>`,
        {imports: [AtomClickOutside], componentProperties: {onClickOutside}},
      );

      const inside = screen.getByText('Inside');
      await userEvent.click(inside);
      fixture.detectChanges();

      expect(onClickOutside).not.toHaveBeenCalled();
    });

    it('should NOT emit when clicking on a child of the host element', async () => {
      const onClickOutside = vi.fn();
      const {fixture} = await terse(
        `<div>
          <div atomClickOutside (atomClickOutside)="onClickOutside($event)">
            <button>Child button</button>
          </div>
          <button>Outside</button>
        </div>`,
        {imports: [AtomClickOutside], componentProperties: {onClickOutside}},
      );

      const childButton = screen.getByRole('button', {name: 'Child button'});
      await userEvent.click(childButton);
      fixture.detectChanges();

      expect(onClickOutside).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should NOT emit when disabled', async () => {
      const onClickOutside = vi.fn();
      const {fixture} = await terse(
        `<div>
          <div atomClickOutside (atomClickOutside)="onClickOutside($event)">Inside</div>
          <button>Outside</button>
        </div>`,
        {imports: [AtomClickOutside], componentProperties: {onClickOutside}},
      );

      fixture.debugElement
        .query(By.directive(AtomClickOutside))
        .injector.get(AtomClickOutside)
        .disabled.set(true);
      fixture.detectChanges();

      const outsideButton = screen.getByRole('button', {name: 'Outside'});
      await userEvent.click(outsideButton);
      fixture.detectChanges();

      expect(onClickOutside).not.toHaveBeenCalled();
    });

    it('should emit after re-enabling', async () => {
      const onClickOutside = vi.fn();
      const {fixture} = await terse(
        `<div>
          <div atomClickOutside (atomClickOutside)="onClickOutside($event)">Inside</div>
          <button>Outside</button>
        </div>`,
        {imports: [AtomClickOutside], componentProperties: {onClickOutside}},
      );

      const directive = fixture.debugElement
        .query(By.directive(AtomClickOutside))
        .injector.get(AtomClickOutside);

      directive.disabled.set(true);
      fixture.detectChanges();

      const outsideButton = screen.getByRole('button', {name: 'Outside'});
      await userEvent.click(outsideButton);
      fixture.detectChanges();
      expect(onClickOutside).not.toHaveBeenCalled();

      directive.disabled.set(false);
      fixture.detectChanges();

      await userEvent.click(outsideButton);
      fixture.detectChanges();
      expect(onClickOutside).toHaveBeenCalledTimes(1);
    });
  });
});
