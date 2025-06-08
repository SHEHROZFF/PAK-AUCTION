import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable TypeScript strict rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      
      // Disable React hooks rules
      "react-hooks/exhaustive-deps": "off",
      
      // Disable Next.js image optimization warnings
      "@next/next/no-img-element": "off",
      
      // Disable React unescaped entities
      "react/no-unescaped-entities": "off",
      
      // Disable import/export warnings
      "import/no-anonymous-default-export": "off",
    }
  }
];

export default eslintConfig;
