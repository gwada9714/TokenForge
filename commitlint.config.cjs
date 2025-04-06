module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation
        "style", // Code style changes
        "refactor", // Code refactoring
        "perf", // Performance improvements
        "test", // Tests
        "build", // Build system
        "ci", // CI/CD
        "chore", // Maintenance
        "revert", // Revert changes
        "contract", // Smart contract changes
      ],
    ],
    "scope-enum": [
      2,
      "always",
      [
        "ui", // UI components
        "core", // Core functionality
        "contract", // Smart contracts
        "test", // Tests
        "deps", // Dependencies
        "config", // Configuration
        "docs", // Documentation
      ],
    ],
    "subject-case": [0],
  },
};
