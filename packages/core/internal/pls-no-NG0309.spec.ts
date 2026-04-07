import {Component, Directive} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it} from 'vitest';

describe('Ensure host directive de-duplication is working (Angular 22+)', () => {
  @Directive({
    selector: '[sharedDir]',
  })
  class SharedDir {}

  @Directive({
    selector: '[dir1]',
    hostDirectives: [SharedDir],
  })
  class Dir1 {}

  @Directive({
    selector: '[dir2]',
    hostDirectives: [SharedDir],
  })
  class Dir2 {}

  @Component({
    selector: 'test-component',
    hostDirectives: [Dir1, Dir2],
    template: '<button dir1 dir2>Test</button>',
  })
  class TestComponent {}

  it('should not throw NG0309', () => {
    expect(() => {
      TestBed.createComponent(TestComponent);
    }).not.toThrow();
  });
});
