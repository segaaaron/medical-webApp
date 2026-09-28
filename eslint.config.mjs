import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Guardas de la regla del CEO: si el servicio responde, el sitio usa SOLO sus
 * datos; el contenido del código es un respaldo ENTERO para cuando no
 * responde. Nunca se mezclan. Ver lib/content/service.ts.
 */
const BACKEND_CLIENT_MSG =
  "El sitio público lee el backend SOLO a través de lib/content/* (fromService): " +
  "así el respaldo es siempre entero y nunca se mezcla con los datos del servicio.";
const FALLBACK_MSG =
  "Los respaldos solo los importan los getters de lib/content/*.ts, que los pasan enteros a fromService. " +
  "Nadie más puede leerlos: sería mezclar respaldo con datos del servicio.";
const NO_MIX_MSG =
  "Prohibido en lib/content: un parser/getter no rellena huecos del servicio. " +
  "Usa str()/arr()/firstStr() de lib/content/parse/coerce.ts (devuelven ''/[], no contenido). " +
  "El respaldo va entero en fromService().";

const backendClientPattern = { group: ["@/lib/backend-client", "**/lib/backend-client", "./backend-client", "../backend-client"], message: BACKEND_CLIENT_MSG };
const fallbackPattern = { group: ["@/lib/content/fallback/*", "**/content/fallback/*", "./fallback/*", "../fallback/*"], message: FALLBACK_MSG };

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Build output — minified bundles are not source and must not be linted.
    "dist/**",
  ]),

  // 1. Nadie fuera de la puerta única habla con el backend, ni lee respaldos.
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    ignores: ["lib/content/**", "app/dashboard/**", "app/api/**", "lib/backend-client.ts", "tests/**"], // tests: verifican el contrato comparando contra los respaldos
    rules: {
      "no-restricted-imports": ["error", { patterns: [backendClientPattern, fallbackPattern] }],
      // `import()` dinámico no lo cubre no-restricted-imports.
      "no-restricted-syntax": [
        "error",
        { selector: "ImportExpression[source.value=/backend-client$/]", message: BACKEND_CLIENT_MSG },
        { selector: "ImportExpression[source.value=/content\\/fallback\\//]", message: FALLBACK_MSG },
      ],
    },
  },
  // 2. Dentro de lib/content, los parsers (y la puerta) no ven los respaldos.
  {
    files: ["lib/content/parse/**", "lib/content/service.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [fallbackPattern] }],
    },
  },
  // Dashboard y proxies pueden hablar con el backend, pero no con los respaldos.
  {
    files: ["app/dashboard/**", "app/api/**"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [fallbackPattern] }],
    },
  },
  // 3. Sin mezcla por construcción en parsers y getters.
  {
    files: ["lib/content/**/*.ts"],
    ignores: ["lib/content/fallback/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: "LogicalExpression[operator='||']", message: NO_MIX_MSG },
        { selector: "LogicalExpression[operator='??']", message: NO_MIX_MSG },
        { selector: "AssignmentExpression[operator=/^(\\|\\||\\?\\?)=$/]", message: NO_MIX_MSG },
        { selector: "SpreadElement", message: NO_MIX_MSG },
        { selector: "CallExpression[callee.object.name='Object'][callee.property.name='assign']", message: NO_MIX_MSG },
      ],
    },
  },
]);

export default eslintConfig;
