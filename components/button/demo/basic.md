---
order: 0
title:
  zh-CN: 按钮类型
  en-US: Type
---

## zh-CN

按钮有四种类型：主按钮、次按钮、虚线按钮和链接按钮。主按钮在同一个操作区域最多出现一次。

## en-US

There are `primary` button, `default` button, `dashed` button and `link` button in antd.

```jsx
import { Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

ReactDOM.render(
  <>
    <Button type="primary" loading={{ delay: 3000 }} icon={<SearchOutlined />}>
      主要
    </Button>
    <Button>Default Button</Button>
    <Button type="dashed">Dashed Button</Button>
    <br />
    <Button type="text">Text Button</Button>
    <Button type="link">Link Button</Button>
  </>,
  mountNode,
);
```
