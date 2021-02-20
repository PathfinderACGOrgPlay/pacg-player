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
  externals: {
    "@google-cloud/firestore": "commonjs @google-cloud/firestore",
    "firebase-admin": "commonjs firebase-admin",
    "firebase-functions": "commonjs firebase-functions",
    jsondiffpatch: "commonjs jsondiffpatch",
    "node-html-to-image": "commonjs node-html-to-image",
    "prop-types": "commonjs prop-types",
    puppeteer: "commonjs puppeteer",
    "source-map-support": "commonjs source-map-support",
    sharp: "commonjs sharp",
  },
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
