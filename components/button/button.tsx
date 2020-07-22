/* eslint-disable react/button-has-type */
import * as React from 'react';
import classNames from 'classnames';
import omit from 'omit.js';

import Group from './button-group';
import { ConfigContext } from '../config-provider';
import Wave from '../_util/wave';
import { Omit, tuple } from '../_util/type';
import devWarning from '../_util/devWarning';
import SizeContext, { SizeType } from '../config-provider/SizeContext';
import LoadingIcon from './LoadingIcon';
import { cloneElement } from '../_util/reactNode';

// 由 两个中文字符串组成的 字符串
const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
function isString(str: any) {
  return typeof str === 'string';
}

// Insert one space between two chinese characters automatically.
/**
 * 在两个中文字符之间插入一个空格
 *
 * @param {React.ReactChild} child
 * @param {boolean} needInserted
 * @returns
 */
function insertSpace(child: React.ReactChild, needInserted: boolean) {
  // Check the child if is undefined or null.
  // undefined == null
  if (child == null) {
    return;
  }
  const SPACE = needInserted ? ' ' : '';
  // strictNullChecks oops.
  // 如果子元素是一个 标签+两个中文字符 的元素组合。如：<a>中文</a>
  // 返回新的 element 元素（通过浅层合并 children，修改内容）
  if (
    typeof child !== 'string' &&
    typeof child !== 'number' &&
    isString(child.type) &&
    isTwoCNChar(child.props.children)
  ) {
    // 传入 子元素，以及一个 props 对象，通过props修改元素children的值。
    // 为什么需要通过拷贝元素，去替换其中的children的值？
    // child.props.children = child.props.children.split('').join(SPACE)  // 无法修改
    // debugger
    // children 是不透明的数据结构，不能直接操作。通过 React.cloneElement() 合并 children，返回新的 React 元素。
    return cloneElement(child, {
      children: child.props.children.split('').join(SPACE),
    });
  }
  // 如果子元素（props.children）为字符串,返回一个 span标签包裹子元素
  if (typeof child === 'string') {
    // 通过正则判断，若为两个中文的字符串，则添加空格
    if (isTwoCNChar(child)) {
      // 通过split()，将字符串转换成数组（每个字符代表一个数组元素），通过join(' ')将数组所有的元素，通过空格连接成字符串。
      child = child.split('').join(SPACE);
    }
    return <span>{child}</span>;
  }
  return child;
}

/**
 * 将 Button 的 children 进行数组扁平化，然后通过 insertSpace() 方法插入空格。
 * 返回修改后的 子节点数组。
 *
 * @param {React.ReactNode} children
 * @param {boolean} needInserted
 * @returns
 */
function spaceChildren(children: React.ReactNode, needInserted: boolean) {
  let isPrevChildPure: boolean = false;
  const childList: React.ReactNode[] = [];
  // 遍历按钮组件的子元素，将内部的 子元素 进行数组扁平化。
  React.Children.forEach(children, child => {
    const type = typeof child;
    const isCurrentChildPure = type === 'string' || type === 'number';
    // 如果上一个元素是标签、字符串或数字类型，当前的也是，则会读取数组的最后一个元素，进行字符串合并；否则，会直接push到子元素数组列表中。
    // 什么情况下会产生字符串合并？静态+动态绑定？用于处理什么样的场景
    if (isPrevChildPure && isCurrentChildPure) {
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      childList[lastIndex] = `${lastChild}${child}`;
    } else {
      childList.push(child);
    }
    isPrevChildPure = isCurrentChildPure;
  });
  // Pass to React.Children.map to auto fill key
  // 遍历扁平化后的数组，给元素插入空格，返回一个新的数组。
  return React.Children.map(childList, child =>
    insertSpace(child as React.ReactChild, needInserted),
  );
}

// 通过 tuple 生成字符串数组（string[]）。
// 通过 typeof 获取数组只可读的值，解析数组成员类型（这称为索引访问类型或查找类型）。
// (typeof 关键字产生的东西，叫 type alias（类型别名），不是真正的类型)
const ButtonTypes = tuple('default', 'primary', 'ghost', 'dashed', 'link', 'text');
export type ButtonType = typeof ButtonTypes[number];
const ButtonShapes = tuple('circle', 'circle-outline', 'round');
export type ButtonShape = typeof ButtonShapes[number];
const ButtonHTMLTypes = tuple('submit', 'button', 'reset');
export type ButtonHTMLType = typeof ButtonHTMLTypes[number];

// 为什么 danger 类型作为单独的接口类型?
export type LegacyButtonType = ButtonType | 'danger';
export function convertLegacyProps(type?: LegacyButtonType): ButtonProps {
  if (type === 'danger') {
    return { danger: true };
  }
  return { type };
}

// 定义按钮基本 props，会通过高级类型修改。
export interface BaseButtonProps {
  type?: ButtonType;
  icon?: React.ReactNode;
  shape?: ButtonShape;
  size?: SizeType;
  loading?: boolean | { delay?: number };
  prefixCls?: string;
  className?: string;
  ghost?: boolean;
  danger?: boolean;
  block?: boolean;
  children?: React.ReactNode;
}

// Typescript will make optional not optional if use Pick with union.
// Should change to `AnchorButtonProps | NativeButtonProps` and `any` to `HTMLAnchorElement | HTMLButtonElement` if it fixed.
// ref: https://github.com/ant-design/ant-design/issues/15930
export type AnchorButtonProps = {
  href: string;
  target?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
} & BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<any>, 'type' | 'onClick'>;

export type NativeButtonProps = {
  htmlType?: ButtonHTMLType;
  onClick?: React.MouseEventHandler<HTMLElement>;
} & BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<any>, 'type' | 'onClick'>;

// 最终暴露出去的 Button Props，通过 Partial，将所有 props 属性修改为可选类型。
export type ButtonProps = Partial<AnchorButtonProps & NativeButtonProps>;

interface CompoundedComponent
  extends React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLElement>> {
  Group: typeof Group;
  __ANT_BUTTON: boolean;
}

type Loading = number | boolean;

// 这是一个怎样的函数组件？可传入 ref 的 HOC 函数
// 定义一个可以转发 ref 的回调函数组件，作为 forwardRef() 的参数
const InternalButton: React.ForwardRefRenderFunction<unknown, ButtonProps> = (props, ref) => {
  const {
    loading,
    prefixCls: customizePrefixCls,
    type,
    danger,
    shape,
    size: customizeSize,
    className,
    children,
    icon,
    ghost,
    block,
    ...rest
  } = props;
  // 大小 Context
  const size = React.useContext(SizeContext);
  // 因为 loading 可为 number 类型，通过 !! 操作符，将数字类型的时候，转换成 boolean 类型。
  // Button 组件内的 loading 状态，由 loadingOrDelay 影响，props.loading 影响 loadingOrDelay。
  const [innerLoading, setLoading] = React.useState<Loading>(!!loading);
  // 是否含两个中文的字符，初始值为 false
  const [hasTwoCNChar, setHasTwoCNChar] = React.useState(false);
  // 调用Config上下文，返回 预设的Class名（ant-xxx）、undefined、ltr
  const { getPrefixCls, autoInsertSpaceInButton, direction } = React.useContext(ConfigContext);
  // 如果没有传入 ref，则创建一个新的 ref
  // createRef 重新渲染的时候，总是返回一个新的对象
  const buttonRef = (ref as any) || React.createRef<HTMLElement>();
  // useRef 总是返回同一个对象。即，xxx.current 的值不变(只会赋值一次)
  const delayTimeoutRef = React.useRef<number>();

  // children 中的组件总数量等于1时，没有icon、按钮类型不为 link、text 时，需要插入空格
  const isNeedInserted = () => {
    return React.Children.count(children) === 1 && !icon && type !== 'link' && type !== 'text';
  };

  //
  const fixTwoCNChar = () => {
    // Fix for HOC usage like <FormatMessage />
    // 当 buttonRef 为 空、未创建成功、未绑定成功、自动插入空格为false 时，退出执行
    if (!buttonRef || !buttonRef.current || autoInsertSpaceInButton === false) {
      return;
    }
    // 按钮文字
    const buttonText = buttonRef.current.textContent;
    // 判断，是否为需要插入空格的按钮类型、是否是两个中文的字符串
    if (isNeedInserted() && isTwoCNChar(buttonText)) {
      // 为什么需要 hasTwoCNChar 作为状态？
      if (!hasTwoCNChar) {
        setHasTwoCNChar(true);
      }
    } else if (hasTwoCNChar) {
      setHasTwoCNChar(false);
    }
  };

  // =============== Update Loading ===============
  let loadingOrDelay: Loading;
  // 每次组件重新渲染都会执行，判断 loading 状态，并且将 loading 映射为 loadingOrDelay。
  if (typeof loading === 'object' && loading.delay) {
    loadingOrDelay = loading.delay || true;
  } else {
    loadingOrDelay = !!loading;
  }

  // 监听 loadingOrDelay，设置组件函数中 state 的 innerLoading
  React.useEffect(() => {
    clearTimeout(delayTimeoutRef.current);
    if (typeof loadingOrDelay === 'number') {
      delayTimeoutRef.current = window.setTimeout(() => {
        setLoading(loadingOrDelay);
      }, loadingOrDelay);
    } else {
      setLoading(loadingOrDelay);
    }
  }, [loadingOrDelay]);

  // 监听 buttonRef，当初次渲染和重渲染的时候，调用 fixTwoCNChar 方法。
  React.useEffect(() => {
    fixTwoCNChar();
  }, [buttonRef]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => {
    const { onClick } = props;
    if (innerLoading) {
      return;
    }
    if (onClick) {
      (onClick as React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>)(e);
    }
  };

  devWarning(
    !(typeof icon === 'string' && icon.length > 2),
    'Button',
    `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`,
  );

  // 根据预设的样式名和 'btn' 进行字符串拼接，得到样式名前缀。（“-”连接符）如：xxx-btn
  const prefixCls = getPrefixCls('btn', customizePrefixCls);
  const autoInsertSpace = autoInsertSpaceInButton !== false;

  // large => lg
  // small => sm
  let sizeCls = '';
  switch (customizeSize || size) {
    case 'large':
      sizeCls = 'lg';
      break;
    case 'small':
      sizeCls = 'sm';
      break;
    default:
      break;
  }

  // 控制 icon 按钮类型时，如果按钮处于 loading 状态，则
  const iconType = innerLoading ? 'loading' : icon;

  // 生成样式字符串。
  // `${prefixCls} ${className} ...{}`  ,当对象的 value 为 true 时，相应的属性会作为样式名
  const classes = classNames(prefixCls, className, {
    [`${prefixCls}-${type}`]: type,
    [`${prefixCls}-${shape}`]: shape,
    [`${prefixCls}-${sizeCls}`]: sizeCls,
    [`${prefixCls}-icon-only`]: !children && children !== 0 && iconType,
    [`${prefixCls}-background-ghost`]: ghost,
    [`${prefixCls}-loading`]: innerLoading,
    [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && autoInsertSpace,
    [`${prefixCls}-block`]: block,
    [`${prefixCls}-dangerous`]: !!danger,
    [`${prefixCls}-rtl`]: direction === 'rtl',
  });

  // icon 图标显示逻辑。
  // 当icon存在，且loading状态为false时，展示icon；
  // 其它情况，展示loading组件，该组件的loading状态，通过 innerLoading 控制，样式预设和当前 Button 相同。
  const iconNode =
    icon && !innerLoading ? (
      icon
    ) : (
      <LoadingIcon existIcon={!!icon} prefixCls={prefixCls} loading={!!innerLoading} />
    );

  // 对 children 做处理
  // 是否返回一个新的子元素数组？为什么一定要经过数组扁平化处理，让子元素变成数组再进行渲染？
  const kids =
    children || children === 0
      ? spaceChildren(children, isNeedInserted() && autoInsertSpace)
      : null;

  // 在 rest 中排除指定属性，并返回排除后的结果
  const linkButtonRestProps = omit(rest as AnchorButtonProps, ['htmlType', 'loading']);
  if (linkButtonRestProps.href !== undefined) {
    return (
      <a {...linkButtonRestProps} className={classes} onClick={handleClick} ref={buttonRef}>
        {iconNode}
        {kids}
      </a>
    );
  }

  // React does not recognize the `htmlType` prop on a DOM element. Here we pick it out of `rest`.
  const { htmlType, ...otherProps } = rest as NativeButtonProps;

  const buttonNode = (
    <button
      // 原生按钮 不包含 loading 属性，排除
      {...(omit(otherProps, ['loading']) as NativeButtonProps)}
      type={htmlType}
      className={classes}
      onClick={handleClick}
      ref={buttonRef}
    >
      {iconNode}
      {kids}
    </button>
  );

  // 返回带参数的原生按钮
  if (type === 'link' || type === 'text') {
    return buttonNode;
  }

  // Wave 组件内部做了什么？
  // 添加点击动画效果
  return <Wave>{buttonNode}</Wave>;
};

// React.forwardRef() 获取传递给 Button 的 ref，然后转发到渲染的 InternalButton 组件中的指定 html 元素上。
const Button = React.forwardRef<unknown, ButtonProps>(InternalButton) as CompoundedComponent;

Button.displayName = 'Button';

// 给组件添加默认的 props
// https://zh-hans.reactjs.org/docs/react-component.html#defaultprops
Button.defaultProps = {
  loading: false,
  ghost: false,
  block: false,
  htmlType: 'button' as ButtonProps['htmlType'],
};

// 将 Group 挂载到 Button 组件上
Button.Group = Group;
Button.__ANT_BUTTON = true;

export default Button;
