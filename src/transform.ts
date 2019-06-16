import { AST, Transformed, TokenType } from './types'

const definedClasses: string[] = []

export default function transformAST (ast: AST.Token): Transformed.Token {
  function visit (node: AST.Token, parent?: AST.Token | any): Transformed.Token {
    switch (node.type) {
      case TokenType.Program: {
        return {
          type: 'Program',
          body: node.body.map((child) => visit(child))
        }
      }

      case TokenType.FunctionDefinition: {
        const out: Transformed.Token = {
          type: 'FunctionDeclaration',
          id: toIdentifier(node),
          params: node.args.map((child) => visit(child, node)),
          body: {
            type: 'BlockStatement',
            body: undefined
          }
        }

        out.body.body = node.body.map((child) => visit(child, out.body))

        return out
      }

      case TokenType.ClassDefinition: {
        const out: Transformed.Token = {
          type: 'FunctionDeclaration',
          id: toIdentifier(node.name),
          params: [],
          body: {
            type: 'BlockStatement',
            body: []
          }
        }

        definedClasses.push(node.name)

        return out
      }

      case TokenType.ClassFunctionDefinition: {
        return toMaybeExpressionStatement({
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: toIdentifier(node.name),
              property: toIdentifier('prototype'),
              computed: false
            },
            property: toIdentifier(node.function.name),
            computed: false
          },
          right: visit(node.function.body)
        })
      }

      case TokenType.Definition: {
        const out: Transformed.Token = {
          type: 'VariableDeclaration',
          declarations: [ {
            type: 'VariableDeclarator',
            id: toIdentifier(node.name),
            init: null
          } ],
          kind: 'let'
        }

        if (definedClasses.includes(node.definitionType)) {
          out.declarations[0].init = {
            type: 'NewExpression',
            callee: toIdentifier(node.definitionType),
            arguments: []
          }
          out.kind = 'const'
        }

        return out
      }

      case TokenType.Return: {
        const out: Transformed.Token = {
          type: 'ReturnStatement',
          argument: undefined
        }

        if (node.value) {
          out.argument = visit(node.value, node)
        }

        return out
      }

      case TokenType.AssignmentOperator: {
        return toMaybeExpressionStatement({
          type: 'AssignmentExpression',
          operator: '=',
          left: toIdentifier(node.name),
          right: visit(node.value)
        })
      }

      case TokenType.Literal: return toIdentifier(node)
      case TokenType.StringLiteral: return toLiteral(node)
    }

    throw new Error(`Cannot transform AST node with type: ${node.type}`)
  }

  return visit(ast)
}

const expressionStatementTypes: string[] = [
  'Program',
  'BlockStatement'
]

function toBinaryExpression (left: AST.Token, right: AST.Token, operator: string) {
  return {
    type: 'BinaryExpression',
    operator,
    left,
    right
  }
}

function toMaybeExpressionStatement (node: Transformed.Token, parent?: Transformed.Token): Transformed.Token {
  if (parent && !expressionStatementTypes.includes(parent.type)) {
    return node
  }

  return {
    type: 'ExpressionStatement',
    expression: node
  }
}

function toLiteral (node: AST.Token): Transformed.Token {
  if (
    node.type !== TokenType.Literal &&
    node.type !== TokenType.StringLiteral
  ) {
    return {
      type: 'Literal',
      value: 'unknown',
      raw: `'unknown'`
    }
  }

  return {
    type: 'Literal',
    value: node.value,
    raw: `'${node.value}'`
  }
}

function getNodeName (node: AST.Token): string {
  if ('name' in node) return node.name
  if ('value' in node && typeof node.value === 'string') return node.value
  return 'unknown'
}

function toIdentifier (node: AST.Token | string): Transformed.Token {
  let name = typeof node === 'string' ? node : getNodeName(node)

  return {
    type: 'Identifier',
    name
  }
}
