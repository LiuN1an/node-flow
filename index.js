const { core } = require("./model/core");

/**
 * Utils
 */
const promiseValue = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve,
    reject,
  };
};

const sleep = (returnResult, timeout) => {
  const { promise, resolve } = promiseValue();
  setTimeout(() => {
    resolve(returnResult);
  }, timeout);
  return promise;
};


/**
 * Node Definition
 * 支持节点异步执行
 */
core.addNode({
  name: "fetch-THS",
  middleware: async ({}) => {
    const series = [1, 2, 3];
    console.log("fetch output series: ", series);
    return sleep({ series }, 1500);
  },
});

core.addNode({
  name: "trans-MA60",
  middleware: async ({ ctx }) => {
    const { MA60, series } = ctx.get();
    if (MA60) {
      console.log("trans accept trans: ", MA60);
      console.log("trans output MA60: ", MA60 + 1);
      return sleep({ MA60: MA60 + 1 }, 500);
    }
    if (series) {
      console.log("trans accept series: ", series);
      console.log("trans output MA60: ", 0);
    }
    return sleep({ MA60: 1 }, 500);
  },
});

core.addNode({
  name: "analyzer-hit",
  middleware: async ({ ctx }) => {
    const { MA60 } = ctx.get();
    if (MA60) {
      console.log("analyzer accept MA60: ", MA60);
      console.log("analyzer output isHit: ", true);
      return {
        isHit: true,
      };
    }
  },
});

core.addNode({
  name: "classify-isHit",
  middleware: async ({ ctx }) => {
    const { isHit } = ctx.get();
    if (isHit) {
      console.log("classify accept isHit: ", isHit);
      console.log("classify output money: ", 1000);
      return {
        money: 1000,
      };
    } else {
      console.log("no analyzer");
    }
  },
});

core.addNode({
  name: "trade-d",
  middleware: async ({ ctx }) => {
    const { money } = ctx.get();
    if (money) {
      console.log("trade accept money: ", money);
      console.log("trade output status: ", true);
      return {
        status: true,
      };
    } else {
      const { isHit } = ctx.get();
      console.log("trade accept analyzer: ", isHit);
      console.log("no classify");
    }
  },
});

// TODO: Node可以从core中抽出来，让core的addActionFlow方法直接接受一个NodeList对象

core.addActionFlow("哈哈", ({ forWhile, ifElse, exec }) => {
  return [
    forWhile(
      async ({ ctx }) => {
        const { MA60 } = ctx.get();
        if (MA60) {
          return MA60 !== 5;
        } else {
          return true;
        }
      },
      [
        ifElse(
          () => {
            return false;
          },
          [
            {
              name: "fetch-THS",
            },
          ],
          []
        ),
        {
          name: "trans-MA60",
        },
      ]
    ),
    ifElse(
      async ({ ctx }) => {
        return true;
      },
      [
        {
          name: "analyzer-hit",
        },
      ],
      [
        {
          name: "classify-isHit",
        },
      ]
    ),
    exec([
      {
        name: "trade-d",
      },
    ]),
  ];
});

core.exec();
