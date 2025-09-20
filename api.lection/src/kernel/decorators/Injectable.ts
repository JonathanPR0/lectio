import { Registry } from "@kernel/di/Registry";

type Contructor<T = any> = new (...args: any) => T;

export function Injectable(): ClassDecorator {
  return (target) => {
    Registry.getInstance().register(target as unknown as Contructor);
  };
}
