import type {InjectOptions, Provider} from '@angular/core';
import {inject, InjectionToken, INJECTOR} from '@angular/core';
import type {DeepPartial, MaybeFn} from '../../types';
import {unwrapMergeInject} from '../unwrap';

export type OptionsBuilderResult<Options extends object> = [
  provideOptions: (opts: MaybeFn<DeepPartial<Options>>) => Provider[],
  injectOptions: (injOpts?: Omit<InjectOptions, 'optional'>) => Options,
];

/**
 * Returns `[provideOptions, injectOptions]` for hierarchical, deep-merged
 * configuration. All contributes are resolved upon calling `injectOptions`.
 *
 * @example
 * ```ts
 * const [provideAppButtonOptions, injectAppButtonOptions] = optionsBuilder<AppButtonOptions>(() => ({
 *   disabled: false,
 *   tabIndex: numberAttribute(inject(new HostAttributeToken('tabindex'), {optional: true}) ?? 0, 0),
 * }));
 * ```
 */
export function optsBuilder<Options extends object>(
  debugName: string,
  defaultOptions: MaybeFn<Options>,
  merger?: (
    contributions: MaybeFn<DeepPartial<Options>>[],
    defaultValue: MaybeFn<Options>,
  ) => Options,
): OptionsBuilderResult<Options> {
  const optsToken = new InjectionToken<Options>(ngDevMode ? `Options:${debugName}` : '');

  const optsContributionToken = new InjectionToken<MaybeFn<DeepPartial<Options>>[]>(
    ngDevMode ? `OptionsContribution:${debugName}` : '',
  );

  function injectOptions(opts: Omit<InjectOptions, 'optional'> = {}): Options {
    const contributions = inject(optsContributionToken, {...opts, optional: true}) ?? [];
    if (merger) {
      return merger(contributions, defaultOptions);
    }
    return unwrapMergeInject(inject(INJECTOR), defaultOptions, ...contributions);
  }

  function provideOptions(opts: MaybeFn<DeepPartial<Options>>): Provider[] {
    return [
      {
        multi: true,
        provide: optsContributionToken,
        useValue: opts,
      },
      {
        provide: optsToken,
        useFactory: injectOptions,
      },
    ];
  }

  return [provideOptions, injectOptions] as const;
}
