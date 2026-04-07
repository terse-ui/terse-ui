import {ElementRef, inject} from '@angular/core';

/**
 * Injects the host element ref as `ElementRef<HTMLElement>`.
 */
export function injElRef<T = HTMLElement>(): ElementRef<T> {
  return inject<ElementRef<T>>(ElementRef);
}

/**
 * Injects and returns the host native `HTMLElement`.
 */
export function injEl<T = HTMLElement>(): T {
  return injElRef<T>().nativeElement;
}

export function unrefEl<T>(value: T | ElementRef<T>): T {
  return value instanceof ElementRef ? value.nativeElement : value;
}
