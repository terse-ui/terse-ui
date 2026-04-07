import type {Type} from '@angular/core';
import type {ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {render, type RenderResult} from '@testing-library/angular';

type DirectiveQueries = {
  query<T>(type: Type<T>): T;
  queryAll<T>(type: Type<T>): T[];
};

type TerseResult<T = unknown> = RenderResult<T> & {
  fixture: ComponentFixture<T> & DirectiveQueries;
};

export async function terse<T>(...args: Parameters<typeof render<T>>): Promise<TerseResult<T>> {
  const result = await render<T>(...args);

  Object.assign(result.fixture, {
    query<D>(type: Type<D>): D {
      return result.fixture.debugElement.query(By.directive(type)).injector.get(type);
    },
    queryAll<D>(type: Type<D>): D[] {
      return result.fixture.debugElement
        .queryAll(By.directive(type))
        .map((de) => de.injector.get(type));
    },
  } satisfies DirectiveQueries);

  return result as TerseResult<T>;
}
