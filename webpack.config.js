const upstreamConfig = require("flareact/webpack");
const path = require("path");

module.exports = (env, argv) => {
  const config = upstreamConfig(env, argv);
  if(!config.optimization) config.optimization = {};
  config.optimization.minimize = false;

  if(!config.resolve) config.resolve = {};
  if(!config.resolve.alias) config.resolve.alias = {};

  config.resolve.alias["marked"] = path.join(__dirname, "./logic/empty.js");

  return config;
}