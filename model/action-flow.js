class ActionCtx {
    _store = {};
  
    constructor() {}
  
    add(props) {
      Object.keys(props).forEach((key) => {
        this._store[key] = props[key];
      });
    }
  
    get() {
      return this._store;
    }
  }
  
  /**
   * 动作流
   */
  class ActionFlow {
    _store = [];
  
    constructor(config, core) {
      this.config = config;
      this._core = core;
      this.init(config);
    }
  
    /**
     * 维护一下全局上下文，该上下文
     */
    ctx = new ActionCtx();
  
    add() {}
  
    init(configFunc) {
      const result = configFunc({
        forWhile: (condition, chainOrItems) => {
          if (Array.isArray(chainOrItems)) {
            const unit = {
              $$_type: "while",
              condition,
              $$_chain: [],
            };
            for (const item of chainOrItems) {
              if (item.$$_type) {
                unit["$$_chain"].push(item);
              } else {
                unit["$$_chain"] = unit["$$_chain"].concat(
                  this.parseConfig([item])
                );
              }
            }
            return unit;
          } else {
            throw Error("forWhile 2nd parameter must be array");
          }
        },
        ifElse: (condition, chainOrItems, elseChainOrItems) => {
          if (
            Array.isArray(chainOrItems) &&
            Array.isArray(elseChainOrItems)
          ) {
            const unit = {
              $$_type: "if",
              condition,
              $$_chain: [],
              $$_else_chain: [],
            };
            for (const item of chainOrItems) {
              if (item.$$_type) {
                unit["$$_chain"].push(item);
              } else {
                unit["$$_chain"] = unit["$$_chain"].concat(
                  this.parseConfig([item])
                );
              }
            }
            for (const item of elseChainOrItems) {
              if (item.$$_type) {
                unit["$$_else_chain"].push(item);
              } else {
                unit["$$_else_chain"] = unit["$$_else_chain"].concat(
                  this.parseConfig([item])
                );
              }
            }
            return unit;
          } else {
            throw Error("ifElse 2nd and 3nd parameter must be array");
          }
        },
        exec: (chainOrItems) => {
          if (Array.isArray(chainOrItems)) {
            const unit = {
              $$_type: "exec",
              $$_chain: [],
            };
            for (const item of chainOrItems) {
              if (item.$$_type) {
                unit["$$_chain"].push(item);
              } else {
                unit["$$_chain"] = unit["$$_chain"].concat(
                  this.parseConfig([item])
                );
              }
            }
            return unit;
          } else {
            throw Error("exec 2nd parameter must be array");
          }
        },
      });
      this._store = this._store.concat(result);
    }
  
    async step(store = this._store) {
      for (const item of store) {
        const { $$_type, $$_chain, $$_else_chain, condition } = item;
        if ($$_type === "exec") {
          await this.exec($$_chain);
        }
        if ($$_type === "while") {
          await this.forWhile(condition, $$_chain);
        }
        if ($$_type === "if") {
          await this.ifElse(condition, $$_chain, $$_else_chain);
        }
      }
    }
  
    async exec(chain) {
      for (const func of chain) {
        if (typeof func === "function") {
          await func(this.ctx);
        } else {
          await this.step([func]);
        }
      }
      // 链式执行或者并行执行，出错回退措施
    }
  
    async forWhile(condition, chain = []) {
      do {
        await this.exec(chain);
      } while (await condition({ ctx: this.ctx }));
    }
  
    async ifElse(conditon, ifChain, elseChain) {
      if (await conditon({ ctx: this.ctx })) {
        await this.exec(ifChain);
      } else {
        await this.exec(elseChain);
      }
    }
  
    /**
     * TODO: 这里可以开放出去，目前是每一个node都会有自己在链式执行时的一些定制逻辑
     * 所以这里与core耦合了
     */
    parseConfig = (configs) => {
      const chain = [];
      configs.forEach((config) => {
        const { name } = config;
        if (name) {
          const node = this._core.getNode(name);
          chain.push(async (ctx) => {
            await node.input(ctx);
            const temp = node.output();
            ctx.add(temp);
          });
        }
      });
      return chain;
    };
  }
  
  module.exports = {
    ActionFlow,
  };
  