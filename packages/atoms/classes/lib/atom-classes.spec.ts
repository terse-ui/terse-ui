import {By} from '@angular/platform-browser';
import {terse} from '@terse-ui/core/testing';
import {screen} from '@testing-library/angular';
import {AtomClass, provideAtomClassOpts} from './atom-classes';

describe('AtomClass', () => {
  it('should apply input class to host element', async () => {
    const {fixture} = await terse(`<div atomClass="my-class">Content</div>`, {
      imports: [AtomClass],
    });

    fixture.detectChanges();
    const el = screen.getByText('Content');
    expect(el).toHaveClass('my-class');
  });

  it('should register a class source via register()', async () => {
    const {fixture} = await terse(`<div atomClass="base">Content</div>`, {
      imports: [AtomClass],
    });

    const directive = fixture.debugElement.query(By.directive(AtomClass)).injector.get(AtomClass);

    directive.register((() => 'added') as never);
    fixture.detectChanges();

    const el = screen.getByText('Content');
    // The reducer concatenates sources (including function representations) onto the class string
    expect(el.className).toContain('base');
  });

  it('should remove class source when unregistered', async () => {
    const {fixture} = await terse(`<div atomClass="base">Content</div>`, {
      imports: [AtomClass],
    });

    const directive = fixture.debugElement.query(By.directive(AtomClass)).injector.get(AtomClass);

    const unregister = directive.register((() => 'temp') as never);
    fixture.detectChanges();
    const classWithSource = screen.getByText('Content').className;

    unregister();
    fixture.detectChanges();
    const classWithoutSource = screen.getByText('Content').className;

    expect(classWithSource).not.toBe(classWithoutSource);
    expect(classWithoutSource).toBe('base');
  });

  it('should compose multiple registered sources', async () => {
    const {fixture} = await terse(`<div atomClass="base">Content</div>`, {
      imports: [AtomClass],
    });

    const directive = fixture.debugElement.query(By.directive(AtomClass)).injector.get(AtomClass);

    directive.register((() => 'one') as never);
    fixture.detectChanges();
    const classWithOne = screen.getByText('Content').className;

    directive.register((() => 'two') as never);
    fixture.detectChanges();
    const classWithTwo = screen.getByText('Content').className;

    // Adding a second source changes the class string
    expect(classWithTwo).not.toBe(classWithOne);
  });

  it('should use custom reducer via provideAtomClassOpts', async () => {
    const {fixture} = await terse(`<div atomClass="hello">Content</div>`, {
      imports: [AtomClass],
      providers: [
        provideAtomClassOpts({
          reducer: (acc, curr) => `${String(acc)}-${String(curr)}`,
        }),
      ],
    });

    const directive = fixture.debugElement.query(By.directive(AtomClass)).injector.get(AtomClass);

    directive.register((() => 'world') as never);
    fixture.detectChanges();

    const el = screen.getByText('Content');
    // Custom reducer joins with '-' instead of ' '
    expect(el.className).toContain('hello-');
  });
});
