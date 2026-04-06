import type {InjectOptions, Provider} from '@angular/core';
import {inject, InjectionToken, INJECTOR} from '@angular/core';
import type {DeepPartial, MaybeFn} from '../types';
import {unwrapMergeInject} from './unwrap';

/**
 * Returns `[provideConfig, injectConfig]` for hierarchical, deep-merged
 * configuration. The default factory runs in an injection context.
 *
 * ```ts
 * const [provideBtnCfg, injectBtnCfg] = defineCfg<BtnCfg>(() => ({
 *   disabled: false,
 *   tabIndex: numberAttribute(hostAttr('tabindex') ?? 0, 0),
 * }));
 * ```
 */
export function defineCfg<C extends object>(
  defaultConfig: MaybeFn<C>,
  options?: {debugName?: string},
) {
  const debugName = options?.debugName ?? 'defineCfg';

  const configToken = new InjectionToken<C>(ngDevMode ? `Config:${debugName}` : '');

  const configContributionToken = new InjectionToken<MaybeFn<DeepPartial<C>>[]>(
    ngDevMode ? `ConfigContribution:${debugName}` : '',
  );

  function injectConfig(opts: Omit<InjectOptions, 'optional'> = {}): C {
    const contributions = inject(configContributionToken, {...opts, optional: true}) ?? [];
    return unwrapMergeInject(inject(INJECTOR), defaultConfig, ...contributions);
  }

  function provideConfig(cfg: MaybeFn<DeepPartial<C>>): Provider[] {
    return [
      {
        multi: true,
        provide: configContributionToken,
        useValue: cfg,
      },
      {
        provide: configToken,
        useFactory: injectConfig,
      },
    ];
  }

  return [provideConfig, injectConfig] as const;
}
