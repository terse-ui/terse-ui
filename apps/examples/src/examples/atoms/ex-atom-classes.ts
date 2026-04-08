import {Component, inject, model} from '@angular/core';
import {AtomClasses} from '@terse-ui/atoms/classes';
import {ProtoButton} from '@terse-ui/protos/button';

@Component({
  selector: 'ex-atom-classes-comp',
  hostDirectives: [
    {
      directive: AtomClasses,
      inputs: ['atomClasses:class'],
    },
  ],
  template: 'Ex Content',
  styles: `
    :host.blue {
      background-color: blue;
      color: white;
    }
    :host:hover {
      background-color: red;
    }
  `,
})
export class ExAtomClassesComp {
  readonly #classes = inject(AtomClasses);
  readonly blue = model(false);

  constructor() {
    this.#classes.pre(() => [this.blue() && 'blue']);
  }
}

@Component({
  selector: 'ex-atom-classes',
  imports: [ExAtomClassesComp, ProtoButton],
  template: `
    <div>
      <ex-atom-classes-comp #comp />
    </div>

    <div [class]="{'hover': comp.blue()}">
      <button protoButton (click)="comp.blue.set(!comp.blue())">Toggle Blue</button>
    </div>
  `,
})
export class ExAtomClasses {}
