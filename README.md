# node-flow

使用 js 实现的可复用代码块工作流，可以通过添加可复用的代码节点块 + 动作流的循环，条件等流程配置来达到自动执行流程的目的

- 支持节点执行 asyn + block
- 支持循环，条件分支，并支持互相可嵌套

```javascript
const core = require("./model.core");
core.addActionFlow("xxx", ({ forWhile, ifElse, exec }) => {
  return [
    forWhile(
      async ({ ctx }) => {
        const { xxxInNode } = ctx.get();
        if (xxxInNode) {
          return true;
        }
      },
      [ifElse(() => false, [{ name: "a-node-name" }], [])]
    ),
    exec([{ name: "node-can-be-executed-directly" }]),
  ];
});
```
