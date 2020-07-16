// 泛型。接收两个对象类型T、K，其中 K 必须是 T 的属性子集；
// Exclude 从 T 中存在 K 的属性去掉。
// Pick 从 T 中取出一系列 K 的属性。
// Omit 作用：去除 T 中的 K 属性。
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
// https://stackoverflow.com/questions/46176165/ways-to-get-string-literal-type-of-array-values-without-enum-overhead
// 无枚举开销的 获取字符串文字类型的数组值方法
export const tuple = <T extends string[]>(...args: T) => args;
// 无枚举开销的 获取数字类型的数组值方法
export const tupleNum = <T extends number[]>(...args: T) => args;

/**
 * https://stackoverflow.com/a/59187769
 * Extract the type of an element of an array/tuple without performing indexing
 */
export type ElementOf<T> = T extends (infer E)[] ? E : T extends readonly (infer E)[] ? E : never;

/**
 * https://github.com/Microsoft/TypeScript/issues/29729
 */
export type LiteralUnion<T extends U, U> = T | (U & {});
