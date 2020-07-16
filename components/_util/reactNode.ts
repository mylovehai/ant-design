import * as React from 'react';

// 判断是否 是一个合法的 react 元素
export const { isValidElement } = React;

/**
 * 接收一个元素、要替换的元素、以及props，
 * 返回一个以 element 元素为样板，克隆并返回新的 React 元素。
 * 返回元素的 props ，是将原始元素（element）的 props 和 传入的props，进行浅层合并的结果。
 *
 * @export
 * @param {React.ReactNode} element
 * @param {React.ReactNode} replacement
 * @param {*} props
 * @returns {React.ReactNode}
 */
export function replaceElement(
  element: React.ReactNode,
  replacement: React.ReactNode,
  props: any,
): React.ReactNode {
  if (!isValidElement(element)) return replacement;

  return React.cloneElement(element, typeof props === 'function' ? props() : props);
}

/**
 * 接收一个react元素，以及一个props参数，返回一个新的React元素（拷贝）。
 *
 * @export
 * @param {React.ReactNode} element
 * @param {*} [props]
 * @returns {React.ReactElement}
 */
export function cloneElement(element: React.ReactNode, props?: any): React.ReactElement {
  return replaceElement(element, element, props) as React.ReactElement;
}
