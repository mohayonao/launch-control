import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";

const config = {
  output: {
    format: "umd"
  },
  name: "LaunchControl",
  exports: "LaunchControl",
  plugins: [
    commonjs({ include: "node_modules/**" }),
    nodeResolve(),
  ]
};

export default config;
