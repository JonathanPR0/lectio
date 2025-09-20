import esbuildPluginTsc from "esbuild-plugin-tsc";
export default () => ({
  bundle: true,
  minify: false,
  sourcemap: false,
  exclude: ["!@aws-sdk/client-cognito-identity-provider"],
  external: ["!@aws-sdk/client-cognito-identity-provider"],
  plugins: [esbuildPluginTsc()],
});
