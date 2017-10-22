import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import nodeBuiltins from "rollup-plugin-node-builtins";

const config = {
  output: {
    format: "umd"
  },
  name: "LaunchControl",
  exports: "LaunchControl",
  plugins: [
    commonjs({ include: "node_modules/**" }),
    nodeResolve(),
    nodeBuiltins(),
  ]
};

export default config;
