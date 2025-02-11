import { Rule } from 'eslint';
import { parse } from '@typescript-eslint/parser';
import { Node, CallExpression } from 'estree';

const inlineScriptPattern = /javascript:|data:/i;
const evalPattern = /eval|Function|setTimeout|setInterval/;

const rules: { [key: string]: Rule.RuleModule } = {
  'no-unsafe-inline': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Prevent usage of unsafe inline scripts and styles',
        recommended: true,
      },
    },
    create(context) {
      return {
        'CallExpression[callee.property.name="innerHTML"]'(node: Node) {
          context.report({
            node,
            message: 'Avoid using innerHTML as it can lead to XSS vulnerabilities',
          });
        },
        'CallExpression[callee.property.name="insertAdjacentHTML"]'(node: Node) {
          context.report({
            node,
            message: 'Avoid using insertAdjacentHTML as it can lead to XSS vulnerabilities',
          });
        },
        'Property[key.name="dangerouslySetInnerHTML"]'(node: Node) {
          context.report({
            node,
            message: 'Avoid using dangerouslySetInnerHTML as it can lead to XSS vulnerabilities',
          });
        },
      };
    },
  },

  'no-unsafe-eval': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Prevent usage of eval() and similar functions',
        recommended: true,
      },
    },
    create(context) {
      return {
        CallExpression(node: CallExpression) {
          const callee = node.callee;
          if ('name' in callee && evalPattern.test(callee.name)) {
            context.report({
              node,
              message: `Avoid using ${callee.name} as it violates CSP eval-src directive`,
            });
          }
        },
      };
    },
  },

  'require-nonce': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Ensure script elements have nonce attributes',
        recommended: true,
      },
    },
    create(context) {
      return {
        JSXElement(node: any) {
          if (node.openingElement.name.name === 'script') {
            const hasNonce = node.openingElement.attributes.some(
              (attr: any) => attr.name.name === 'nonce'
            );
            if (!hasNonce) {
              context.report({
                node,
                message: 'Script elements must have a nonce attribute',
              });
            }
          }
        },
      };
    },
  },
};

export = {
  rules,
  configs: {
    recommended: {
      plugins: ['@tokenforge/eslint-plugin-csp'],
      rules: {
        '@tokenforge/csp/no-unsafe-inline': 'error',
        '@tokenforge/csp/no-unsafe-eval': 'error',
        '@tokenforge/csp/require-nonce': 'error',
      },
    },
  },
};
