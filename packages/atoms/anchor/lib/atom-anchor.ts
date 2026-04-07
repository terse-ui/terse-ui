import {Directive, inject} from '@angular/core';
import {IdGenerator} from '@terse-ui/core/internal';

export type AnchorName = InstanceType<typeof AtomAnchor>['anchorName'];

@Directive({
  selector: '[atomAnchor]',
  host: {
    '[style.anchor-name]': 'anchorName',
  },
})
export class AtomAnchor {
  readonly #generator = inject(IdGenerator);

  /**
   * The generated atom anchor name applied to the host element's `style.anchor-name` attribute.
   */
  readonly anchorName = `--${this.#generator.generate('anchor')}` as const;
}
