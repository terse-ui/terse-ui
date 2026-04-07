import {Component, ElementRef, inject, signal, viewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {on, setupSync} from './index';

describe('on', () => {
  describe('with reactive target (signal query)', () => {
    @Component({
      template: '<button #btn>Click me</button>',
    })
    class TestComponent {
      readonly btn = viewChild<ElementRef>('btn');

      clickCount = 0;

      constructor() {
        on(this.btn, 'click', () => {
          this.clickCount++;
        });
      }
    }

    function createComponent() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      return {
        cmp: fixture.componentInstance,
        target: fixture.nativeElement.querySelector('button'),
      };
    }

    it('should attach event on', () => {
      const {cmp, target} = createComponent();

      target.click();

      expect(cmp.clickCount).toBe(1);
    });

    it('should handle multiple events', () => {
      const {cmp, target} = createComponent();

      target.click();
      target.click();
      target.click();

      expect(cmp.clickCount).toBe(3);
    });
  });

  describe('with non-reactive target (ElementRef)', () => {
    @Component({
      template: '<button>Click me</button>',
    })
    class TestComponent {
      readonly elementRef = inject(ElementRef);
      clickCount = 0;

      constructor() {
        on(this.elementRef, 'click', () => {
          this.clickCount++;
        });
      }
    }

    function createComponent() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {cmp: fixture.componentInstance, hostEl: fixture.nativeElement};
    }

    it('should attach event on to host element', () => {
      const {cmp, hostEl} = createComponent();

      hostEl.click();

      expect(cmp.clickCount).toBe(1);
    });
  });

  describe('with window target (global object)', () => {
    @Component({template: ''})
    class TestComponent {
      resizeCount = 0;

      constructor() {
        setupSync(() => {
          on(window, 'resize', () => {
            this.resizeCount++;
          });
        });
      }
    }

    function createComponent() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {cmp: fixture.componentInstance};
    }

    it('should attach event on to window', () => {
      const {cmp} = createComponent();

      window.dispatchEvent(new Event('resize'));

      expect(cmp.resizeCount).toBe(1);
    });
  });

  describe('with document target (global object)', () => {
    @Component({
      template: '',
    })
    class TestComponent {
      clickCount = 0;

      constructor() {
        setupSync(() => {
          on(document, 'click', () => {
            this.clickCount++;
          });
        });
      }
    }

    function createComponent() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {cmp: fixture.componentInstance};
    }

    it('should attach event on to document', () => {
      const {cmp} = createComponent();

      document.dispatchEvent(new MouseEvent('click'));

      expect(cmp.clickCount).toBe(1);
    });
  });

  describe('modifiers', () => {
    describe('capture', () => {
      @Component({
        template: '<div #parent><button #child>Click</button></div>',
      })
      class TestComponent {
        readonly parent = viewChild<ElementRef>('parent');
        readonly child = viewChild<ElementRef>('child');
        events: string[] = [];

        constructor() {
          on.capture(this.parent, 'click', () => {
            this.events.push('parent-capture');
          });
          on(this.child, 'click', () => {
            this.events.push('child');
          });
        }
      }

      function createComponent() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {
          cmp: fixture.componentInstance,
          childEl: fixture.nativeElement.querySelector('button'),
        };
      }

      it('should execute capture on first', () => {
        const {cmp, childEl} = createComponent();

        childEl.click();

        expect(cmp.events).toEqual(['parent-capture', 'child']);
      });
    });

    describe('prevent', () => {
      @Component({
        template: '<a #link href="#test">Link</a>',
      })
      class TestComponent {
        readonly link = viewChild<ElementRef>('link');
        defaultPrevented = false;

        constructor() {
          on.prevent(this.link, 'click', (e) => {
            this.defaultPrevented = e.defaultPrevented;
          });
        }
      }

      function createComponent() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {cmp: fixture.componentInstance, linkEl: fixture.nativeElement.querySelector('a')};
      }

      it('should prevent default action', () => {
        const {cmp, linkEl} = createComponent();

        linkEl.click();

        expect(cmp.defaultPrevented).toBe(true);
      });
    });

    describe('stop', () => {
      @Component({
        template: '<div #parent><button #child>Click</button></div>',
      })
      class TestComponent {
        readonly parent = viewChild<ElementRef>('parent');
        readonly child = viewChild<ElementRef>('child');

        parentClicked = false;

        constructor() {
          on.stop(this.child, 'click', () => {
            /* empty */
          });
          on(this.parent, 'click', () => {
            this.parentClicked = true;
          });
        }
      }

      function createComponent() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {
          cmp: fixture.componentInstance,
          childEl: fixture.nativeElement.querySelector('button'),
        };
      }

      it('should stop event propagation', () => {
        const {cmp, childEl} = createComponent();

        childEl.click();

        expect(cmp.parentClicked).toBe(false);
      });
    });

    describe('self', () => {
      @Component({
        template: '<div #parent><button #child>Click</button></div>',
      })
      class TestComponent {
        readonly parent = viewChild<ElementRef>('parent');
        parentClickCount = 0;

        constructor() {
          on.self(this.parent, 'click', () => {
            this.parentClickCount++;
          });
        }
      }

      function createComponent() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {
          cmp: fixture.componentInstance,
          parentEl: fixture.nativeElement.querySelector('div'),
          childEl: fixture.nativeElement.querySelector('button'),
        };
      }

      it('should only trigger when event.target is element itself', () => {
        const {cmp, parentEl, childEl} = createComponent();

        childEl.click();
        expect(cmp.parentClickCount).toBe(0);

        parentEl.click();
        expect(cmp.parentClickCount).toBe(1);
      });
    });

    describe('combined modifiers', () => {
      @Component({
        template: '<div #parent><a #link href="#test">Link</a></div>',
      })
      class TestComponent {
        readonly link = viewChild<ElementRef>('link');
        readonly parent = viewChild<ElementRef>('parent');
        linkClicked = false;
        parentClicked = false;

        constructor() {
          on.prevent.stop(this.link, 'click', () => {
            this.linkClicked = true;
          });
          on(this.parent, 'click', () => {
            this.parentClicked = true;
          });
        }
      }

      function createComponent() {
        const fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        return {cmp: fixture.componentInstance, linkEl: fixture.nativeElement.querySelector('a')};
      }

      it('should apply multiple modifiers', () => {
        const {cmp, linkEl} = createComponent();

        const clickEvent = new MouseEvent('click', {bubbles: true, cancelable: true});
        linkEl.dispatchEvent(clickEvent);

        expect(cmp.linkClicked).toBe(true);
        expect(cmp.parentClicked).toBe(false);
        expect(clickEvent.defaultPrevented).toBe(true);
      });
    });
  });

  describe('reactive event name', () => {
    @Component({
      template: '<button #btn>Button</button>',
    })
    class TestComponent {
      readonly btn = viewChild<ElementRef>('btn');
      readonly eventName = signal<'click' | 'dblclick'>('click');
      eventCount = 0;

      constructor() {
        on(this.btn, this.eventName, () => {
          this.eventCount++;
        });
      }
    }

    function createComponent() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {
        cmp: fixture.componentInstance,
        childEl: fixture.nativeElement.querySelector('button'),
      };
    }

    it('should update on when event name changes', () => {
      const {cmp, childEl} = createComponent();

      childEl.click();
      expect(cmp.eventCount).toBe(1);

      cmp.eventName.set('dblclick');
      TestBed.tick();
      childEl.click();

      expect(cmp.eventCount).toBe(1);

      childEl.dispatchEvent(new MouseEvent('dblclick'));

      expect(cmp.eventCount).toBe(2);
    });
  });

  describe('destroy', () => {
    @Component({
      template: '<button #btn>Click me</button>',
    })
    class TestComponent {
      readonly btn = viewChild<ElementRef>('btn');
      clickCount = 0;
      ref = on(this.btn, 'click', () => {
        this.clickCount++;
      });
    }

    function createComponent() {
      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      return {
        cmp: fixture.componentInstance,
        childEl: fixture.nativeElement.querySelector('button'),
      };
    }

    it('should remove on when destroyed', () => {
      const {cmp, childEl} = createComponent();

      childEl.click();
      expect(cmp.clickCount).toBe(1);

      cmp.ref.destroy();
      childEl.click();
      expect(cmp.clickCount).toBe(1);
    });
  });
});
