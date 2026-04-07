/** Extracted documentation for a single directive. */
export interface DirectiveDoc {
  name: string;
  selector: string;
  exportAs: string[];
  description: string;
  inputs: InputDoc[];
  outputs: OutputDoc[];
  properties: PropertyDoc[];
  hostBindings: HostBindingDoc[];
}

export interface InputDoc {
  name: string;
  alias: string;
  type: string;
  description: string;
  isRequired: boolean;
  default?: string;
}

export interface OutputDoc {
  name: string;
  alias: string;
  type: string;
  description: string;
}

export interface PropertyDoc {
  name: string;
  type: string;
  description: string;
  isReadonly: boolean;
}

export interface HostBindingDoc {
  binding: string;
  expression: string;
  category: 'data-attribute' | 'aria' | 'style' | 'class' | 'property' | 'event';
}

/** Per-entry-point extracted data. */
export interface EntryPointDoc {
  entryPoint: string;
  packageName: string;
  directives: DirectiveDoc[];
}
