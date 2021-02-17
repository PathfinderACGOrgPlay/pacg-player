var nodeExternals = require("webpack-node-externals");

const allowlist = [
  /react/,
  /^@material-ui/,
  /^@babel/,
  /^scheduler$/,
  /^popper[.]js$/,
  /^dnd-core$/,
  /^redux$/,
  /^symbol-observable$/,
];

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./src/index.ts",
  output: {
    filename: "index.js",
    libraryTarget: "this",
  },
  watch: !!process.env.WATCH,
  target: "node",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  externals: [
    nodeExternals({
      modulesDir: "../node_modules",
      allowlist,
    }),
    nodeExternals({
      modulesDir: "node_modules",
      allowlist,
    }),
  ],
  plugins: [
    new (require("webpack").DefinePlugin)({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.FUNCTIONS": true,
    }),
    new (require("webpack").BannerPlugin)({
      banner: "require('source-map-support').install();",
      raw: true,
    }),
  ],
};
