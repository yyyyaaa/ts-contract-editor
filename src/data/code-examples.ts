export const codeExamples = [
  {
    id: 1,
    name: "Generic Type Constraints and Conditional Types",
    code: `type IsArray<T> = T extends any[] ? true : false;

interface HasLength {
  length: number;
}

function ensureMinLength<T extends HasLength>(
  value: T,
  minLength: number
): T extends any[] ? T : string {
  if (value.length >= minLength) {
    return value as any;
  }
  
  if (Array.isArray(value)) {
    return [...value, ...Array(minLength - value.length).fill(undefined)] as any;
  }
  
  return value.toString().padEnd(minLength) as any;
}

const arr = ensureMinLength([1, 2], 4); // [1, 2, undefined, undefined]
const str = ensureMinLength("hello", 8); // "hello   "`,
  },
  {
    id: 2,
    name: "Mapped Types with Template Literals",
    code: `type EventName = 'click' | 'focus' | 'blur';
type Handler<T> = (event: T) => void;

type EventMap<T extends string> = {
  [K in T as \`on\${Capitalize<K>}\`]: Handler<{
    type: K;
    timestamp: number;
    target: HTMLElement;
  }>;
}

type UIEvents = EventMap<EventName>;

const handlers: UIEvents = {
  onClick: (event) => console.log(event.timestamp),
  onFocus: (event) => console.log(event.target),
  onBlur: (event) => console.log(event.type),
};`,
  },
  {
    id: 3,
    name: "Recursive Type with Deep Partial",
    code: `type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

interface NestedConfig {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
      tokens: string[];
    };
  };
  features: {
    cache: boolean;
    compression: {
      enabled: boolean;
      level: 1 | 2 | 3;
    };
  };
}

function updateConfig(
  config: NestedConfig,
  patch: DeepPartial<NestedConfig>
): NestedConfig {
  return deepMerge(config, patch);
}

function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  if (typeof source !== 'object' || source === null) {
    return source as T;
  }

  const output = { ...target } as any;
  
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
}`,
  },
  {
    id: 4,
    name: "Discriminated Unions with Type Predicates",
    code: `type Success<T> = {
  type: 'success';
  data: T;
  metadata: {
    timestamp: number;
    source: string;
  };
};

type Error = {
  type: 'error';
  error: {
    code: number;
    message: string;
    stack?: string;
  };
};

type Result<T> = Success<T> | Error;

function isSuccess<T>(result: Result<T>): result is Success<T> {
  return result.type === 'success';
}

function processResult<T>(result: Result<T>): T | null {
  if (isSuccess(result)) {
    console.log(\`Data from \${result.metadata.source}\`);
    return result.data;
  } else {
    console.error(\`Error \${result.error.code}: \${result.error.message}\`);
    return null;
  }
}`,
  },
  {
    id: 5,
    name: "Utility Types and Function Overloads",
    code: `type Primitive = string | number | boolean;
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends Primitive
    ? T[P]
    : DeepReadonly<T[P]>;
};

function transform<T extends object>(obj: T): DeepReadonly<T>;
function transform<T extends object>(
  obj: T,
  mutations: boolean
): mutations extends true ? T : DeepReadonly<T>;
function transform<T extends object>(obj: T, mutations = false) {
  const copy = JSON.parse(JSON.stringify(obj));
  return mutations ? copy : Object.freeze(copy);
}

const config = {
  api: {
    endpoints: {
      users: '/api/users',
      posts: '/api/posts'
    },
    timeout: 5000
  }
};

const immutableConfig = transform(config);
const mutableConfig = transform(config, true);`,
  },
  {
    id: 6,
    name: "Advanced Infer with Template Literals",
    code: `type RouteParams<T extends string> = T extends \`\${string}/:\${infer Param}/\${infer Rest}\`
  ? { [K in Param | keyof RouteParams<Rest>]: string }
  : T extends \`\${string}/:\${infer Param}\`
  ? { [K in Param]: string }
  : {};

type ExtractRouteParams<T extends string> = string extends T
  ? Record<string, string>
  : RouteParams<T>;

function createRoute<T extends string>(
  path: T,
  handler: (params: ExtractRouteParams<T>) => void
) {
  return { path, handler };
}

const userPostsRoute = createRoute(
  '/users/:userId/posts/:postId',
  (params) => {
    console.log(params.userId, params.postId);
  }
);`,
  },
  {
    id: 7,
    name: "State Machine with Type-Level Programming",
    code: `type State = 'idle' | 'loading' | 'success' | 'error';
type Event = 'FETCH' | 'RESOLVE' | 'REJECT' | 'RESET';

type Transition = {
  [K in State]: {
    [E in Event]?: State;
  };
};

const transitions: Transition = {
  idle: { FETCH: 'loading' },
  loading: {
    RESOLVE: 'success',
    REJECT: 'error'
  },
  success: { RESET: 'idle' },
  error: { RESET: 'idle' }
};

class StateMachine<S extends State, E extends Event> {
  constructor(
    private state: S,
    private transitions: Transition
  ) {}

  transition(event: E): StateMachine<State, E> {
    const nextState = this.transitions[this.state][event];
    if (nextState) {
      return new StateMachine(nextState, this.transitions);
    }
    throw new Error(\`Invalid transition: \${this.state} -> \${event}\`);
  }

  getState(): S {
    return this.state;
  }
}`,
  },
  {
    id: 8,
    name: "Advanced Type-Safe Event Emitter",
    code: `type EventMap = {
  userJoined: { userId: string; timestamp: number };
  userLeft: { userId: string; duration: number };
  messageReceived: { userId: string; content: string; encrypted: boolean };
};

type EventKey = keyof EventMap;
type Handler<T extends EventKey> = (event: EventMap[T]) => void;

class TypedEventEmitter {
  private handlers = new Map<
    EventKey,
    Set<Handler<any>>
  >();

  on<T extends EventKey>(
    event: T,
    handler: Handler<T>
  ): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  emit<T extends EventKey>(
    event: T,
    data: EventMap[T]
  ): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  off<T extends EventKey>(
    event: T,
    handler: Handler<T>
  ): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }
}`,
  },
  {
    id: 9,
    name: "Proxy-based Reactive System",
    code: `type Dependency = Set<() => void>;
type DependencyMap = WeakMap<object, Map<string | symbol, Dependency>>;

const dependencies: DependencyMap = new WeakMap();
let activeEffect: (() => void) | undefined;

function track(target: object, key: string | symbol) {
  if (!activeEffect) return;
  
  let depsMap = dependencies.get(target);
  if (!depsMap) {
    dependencies.set(target, (depsMap = new Map()));
  }
  
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  dep.add(activeEffect);
}

function trigger(target: object, key: string | symbol) {
  const depsMap = dependencies.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (!dep) return;
  
  dep.forEach(effect => effect());
}

function reactive<T extends object>(obj: T): T {
  return new Proxy(obj, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return result;
    }
  });
}`,
  },
  {
    id: 10,
    name: "Type-Safe Builder Pattern",
    code: `interface QueryBuilder<T extends Record<string, any>> {
  select<K extends keyof T>(...fields: K[]): ProjectedQueryBuilder<T, Pick<T, K>>;
  where(predicate: (item: T) => boolean): QueryBuilder<T>;
  orderBy<K extends keyof T>(field: K, direction: 'asc' | 'desc'): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
}

interface ProjectedQueryBuilder<T, P> extends Omit<QueryBuilder<T>, 'select'> {
  execute(): P[];
}

class Query<T extends Record<string, any>, P = T> implements QueryBuilder<T>, ProjectedQueryBuilder<T, P> {
  private fields?: (keyof T)[];
  private whereFn?: (item: T) => boolean;
  private orderByField?: keyof T;
  private orderDirection?: 'asc' | 'desc';
  private limitCount?: number;

  select<K extends keyof T>(...fields: K[]): ProjectedQueryBuilder<T, Pick<T, K>> {
    this.fields = fields;
    return this as any;
  }

  where(predicate: (item: T) => boolean): QueryBuilder<T> {
    this.whereFn = predicate;
    return this;
  }

  orderBy<K extends keyof T>(field: K, direction: 'asc' | 'desc'): QueryBuilder<T> {
    this.orderByField = field;
    this.orderDirection = direction;
    return this;
  }

  limit(count: number): QueryBuilder<T> {
    this.limitCount = count;
    return this;
  }

  execute(): P[] {
    // Implementation would go here
    return [] as any;
  }
}`,
  },
];
