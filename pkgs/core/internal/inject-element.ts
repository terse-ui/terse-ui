import {ElementRef, inject} from '@angular/core';

/**
 * Injects the host element ref as `ElementRef<HTMLElement>`.
 */
export function injectElementRef<T = HTMLElement>(): ElementRef<T> {
  return inject<ElementRef<T>>(ElementRef);
}

/**
 * Injects and returns the host native `HTMLElement`.
 */
export function injectElement<T = HTMLElement>(): T {
  return injectElementRef<T>().nativeElement;
}

/**
 * Normalizes an `HTMLElement` or `ElementRef` to `HTMLElement`.
 */
export function unrefElement<T = HTMLElement>(value: T | ElementRef<T>): T;
export function unrefElement<T = HTMLElement>(
  value: T | null | undefined | ElementRef<T>,
): T | null | undefined;
export function unrefElement<T = HTMLElement>(value: T | ElementRef<T>): T {
  return value instanceof ElementRef ? value.nativeElement : value;
}
