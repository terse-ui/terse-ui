import {Component} from '@angular/core';
import {By} from '@angular/platform-browser';
import {terse} from '@terse-ui/core/testing';
import {fireEvent, screen} from '@testing-library/angular';
import {AtomPress} from './atom-press';

describe('AtomPress', () => {
  describe('pointer press', () => {
    it('should not have data-press initially', async () => {
      await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      expect(screen.getByRole('button')).not.toHaveAttribute('data-press');
    });

    it('should set data-press on pointerdown', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button, {button: 0, pointerId: 1});
      fixture.detectChanges();

      expect(button).toHaveAttribute('data-press', '');
    });

    it('should remove data-press on pointerup', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button, {button: 0, pointerId: 1});
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-press', '');

      fireEvent.pointerUp(document);
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-press');
    });

    it('should remove data-press on pointercancel', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button, {button: 0, pointerId: 1});
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-press', '');

      fireEvent.pointerCancel(document);
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-press');
    });

    it('should ignore non-primary button presses', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button, {button: 2, pointerId: 1});
      fixture.detectChanges();

      expect(button).not.toHaveAttribute('data-press');
    });
  });

  describe('keyboard press', () => {
    it('should set data-press on Enter keydown', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, {key: 'Enter'});
      fixture.detectChanges();

      expect(button).toHaveAttribute('data-press', '');
    });

    it('should set data-press on Space keydown', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, {key: ' '});
      fixture.detectChanges();

      expect(button).toHaveAttribute('data-press', '');
    });

    it('should remove data-press on keyup', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, {key: 'Enter'});
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-press', '');

      fireEvent.keyUp(document, {key: 'Enter'});
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-press');
    });

    it('should not release on mismatched keyup', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, {key: 'Enter'});
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-press', '');

      fireEvent.keyUp(document, {key: ' '});
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-press', '');
    });

    it('should not trigger on repeat keydown', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      const button = screen.getByRole('button');
      const pressStart = vi.fn();

      fixture.debugElement
        .query(By.directive(AtomPress))
        .injector.get(AtomPress)
        .pressStart.subscribe(pressStart);

      fireEvent.keyDown(button, {key: 'Enter'});
      fireEvent.keyDown(button, {key: 'Enter', repeat: true});
      fixture.detectChanges();

      expect(pressStart).toHaveBeenCalledTimes(1);
    });

    it('should reset press on blur', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, {key: 'Enter'});
      fixture.detectChanges();
      expect(button).toHaveAttribute('data-press', '');

      fireEvent.blur(button);
      fixture.detectChanges();
      expect(button).not.toHaveAttribute('data-press');
    });

    it('should not trigger keyboard press on editable targets', async () => {
      const {fixture} = await terse(`<div atomPress><input type="text" /></div>`, {
        imports: [AtomPress],
      });

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, {key: ' '});
      fixture.detectChanges();

      const div = fixture.debugElement.query(By.directive(AtomPress)).nativeElement as HTMLElement;
      expect(div).not.toHaveAttribute('data-press');
    });
  });

  describe('disabled state', () => {
    it('should not set data-press when disabled', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      fixture.debugElement
        .query(By.directive(AtomPress))
        .injector.get(AtomPress)
        .disabled.set(true);
      fixture.detectChanges();

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button, {button: 0, pointerId: 1});
      fixture.detectChanges();

      expect(button).not.toHaveAttribute('data-press');
    });

    it('should not set data-press on keyboard when disabled', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      fixture.debugElement
        .query(By.directive(AtomPress))
        .injector.get(AtomPress)
        .disabled.set(true);
      fixture.detectChanges();

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, {key: 'Enter'});
      fixture.detectChanges();

      expect(button).not.toHaveAttribute('data-press');
    });
  });

  describe('outputs', () => {
    it('should emit pressStart and pressEnd events', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      const pressStart = vi.fn();
      const pressEnd = vi.fn();
      const atom = fixture.debugElement.query(By.directive(AtomPress)).injector.get(AtomPress);

      atom.pressStart.subscribe(pressStart);
      atom.pressEnd.subscribe(pressEnd);

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button, {button: 0, pointerId: 1});
      fixture.detectChanges();
      expect(pressStart).toHaveBeenCalledTimes(1);
      expect(pressEnd).not.toHaveBeenCalled();

      fireEvent.pointerUp(document);
      fixture.detectChanges();
      expect(pressEnd).toHaveBeenCalledTimes(1);
    });

    it('should emit pressStart and pressEnd for keyboard press', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});

      const pressStart = vi.fn();
      const pressEnd = vi.fn();
      const atom = fixture.debugElement.query(By.directive(AtomPress)).injector.get(AtomPress);

      atom.pressStart.subscribe(pressStart);
      atom.pressEnd.subscribe(pressEnd);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, {key: ' '});
      fixture.detectChanges();
      expect(pressStart).toHaveBeenCalledTimes(1);

      fireEvent.keyUp(document, {key: ' '});
      fixture.detectChanges();
      expect(pressEnd).toHaveBeenCalledTimes(1);
    });
  });

  describe('long press', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should emit longPress after delay elapses', async () => {
      @Component({
        selector: 'test-host',
        template: `<button atomPress [atomPressDelay]="500">Hold me</button>`,
        imports: [AtomPress],
      })
      class TestHost {}

      const {fixture} = await terse(TestHost);
      const longPressFn = vi.fn();
      const atom = fixture.debugElement.query(By.directive(AtomPress)).injector.get(AtomPress);
      atom.longPress.subscribe(longPressFn);

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button, {button: 0, pointerId: 1, clientX: 50, clientY: 50});
      fixture.detectChanges();

      expect(longPressFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      fixture.detectChanges();

      expect(longPressFn).toHaveBeenCalledTimes(1);
    });

    it('should not emit longPress when delay is 0 (default)', async () => {
      const {fixture} = await terse(`<button atomPress>Press me</button>`, {imports: [AtomPress]});
      const longPressFn = vi.fn();
      const atom = fixture.debugElement.query(By.directive(AtomPress)).injector.get(AtomPress);
      atom.longPress.subscribe(longPressFn);

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button, {button: 0, pointerId: 1, clientX: 50, clientY: 50});
      fixture.detectChanges();

      vi.advanceTimersByTime(1000);
      fixture.detectChanges();

      expect(longPressFn).not.toHaveBeenCalled();
    });

    it('should not emit longPress if pointer moves beyond threshold', async () => {
      @Component({
        selector: 'test-host',
        template: `<button atomPress [atomPressDelay]="500" [atomPressDistanceThreshold]="10">
          Hold me
        </button>`,
        imports: [AtomPress],
      })
      class TestHost {}

      const {fixture} = await terse(TestHost);
      const longPressFn = vi.fn();
      const atom = fixture.debugElement.query(By.directive(AtomPress)).injector.get(AtomPress);
      atom.longPress.subscribe(longPressFn);

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button, {button: 0, pointerId: 1, clientX: 50, clientY: 50});
      fixture.detectChanges();

      fireEvent.pointerMove(button, {pointerId: 1, clientX: 70, clientY: 50});
      fixture.detectChanges();

      vi.advanceTimersByTime(500);
      fixture.detectChanges();

      expect(longPressFn).not.toHaveBeenCalled();
    });

    it('should not emit longPress when disabled', async () => {
      @Component({
        selector: 'test-host',
        template: `<button atomPress [atomPressDelay]="500" [atomPressDisabled]="true">
          Hold me
        </button>`,
        imports: [AtomPress],
      })
      class TestHost {}

      const {fixture} = await terse(TestHost);
      const longPressFn = vi.fn();
      const atom = fixture.debugElement.query(By.directive(AtomPress)).injector.get(AtomPress);
      atom.longPress.subscribe(longPressFn);

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button, {button: 0, pointerId: 1, clientX: 50, clientY: 50});
      fixture.detectChanges();

      vi.advanceTimersByTime(500);
      fixture.detectChanges();

      expect(longPressFn).not.toHaveBeenCalled();
    });

    it('should cancel longPress on pointerup before delay', async () => {
      @Component({
        selector: 'test-host',
        template: `<button atomPress [atomPressDelay]="500">Hold me</button>`,
        imports: [AtomPress],
      })
      class TestHost {}

      const {fixture} = await terse(TestHost);
      const longPressFn = vi.fn();
      const atom = fixture.debugElement.query(By.directive(AtomPress)).injector.get(AtomPress);
      atom.longPress.subscribe(longPressFn);

      const button = screen.getByRole('button');
      fireEvent.pointerDown(button, {button: 0, pointerId: 1, clientX: 50, clientY: 50});
      fixture.detectChanges();

      vi.advanceTimersByTime(200);
      fireEvent.pointerUp(button);
      fixture.detectChanges();

      vi.advanceTimersByTime(300);
      fixture.detectChanges();

      expect(longPressFn).not.toHaveBeenCalled();
    });
  });
});
