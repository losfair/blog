const upstreamConfig = require("flareact/webpack");

module.exports = (env, argv) => {
  const config = upstreamConfig(env, argv);
  return Object.assign(config, {
    optimization: {
      minimize: false,
    }
  });
}