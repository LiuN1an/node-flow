class Node {
  _config = {};

  _output = {};

  constructor(config) {
    this._config = config;
  }

  async input(ctx) {
    const result = (await this._config.middleware({ ctx })) || {};
    Object.keys(result).forEach((key) => {
      this._output[key] = result[key];
    });
  }

  output() {
    return this._output || {};
  }
}

module.exports = {
  Node,
};
