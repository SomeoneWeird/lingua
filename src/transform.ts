import { AST, Transformed, TokenType } from './types'

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
        const out: Transformed.FunctionDeclarationNode = {
          type: 'FunctionDeclaration',
          id: toIdentifier(node),
          params: node.args.map((child) => visit(child, node)),
          defaults: [],
          body: {
            type: 'BlockStatement',
            body: undefined
          }
        }

        out.body.body = node.body.map((child) => visit(child, out.body))

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
  if (node.type !== TokenType.Literal) {
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

function toIdentifier (node: AST.Token): Transformed.Token {
  let name = typeof node === 'string' ? node : getNodeName(node)

  return {
    type: 'Identifier',
    name
  }
}
