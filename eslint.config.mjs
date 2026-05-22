import next from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [
      "test-results/**",
      "playwright-report/**",
      ".next/**",
      "node_modules/**",
      ".venv/**",
      "scratch/**"
    ]
  },
  ...next
];

export default eslintConfig;
