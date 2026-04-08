import {Component, Directive, signal} from '@angular/core';
import {By} from '@angular/platform-browser';
import {terse} from '@terse-ui/core/testing';
import {screen} from '@testing-library/angular';
import {AtomClass} from './atom-class';
import {AtomClasses} from './atom-classes';

describe('AtomClasses', () => {
  it('should apply input class to host element', async () => {
    await terse(`<div atomClasses="my-class">Content</div>`, {
      imports: [AtomClasses],
    });

    expect(screen.getByText('Content')).toHaveClass('my-class');
  });

  it('should return empty string when no classes are provided', async () => {
    await terse(`<div atomClasses>Content</div>`, {
      imports: [AtomClasses],
    });

    const el = screen.getByText('Content');
    expect(el.className).toBe('');
  });

  describe('pre()', () => {
    it('should apply pre source before base class', async () => {
      const {fixture} = await terse(`<div atomClasses="base">Content</div>`, {
        imports: [AtomClasses],
      });

      const directive = fixture.debugElement
        .query(By.directive(AtomClasses))
        .injector.get(AtomClasses);

      directive.pre(() => 'added');
      fixture.detectChanges();

      const el = screen.getByText('Content');
      expect(el).toHaveClass('added');
      expect(el).toHaveClass('base');
    });

    it('should give later registrations higher precedence', async () => {
      const {fixture} = await terse(`<div atomClasses="base">Content</div>`, {
        imports: [AtomClasses],
      });

      const directive = fixture.debugElement
        .query(By.directive(AtomClasses))
        .injector.get(AtomClasses);

      directive.pre(() => 'first');
      directive.pre(() => 'second');
      fixture.detectChanges();

      // Both are applied; "second" was registered later so it appears after "first"
      const classes = screen.getByText('Content').className;
      expect(classes.indexOf('first')).toBeLessThan(classes.indexOf('second'));
    });

    it('should remove class source when unregistered', async () => {
      const {fixture} = await terse(`<div atomClasses="base">Content</div>`, {
        imports: [AtomClasses],
      });

      const directive = fixture.debugElement
        .query(By.directive(AtomClasses))
        .injector.get(AtomClasses);

      const unregister = directive.pre(() => 'temp');
      fixture.detectChanges();
      expect(screen.getByText('Content')).toHaveClass('temp');

      unregister();
      fixture.detectChanges();

      const el = screen.getByText('Content');
      expect(el.className).toBe('base');
    });

    it('should re-evaluate when signals inside the source change', async () => {
      const {fixture} = await terse(`<div atomClasses="base">Content</div>`, {
        imports: [AtomClasses],
      });

      const directive = fixture.debugElement
        .query(By.directive(AtomClasses))
        .injector.get(AtomClasses);

      const dynamicClass = signal('alpha');
      directive.pre(() => dynamicClass());
      fixture.detectChanges();

      expect(screen.getByText('Content')).toHaveClass('alpha');

      dynamicClass.set('beta');
      fixture.detectChanges();

      const el = screen.getByText('Content');
      expect(el).toHaveClass('beta');
      expect(el).not.toHaveClass('alpha');
    });
  });

  describe('post()', () => {
    it('should apply post source after base class', async () => {
      const {fixture} = await terse(`<div atomClasses="base">Content</div>`, {
        imports: [AtomClasses],
      });

      const directive = fixture.debugElement
        .query(By.directive(AtomClasses))
        .injector.get(AtomClasses);

      directive.post(() => 'after');
      fixture.detectChanges();

      const el = screen.getByText('Content');
      expect(el).toHaveClass('after');
      expect(el).toHaveClass('base');
    });

    it('should remove class source when unregistered', async () => {
      const {fixture} = await terse(`<div atomClasses="base">Content</div>`, {
        imports: [AtomClasses],
      });

      const directive = fixture.debugElement
        .query(By.directive(AtomClasses))
        .injector.get(AtomClasses);

      const unregister = directive.post(() => 'temp');
      fixture.detectChanges();
      expect(screen.getByText('Content')).toHaveClass('temp');

      unregister();
      fixture.detectChanges();

      expect(screen.getByText('Content').className).toBe('base');
    });

    it('should re-evaluate when signals inside the source change', async () => {
      const {fixture} = await terse(`<div atomClasses="base">Content</div>`, {
        imports: [AtomClasses],
      });

      const directive = fixture.debugElement
        .query(By.directive(AtomClasses))
        .injector.get(AtomClasses);

      const dynamicClass = signal('one');
      directive.post(() => dynamicClass());
      fixture.detectChanges();

      expect(screen.getByText('Content')).toHaveClass('one');

      dynamicClass.set('two');
      fixture.detectChanges();

      const el = screen.getByText('Content');
      expect(el).toHaveClass('two');
      expect(el).not.toHaveClass('one');
    });
  });

  describe('pre + post combined', () => {
    it('should apply all pre, base, and post classes', async () => {
      const {fixture} = await terse(`<div atomClasses="base">Content</div>`, {
        imports: [AtomClasses],
      });

      const directive = fixture.debugElement
        .query(By.directive(AtomClasses))
        .injector.get(AtomClasses);

      directive.pre(() => 'before');
      directive.post(() => 'after');
      fixture.detectChanges();

      const el = screen.getByText('Content');
      expect(el).toHaveClass('before');
      expect(el).toHaveClass('base');
      expect(el).toHaveClass('after');
    });
  });
});

describe('AtomClass', () => {
  it('should apply class input via host directive alias', async () => {
    await terse(`<div class="my-class" atomClass>Content</div>`, {
      imports: [AtomClass],
    });

    expect(screen.getByText('Content')).toHaveClass('my-class');
  });
});

describe('AtomClasses as host directive', () => {
  @Directive({
    selector: '[testDirective]',
    hostDirectives: [
      {
        directive: AtomClasses,
        inputs: ['atomClasses'],
      },
    ],
  })
  class TestDirective {}

  it('should work when composed as a host directive', async () => {
    await terse(`<div testDirective atomClasses="composed">Content</div>`, {
      imports: [TestDirective],
    });

    expect(screen.getByText('Content')).toHaveClass('composed');
  });

  @Component({
    selector: 'test-cmp',
    hostDirectives: [
      {
        directive: AtomClasses,
        inputs: ['atomClasses'],
      },
    ],
    template: `<ng-content />`,
  })
  class TestComponent {}

  it('should work when composed on a component', async () => {
    await terse(`<test-cmp atomClasses="on-component">Content</test-cmp>`, {
      imports: [TestComponent],
    });

    expect(screen.getByText('Content').closest('test-cmp')).toHaveClass('on-component');
  });
});
