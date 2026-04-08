import {terse} from '@terse-ui/core/testing';
import {screen} from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import {AtomRovingFocusGroup} from './atom-roving-focus-group';
import {AtomRovingFocusItem} from './atom-roving-focus-item';

const IMPORTS = [AtomRovingFocusGroup, AtomRovingFocusItem];

const TEMPLATE = `
  <ul atomRovingFocusGroup>
    <li atomRovingFocusItem>One</li>
    <li atomRovingFocusItem>Two</li>
    <li atomRovingFocusItem>Three</li>
  </ul>
`;

describe('AtomRovingFocus', () => {
  describe('tabindex management', () => {
    it('should set tabindex=0 on first item and -1 on others', async () => {
      await terse(TEMPLATE, {imports: IMPORTS});

      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveAttribute('tabindex', '0');
      expect(items[1]).toHaveAttribute('tabindex', '-1');
      expect(items[2]).toHaveAttribute('tabindex', '-1');
    });

    it('should move tabindex=0 to clicked item', async () => {
      const {fixture} = await terse(TEMPLATE, {imports: IMPORTS});

      const items = screen.getAllByRole('listitem');
      await userEvent.click(items[1]);
      fixture.detectChanges();

      expect(items[0]).toHaveAttribute('tabindex', '-1');
      expect(items[1]).toHaveAttribute('tabindex', '0');
      expect(items[2]).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('vertical navigation', () => {
    it('should navigate down with ArrowDown', async () => {
      const {fixture} = await terse(TEMPLATE, {imports: IMPORTS});

      const items = screen.getAllByRole('listitem');
      items[0].focus();
      await userEvent.keyboard('{ArrowDown}');
      fixture.detectChanges();

      expect(items[1]).toHaveAttribute('tabindex', '0');
      expect(document.activeElement).toBe(items[1]);
    });

    it('should navigate up with ArrowUp', async () => {
      const {fixture} = await terse(TEMPLATE, {imports: IMPORTS});

      const items = screen.getAllByRole('listitem');
      // Click second item to make it active
      await userEvent.click(items[1]);
      fixture.detectChanges();

      await userEvent.keyboard('{ArrowUp}');
      fixture.detectChanges();

      expect(items[0]).toHaveAttribute('tabindex', '0');
      expect(document.activeElement).toBe(items[0]);
    });

    it('should wrap from last to first', async () => {
      const {fixture} = await terse(TEMPLATE, {imports: IMPORTS});

      const items = screen.getAllByRole('listitem');
      await userEvent.click(items[2]);
      fixture.detectChanges();

      await userEvent.keyboard('{ArrowDown}');
      fixture.detectChanges();

      expect(items[0]).toHaveAttribute('tabindex', '0');
      expect(document.activeElement).toBe(items[0]);
    });

    it('should wrap from first to last', async () => {
      const {fixture} = await terse(TEMPLATE, {imports: IMPORTS});

      const items = screen.getAllByRole('listitem');
      items[0].focus();
      await userEvent.keyboard('{ArrowUp}');
      fixture.detectChanges();

      expect(items[2]).toHaveAttribute('tabindex', '0');
      expect(document.activeElement).toBe(items[2]);
    });

    it('should not respond to ArrowLeft/Right in vertical mode', async () => {
      const {fixture} = await terse(TEMPLATE, {imports: IMPORTS});

      const items = screen.getAllByRole('listitem');
      items[0].focus();
      await userEvent.keyboard('{ArrowRight}');
      fixture.detectChanges();

      expect(items[0]).toHaveAttribute('tabindex', '0');
    });
  });

  describe('horizontal navigation', () => {
    const HORIZONTAL = `
      <ul atomRovingFocusGroup atomRovingFocusGroupOrientation="horizontal">
        <li atomRovingFocusItem>A</li>
        <li atomRovingFocusItem>B</li>
        <li atomRovingFocusItem>C</li>
      </ul>
    `;

    it('should navigate right with ArrowRight', async () => {
      const {fixture} = await terse(HORIZONTAL, {imports: IMPORTS});

      const items = screen.getAllByRole('listitem');
      items[0].focus();
      await userEvent.keyboard('{ArrowRight}');
      fixture.detectChanges();

      expect(items[1]).toHaveAttribute('tabindex', '0');
      expect(document.activeElement).toBe(items[1]);
    });

    it('should navigate left with ArrowLeft', async () => {
      const {fixture} = await terse(HORIZONTAL, {imports: IMPORTS});

      const items = screen.getAllByRole('listitem');
      await userEvent.click(items[1]);
      fixture.detectChanges();

      await userEvent.keyboard('{ArrowLeft}');
      fixture.detectChanges();

      expect(items[0]).toHaveAttribute('tabindex', '0');
    });

    it('should not respond to ArrowUp/Down in horizontal mode', async () => {
      const {fixture} = await terse(HORIZONTAL, {imports: IMPORTS});

      const items = screen.getAllByRole('listitem');
      items[0].focus();
      await userEvent.keyboard('{ArrowDown}');
      fixture.detectChanges();

      expect(items[0]).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Home and End', () => {
    it('should navigate to first item with Home', async () => {
      const {fixture} = await terse(TEMPLATE, {imports: IMPORTS});

      const items = screen.getAllByRole('listitem');
      await userEvent.click(items[2]);
      fixture.detectChanges();

      await userEvent.keyboard('{Home}');
      fixture.detectChanges();

      expect(items[0]).toHaveAttribute('tabindex', '0');
      expect(document.activeElement).toBe(items[0]);
    });

    it('should navigate to last item with End', async () => {
      const {fixture} = await terse(TEMPLATE, {imports: IMPORTS});

      const items = screen.getAllByRole('listitem');
      items[0].focus();
      await userEvent.keyboard('{End}');
      fixture.detectChanges();

      expect(items[2]).toHaveAttribute('tabindex', '0');
      expect(document.activeElement).toBe(items[2]);
    });
  });

  describe('disabled items', () => {
    it('should skip disabled items during navigation', async () => {
      const {fixture} = await terse(
        `
        <ul atomRovingFocusGroup>
          <li atomRovingFocusItem>One</li>
          <li atomRovingFocusItem [atomRovingFocusItemDisabled]="true">Two</li>
          <li atomRovingFocusItem>Three</li>
        </ul>
      `,
        {imports: IMPORTS},
      );

      const items = screen.getAllByRole('listitem');
      items[0].focus();
      await userEvent.keyboard('{ArrowDown}');
      fixture.detectChanges();

      // Should skip "Two" and land on "Three"
      expect(items[2]).toHaveAttribute('tabindex', '0');
      expect(document.activeElement).toBe(items[2]);
    });

    it('should not activate on click when disabled', async () => {
      const {fixture} = await terse(
        `
        <ul atomRovingFocusGroup>
          <li atomRovingFocusItem>One</li>
          <li atomRovingFocusItem [atomRovingFocusItemDisabled]="true">Two</li>
        </ul>
      `,
        {imports: IMPORTS},
      );

      const items = screen.getAllByRole('listitem');
      await userEvent.click(items[1]);
      fixture.detectChanges();

      expect(items[0]).toHaveAttribute('tabindex', '0');
    });
  });

  describe('disabled group', () => {
    it('should not navigate when group is disabled', async () => {
      const {fixture} = await terse(
        `
        <ul atomRovingFocusGroup [atomRovingFocusGroupDisabled]="true">
          <li atomRovingFocusItem>One</li>
          <li atomRovingFocusItem>Two</li>
        </ul>
      `,
        {imports: IMPORTS},
      );

      const items = screen.getAllByRole('listitem');
      items[0].focus();
      await userEvent.keyboard('{ArrowDown}');
      fixture.detectChanges();

      expect(items[0]).toHaveAttribute('tabindex', '0');
    });
  });

  describe('wrap disabled', () => {
    it('should not wrap when wrap is false', async () => {
      const {fixture} = await terse(
        `
        <ul atomRovingFocusGroup [atomRovingFocusGroupWrap]="false">
          <li atomRovingFocusItem>One</li>
          <li atomRovingFocusItem>Two</li>
        </ul>
      `,
        {imports: IMPORTS},
      );

      const items = screen.getAllByRole('listitem');
      await userEvent.click(items[1]);
      fixture.detectChanges();

      await userEvent.keyboard('{ArrowDown}');
      fixture.detectChanges();

      // Should stay on last item
      expect(items[1]).toHaveAttribute('tabindex', '0');
    });
  });
});
