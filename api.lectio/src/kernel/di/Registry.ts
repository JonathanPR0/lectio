type Contructor<T = any> = new (...args: any) => T;

export class Registry {
  private static instance: Registry | undefined;
  static getInstance() {
    if (!this.instance) {
      this.instance = new Registry();
    }
    return this.instance;
  }
  private constructor() {}
  private readonly providers = new Map<string, Registry.Provider>();

  register(impl: Contructor) {
    const token = impl.name;
    if (this.providers.has(token)) {
      throw new Error(`Service ${token} already registered.`);
    }

    const deps = Reflect.getMetadata("design:paramtypes", impl) || [];

    this.providers.set(token, { impl, deps });
  }

  resolve<TImpl extends Contructor>(impl: TImpl): InstanceType<TImpl> {
    const token = impl.name;
    const provider = this.providers.get(token);
    if (!provider) {
      throw new Error(`Service ${token} not registered.`);
    }
    const deps = provider.deps.map((dep: Contructor) => this.resolve(dep));
    const instance = new provider.impl(...deps) as InstanceType<TImpl>;
    return instance;
  }
}

export namespace Registry {
  export type Provider = {
    impl: Contructor;
    deps: Contructor[];
  };
}
