const { ActionFlow } = require("./action-flow");
const { Node } = require("./node");

class Core {
  constructor() {}

  /**
   * 执行动作流
   */
  actionFlows = new Map();
  addActionFlow(name, flowFunc) {
    this.actionFlows.set(name, new ActionFlow(flowFunc, this));
  }

  /**
   * TODO: 这里可能需要actionFlows里面的所有动作并行执行
   */
  async exec() {
    for (const flow of this.actionFlows.values()) {
      flow.step();
    }
  }

  node = new Map();
  addNode(props) {
    const { name } = props;
    this.node.set(name, new Node(props));
  }

  getNode(name) {
    return this.node.get(name);
  }
}

const core = new Core();

module.exports = {
  core,
};
