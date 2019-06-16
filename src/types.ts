export enum TokenType {
  Word = 'Word',
  LineBreak = 'LineBreak',
  AssignmentOperator = 'AssignmentOperator',
  Definition = 'Definition',
  DefinitionFinish = 'DefinitionFinish',
  Return = 'Return',
  Array = 'Array',
  ArrayStart = 'ArrayStart',
  ArrayEnd = 'ArrayEnd',
  ImportStatement = 'ImportStatement',
  ImportAsStatement = 'ImportAsStatement',
  ExportStatement = 'ExportStatement',
  FunctionArguments = 'FunctionArguments',
  IfStatement = 'IfStatement',
  ElseStatement = 'ElseStatement',
  ConsoleLog = 'ConsoleLog',
  Literal = 'Literal',
  StringLiteral = 'StringLiteral',
  FunctionDefinition = 'FunctionDefinition',
  ClassDefinition = 'ClassDefinition',
  SingleLineComment = 'SingleLineComment',
  MultiLineComment = 'MultiLineComment',
  Program = 'Program'
}

export namespace AST {
  interface Node<T extends TokenType> {
    type: T
  }

  interface ValueNode<T extends TokenType> {
    type: T,
    value: Token
  }

  interface StringValueNode<T extends TokenType> {
    type: T,
    value: string
  }

  interface OptionalValueNode<T extends TokenType> {
    type: T,
    value?: Token
  }

  interface IfStatementNode {
    type: TokenType.IfStatement,
    check: {
      type: string,
      left: any,
      right?: any
    },
    pass: Token[],
    fail?: Token[]
  }

  interface ArrayNode {
    type: TokenType.Array,
    elements: Token[]
  }

  interface AssignmentNode {
    type: TokenType.AssignmentOperator,
    name: string,
    value: Token
  }

  interface FunctionDefinitionNode {
    type: TokenType.FunctionDefinition,
    name: string,
    body: Token[],
    args: Token[]
  }

  interface FunctionArgumentsNode {
    type: TokenType.FunctionArguments,
    args: Token[]
  }

  interface ConsoleLogNode {
    type: TokenType.ConsoleLog,
    args: Token[]
  }

  interface ProgramNode {
    type: TokenType.Program,
    body: Token[]
  }

  type BasicTokens =
    StringValueNode<TokenType.Literal> |
    StringValueNode<TokenType.StringLiteral> |
    OptionalValueNode<TokenType.Return> |
    ValueNode<TokenType.ExportStatement> |
    ValueNode<TokenType.ImportStatement> |
    ValueNode<TokenType.ImportAsStatement> |
    ValueNode<TokenType.ExportStatement> |
    Node<TokenType.LineBreak>

  type ComplexTokens =
    ProgramNode |
    IfStatementNode |
    ArrayNode |
    AssignmentNode |
    FunctionDefinitionNode |
    FunctionArgumentsNode |
    ConsoleLogNode |
    ProgramNode

  export type Token = BasicTokens | ComplexTokens
}

export namespace Tokenizer {
  export type TokenString =
  'twas' |
  'it required' |
  'transmute' |
  'shazam' |
  'fancy that' |
  'terminus' |
  'summon' |
  'albeit' |
  'scribe' |
  'incantation' |
  'archetype' |
  'named' |
  'called' |
  'and' |
  'an' |
  'a' |
  '\n'

  interface TypeNode<T extends TokenType> {
    type: T
  }

  interface ValueNode<T extends TokenType> extends TypeNode<T> {
    value: string
  }

  interface ValuesNode<T extends TokenType> extends TypeNode<T> {
    values: string[]
  }

  export type Token =
    TypeNode<TokenType.Word> |
    TypeNode<TokenType.LineBreak> |
    TypeNode<TokenType.AssignmentOperator> |
    TypeNode<TokenType.Definition> |
    TypeNode<TokenType.DefinitionFinish> |
    TypeNode<TokenType.Return> |
    TypeNode<TokenType.ArrayStart> |
    TypeNode<TokenType.ArrayEnd> |
    ValueNode<TokenType.ImportStatement> |
    TypeNode<TokenType.FunctionArguments> |
    TypeNode<TokenType.IfStatement> |
    TypeNode<TokenType.ElseStatement> |
    TypeNode<TokenType.ConsoleLog> |
    TypeNode<TokenType.FunctionDefinition> |
    TypeNode<TokenType.ClassDefinition> |
    TypeNode<TokenType.ImportStatement> |
    TypeNode<TokenType.ImportAsStatement> |
    TypeNode<TokenType.ExportStatement> |
    ValueNode<TokenType.Literal> |
    ValueNode<TokenType.StringLiteral> |
    ValueNode<TokenType.SingleLineComment> |
    ValuesNode<TokenType.MultiLineComment>
}

export namespace Transformed {
  interface ProgramNode {
    type: 'Program',
    body: Token[]
  }

  export interface FunctionDeclarationNode {
    type: 'FunctionDeclaration',
    id: unknown,
    params: Token[],
    defaults: unknown[],
    body: {
      type: 'BlockStatement',
      body?: Token[]
    }
  }

  interface ExpressionStatementNode {
    type: 'ExpressionStatement',
    expression: Token
  }

  interface MemberExpressionNode {
    type: 'MemberExpression',
    object: Token,
    property: Token,
    computed: boolean
  }

  interface ReturnStatement {
    type: 'ReturnStatement',
    argument?: Token
  }

  interface Identifier {
    type: 'Identifier',
    name: string
  }

  interface Literal {
    type: 'Literal',
    value: string,
    raw: string
  }

  export type Token =
    ProgramNode |
    FunctionDeclarationNode |
    ExpressionStatementNode |
    MemberExpressionNode |
    ReturnStatement |
    Identifier |
    Literal
}