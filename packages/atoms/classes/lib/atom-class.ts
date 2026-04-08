import {Directive} from '@angular/core';
import {AtomClasses} from './atom-classes';

/**
 * Same as {@link AtomClasses} but the class value input is directly alias to `class` instead of `atomClasses`.
 * This exists purely for convenience.
 */
@Directive({
  selector: '[atomClass]',
  exportAs: 'atomClass',
  hostDirectives: [
    {
      directive: AtomClasses,
      inputs: ['atomClasses:class'],
    },
  ],
})
export class AtomClass {}
