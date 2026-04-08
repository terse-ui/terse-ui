import type {Type} from '@angular/core';
import type {ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  render,
  type RenderComponentOptions,
  type RenderResult,
  type RenderTemplateOptions,
} from '@testing-library/angular';

export type TerseDirQueries = {
  query<T>(type: Type<T>): T;
  queryAll<T>(type: Type<T>): T[];
};

export function terse<C>(
  component: Type<C>,
  renderOptions?: RenderComponentOptions<C>,
): Promise<
  RenderResult<C, C> & {
    fixture: ComponentFixture<C> & TerseDirQueries;
  }
>;
export function terse<W>(
  template: string,
  renderOptions?: RenderTemplateOptions<W>,
): Promise<
  RenderResult<W> & {
    fixture: ComponentFixture<W> & TerseDirQueries;
  }
>;
export async function terse<T>(...args: unknown[]) {
  const result = await render<T>(...(args as Parameters<typeof render<T>>));

  Object.assign(result.fixture, {
    query<D>(type: Type<D>): D {
      return result.fixture.debugElement.query(By.directive(type)).injector.get(type);
    },
    queryAll<D>(type: Type<D>): D[] {
      return result.fixture.debugElement
        .queryAll(By.directive(type))
        .map((de) => de.injector.get(type));
    },
  } satisfies TerseDirQueries);

  return result;
}
