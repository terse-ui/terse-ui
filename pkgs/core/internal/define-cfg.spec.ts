import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  HostAttributeToken,
  inject,
  Injectable,
  input,
  numberAttribute,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {defineCfg} from './define-cfg';

// ---------------------------------------------------------------------------
// Realistic fixture: mirrors the Button directive pattern
// ---------------------------------------------------------------------------

interface WidgetConfig {
  disabled: boolean;
  size: number;
  role: string | null;
  variant: string;
}

const [provideWidgetConfig, injectWidgetConfig] = defineCfg<WidgetConfig>(
  () => ({
    disabled: false,
    size: numberAttribute(inject(new HostAttributeToken('size'), {optional: true}) ?? 16, 16),
    role: inject(new HostAttributeToken('role'), {optional: true}),
    variant: 'solid',
  }),
  {debugName: 'Widget'},
);

@Directive({
  selector: '[tWidget]',
  host: {
    '[attr.role]': 'roleAttr()',
    '[attr.data-size]': 'sizeAttr()',
  },
  exportAs: 'tWidget',
})
class Widget {
  readonly #config = injectWidgetConfig();

  readonly size = input(this.#config.size, {
    transform: (v: unknown) => numberAttribute(v, this.#config.size),
  });

  readonly role = input(this.#config.role);

  protected readonly roleAttr = computed(() => this.role() ?? 'button');
  protected readonly sizeAttr = computed(() => `${this.size()}`);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('defineCfg', () => {
  describe('returns [provideConfig, injectConfig]', () => {
    it('should return a tuple of two functions', () => {
      const result = defineCfg({value: 1});
      expect(result).toHaveLength(2);
      expect(typeof result[0]).toBe('function');
      expect(typeof result[1]).toBe('function');
    });
  });

  // ---- directive-level tests (realistic injection context) ----

  describe('directive with injection-context factory defaults', () => {
    it('should resolve defaults when no config is provided', () => {
      @Component({
        selector: 'test-host',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [Widget],
        template: `<div tWidget></div>`,
      })
      class TestHost {}

      const fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement.querySelector('[tWidget]');
      expect(el.getAttribute('role')).toBe('button');
      expect(el.getAttribute('data-size')).toBe('16');
    });

    it('should read host attributes through the default config factory', () => {
      @Component({
        selector: 'test-host',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [Widget],
        template: `<div tWidget role="tab" size="24"></div>`,
      })
      class TestHost {}

      const fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement.querySelector('[tWidget]');
      expect(el.getAttribute('role')).toBe('tab');
      expect(el.getAttribute('data-size')).toBe('24');
    });

    it('should coerce host attribute values via numberAttribute', () => {
      @Component({
        selector: 'test-host',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [Widget],
        template: `<div tWidget size="32"></div>`,
      })
      class TestHost {}

      const fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement.querySelector('[tWidget]');
      expect(el.getAttribute('data-size')).toBe('32');
    });
  });

  describe('provideConfig at component level (plain object)', () => {
    it('should deep merge a partial override into the default config', () => {
      @Component({
        selector: 'test-host',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [Widget],
        template: `<div tWidget></div>`,
        providers: [provideWidgetConfig({size: 48})],
      })
      class TestHost {}

      const fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement.querySelector('[tWidget]');
      expect(el.getAttribute('data-size')).toBe('48');
      expect(el.getAttribute('role')).toBe('button');
    });

    it('should override multiple fields at once', () => {
      @Component({
        selector: 'test-host',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [Widget],
        template: `<div tWidget></div>`,
        providers: [provideWidgetConfig({size: 64, variant: 'outline'})],
      })
      class TestHost {}

      const fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement.querySelector('[tWidget]');
      expect(el.getAttribute('data-size')).toBe('64');
    });
  });

  describe('provideConfig at component level (factory function)', () => {
    it('should accept a factory that returns a partial config', () => {
      @Component({
        selector: 'test-host',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [Widget],
        template: `<div tWidget></div>`,
        providers: [provideWidgetConfig(() => ({size: 20}))],
      })
      class TestHost {}

      const fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement.querySelector('[tWidget]');
      expect(el.getAttribute('data-size')).toBe('20');
    });

    it('should allow factory functions to use inject()', () => {
      @Injectable({providedIn: 'root'})
      class ThemeService {
        readonly defaultSize = 28;
      }

      @Component({
        selector: 'test-host',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [Widget],
        template: `<div tWidget></div>`,
        providers: [provideWidgetConfig(() => ({size: inject(ThemeService).defaultSize}))],
      })
      class TestHost {}

      const fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement.querySelector('[tWidget]');
      expect(el.getAttribute('data-size')).toBe('28');
    });
  });

  describe('multiple providers (multi token)', () => {
    it('should accumulate contributions from multiple provideConfig calls', () => {
      @Component({
        selector: 'test-host',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [Widget],
        template: `<div tWidget></div>`,
        providers: [provideWidgetConfig({size: 48}), provideWidgetConfig({variant: 'ghost'})],
      })
      class TestHost {}

      const fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement.querySelector('[tWidget]');
      expect(el.getAttribute('data-size')).toBe('48');
    });
  });

  describe('hierarchical DI', () => {
    it('should allow component-level providers to shadow module-level', () => {
      @Component({
        selector: 'test-host',
        changeDetection: ChangeDetectionStrategy.OnPush,
        imports: [Widget],
        template: `<div tWidget></div>`,
        providers: [provideWidgetConfig({size: 12})],
      })
      class TestHost {}

      TestBed.configureTestingModule({
        imports: [TestHost],
        providers: [provideWidgetConfig({size: 64})],
      });

      const fixture = TestBed.createComponent(TestHost);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement.querySelector('[tWidget]');
      expect(el.getAttribute('data-size')).toBe('12');
    });
  });

  // ---- service-level tests (deep merge semantics) ----

  describe('deep merge semantics', () => {
    interface SimpleConfig {
      color: string;
      count: number;
      nested: {enabled: boolean; label: string; fn: () => number};
    }

    const [provideSimple, injectSimple] = defineCfg<SimpleConfig>(
      () => ({
        color: 'red',
        count: 10,
        nested: {enabled: false, label: 'default', fn: () => 1},
      }),
      {debugName: 'Simple'},
    );

    @Injectable({providedIn: 'root'})
    class SimpleService {
      readonly config = injectSimple();
    }

    it('should return defaults when no providers are configured', () => {
      TestBed.configureTestingModule({});
      const service = TestBed.inject(SimpleService);

      expect(service.config).toEqual({
        color: 'red',
        count: 10,
        nested: {enabled: false, label: 'default', fn: expect.any(Function)},
      });
    });

    it('should deep merge a partial override', () => {
      TestBed.configureTestingModule({
        providers: [provideSimple({color: 'blue'})],
      });
      const service = TestBed.inject(SimpleService);

      expect(service.config).toEqual({
        color: 'blue',
        count: 10,
        nested: {enabled: false, label: 'default', fn: expect.any(Function)},
      });
    });

    it('should deep merge nested partial overrides', () => {
      TestBed.configureTestingModule({
        providers: [provideSimple({nested: {enabled: true}})],
      });
      const service = TestBed.inject(SimpleService);

      expect(service.config.nested).toEqual({
        enabled: true,
        label: 'default',
        fn: expect.any(Function),
      });
    });

    it('should override multiple fields at once', () => {
      TestBed.configureTestingModule({
        providers: [provideSimple({color: 'green', count: 42, nested: {label: 'custom'}})],
      });
      const service = TestBed.inject(SimpleService);

      expect(service.config).toEqual({
        color: 'green',
        count: 42,
        nested: {enabled: false, label: 'custom', fn: expect.any(Function)},
      });
    });

    it('should accept a factory function that returns a partial config', () => {
      TestBed.configureTestingModule({
        providers: [provideSimple(() => ({count: 99}))],
      });
      const service = TestBed.inject(SimpleService);

      expect(service.config.count).toBe(99);
      expect(service.config.color).toBe('red');
    });

    it('should allow factory functions to use inject()', () => {
      @Injectable({providedIn: 'root'})
      class ColorService {
        readonly color = 'purple';
      }

      TestBed.configureTestingModule({
        providers: [provideSimple(() => ({color: inject(ColorService).color}))],
      });
      const service = TestBed.inject(SimpleService);

      expect(service.config.color).toBe('purple');
    });

    it('should merge function values', () => {
      TestBed.configureTestingModule({
        providers: [provideSimple({nested: {fn: () => 2}})],
      });
      const service = TestBed.inject(SimpleService);
      expect(service.config.nested.fn()).toBe(2);
    });
  });

  describe('default config as a plain object', () => {
    it('should work with a plain object default', () => {
      const [, injectPlain] = defineCfg({x: 1, y: 'hello'}, {debugName: 'Plain'});

      @Injectable({providedIn: 'root'})
      class PlainService {
        readonly config = injectPlain();
      }

      TestBed.configureTestingModule({});
      const service = TestBed.inject(PlainService);
      expect(service.config).toEqual({x: 1, y: 'hello'});
    });
  });

  describe('default config as a factory function', () => {
    it('should accept a factory function as the default config', () => {
      const [, injectFactoryConfig] = defineCfg(() => ({value: 'from-factory'}), {
        debugName: 'Factory',
      });

      @Injectable({providedIn: 'root'})
      class FactoryService {
        readonly config = injectFactoryConfig();
      }

      TestBed.configureTestingModule({});
      const service = TestBed.inject(FactoryService);
      expect(service.config).toEqual({value: 'from-factory'});
    });
  });
});
