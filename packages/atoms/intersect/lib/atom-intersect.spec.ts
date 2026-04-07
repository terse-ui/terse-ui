import {terse} from '@terse-ui/core/testing';
import {screen} from '@testing-library/angular';
import {AtomIntersect} from './atom-intersect';

type ObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void;

let observerCallback: ObserverCallback;
let observerInstance: {
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  root: null;
  rootMargin: string;
  thresholds: number[];
  takeRecords: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  global.IntersectionObserver = vi.fn(function (
    this: IntersectionObserver,
    callback: ObserverCallback,
  ) {
    observerCallback = callback;
    observerInstance = {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: '0px',
      thresholds: [0],
      takeRecords: vi.fn().mockReturnValue([]),
    };
    return observerInstance;
  }) as unknown as typeof IntersectionObserver;
});

function triggerIntersection(isIntersecting: boolean): IntersectionObserverEntry {
  const entry = {
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: {} as DOMRectReadOnly,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
    target: document.createElement('div'),
    time: Date.now(),
  } as IntersectionObserverEntry;

  observerCallback([entry], observerInstance as unknown as IntersectionObserver);
  return entry;
}

describe('AtomIntersect', () => {
  it('should create an IntersectionObserver and observe the host element', async () => {
    await terse(`<div atomIntersect>Content</div>`, {
      imports: [AtomIntersect],
    });

    expect(global.IntersectionObserver).toHaveBeenCalledOnce();
    expect(observerInstance.observe).toHaveBeenCalledOnce();
    expect(observerInstance.observe).toHaveBeenCalledWith(screen.getByText('Content'));
  });

  it('should set data-intersecting when entry.isIntersecting is true', async () => {
    const {fixture} = await terse(`<div atomIntersect>Content</div>`, {
      imports: [AtomIntersect],
    });

    triggerIntersection(true);
    fixture.detectChanges();

    expect(screen.getByText('Content')).toHaveAttribute('data-intersecting', '');
  });

  it('should remove data-intersecting when entry.isIntersecting is false', async () => {
    const {fixture} = await terse(`<div atomIntersect>Content</div>`, {
      imports: [AtomIntersect],
    });

    triggerIntersection(true);
    fixture.detectChanges();
    expect(screen.getByText('Content')).toHaveAttribute('data-intersecting', '');

    triggerIntersection(false);
    fixture.detectChanges();
    expect(screen.getByText('Content')).not.toHaveAttribute('data-intersecting');
  });

  it('should emit intersect output with the entry', async () => {
    const emitSpy = vi.fn();
    const {fixture} = await terse(
      `<div atomIntersect (atomIntersect)="onIntersect($event)">Content</div>`,
      {
        imports: [AtomIntersect],
        componentProperties: {onIntersect: emitSpy},
      },
    );

    const entry = triggerIntersection(true);
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledOnce();
    expect(emitSpy).toHaveBeenCalledWith(entry);
  });

  it('should not emit when disabled', async () => {
    const emitSpy = vi.fn();
    const {fixture} = await terse(
      `<div atomIntersect [atomIntersectDisabled]="true" (atomIntersect)="onIntersect($event)">Content</div>`,
      {
        imports: [AtomIntersect],
        componentProperties: {onIntersect: emitSpy},
      },
    );

    triggerIntersection(true);
    fixture.detectChanges();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Content')).not.toHaveAttribute('data-intersecting');
  });

  it('should disconnect observer on destroy', async () => {
    const {fixture} = await terse(`<div atomIntersect>Content</div>`, {
      imports: [AtomIntersect],
    });

    fixture.destroy();

    expect(observerInstance.disconnect).toHaveBeenCalledOnce();
  });
});
