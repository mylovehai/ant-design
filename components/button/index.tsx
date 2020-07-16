/**
 * 单一出口文件原则
 * 通过一个文件导出组件、组件ts类型
 */
import Button from './button';

export { ButtonProps, ButtonShape, ButtonType } from './button';
export { ButtonGroupProps } from './button-group';
export { SizeType as ButtonSize } from '../config-provider/SizeContext';

export default Button;
