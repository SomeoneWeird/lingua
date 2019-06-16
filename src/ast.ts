import { Tokenizer, AST, TokenType } from './types'

function toAST (tokens: Tokenizer.Token[]): AST.Token {
  let currentIndex = 0

  // Filter out all 'Words', we don't care about them
  // for building our AST.
  tokens = tokens.filter(token => token.type !== TokenType.Word)

  function getDefinitionBody (): AST.Token[] {
    const definitionBody: AST.Token[] = []
    let nextNode = tokens[currentIndex]

    while (nextNode.type !== TokenType.DefinitionFinish) {
      const next = process()
      if (next) {
        definitionBody.push(next)
      }
      nextNode = tokens[currentIndex]
    }
  
    currentIndex++ // skip definition end

    return definitionBody
  }

  const checkTypes = [
    'EqualityCheck',
    'KindaCheck',
    'ContainsCheck',
    'ExistsCheck'
  ]

  const checkTypesRightSide = [
    'EqualityCheck',
    'KindaCheck',
    'ContainsCheck'
  ]

  function process (): AST.Token | undefined {
    let currentToken = tokens[currentIndex]

    if (
      currentToken.type === TokenType.Literal ||
      currentToken.type === TokenType.StringLiteral
    ) {
      currentIndex++
      return {
        type: currentToken.type,
        value: currentToken.value
      }
    }

    // Make sure this is before LineBreak check
    if (currentToken.type === TokenType.Return) {
      currentIndex++

      const out: AST.Token = {
        type: TokenType.Return
      }

      const nextToken = tokens[currentIndex]

      if (nextToken && nextToken.type !== TokenType.LineBreak) {
        out.value = process()
      }

      return out
    }

    if (
      currentToken.type === TokenType.LineBreak ||
      currentToken.type === TokenType.SingleLineComment ||
      currentToken.type === TokenType.MultiLineComment) {
      // we don't care about this here
      currentIndex++
      return
    }

    if (currentToken.type === TokenType.ImportStatement) {
      currentIndex++

      let next = process()

      if (!next) throw new Error('use statement missing literal assignment')

      if (next.type !== TokenType.StringLiteral) {
        throw new Error('use statement must use string')
      }

      return {
        type: TokenType.ImportStatement,
        value: next
      }
    }

    if (currentToken.type === TokenType.ExportStatement) {
      currentIndex++

      const next = process()

      if (!next || next.type !== TokenType.Literal) {
        throw new Error('must export literal')
      }

      return {
        type: TokenType.ExportStatement,
        value: next
      }
    }

    if (currentToken.type === TokenType.IfStatement) {
      currentIndex++

      const checkNode = process()

      if (!checkNode || !~checkTypes.indexOf(checkNode.type)) {
        throw new Error('if statement must contain check type')
      }

      const left = process()
      let right = null
      
      if (~checkTypesRightSide.indexOf(checkNode.type)) {
        right = process()
      }

      const out: AST.Token = {
        type: TokenType.IfStatement,
        check: {
          type: checkNode.type,
          left,
          right
        },
        pass: getDefinitionBody()
      }

      const currentToken = tokens[currentIndex]

      if (currentToken && currentToken.type === TokenType.ElseStatement) {
        currentIndex++
        out.fail = getDefinitionBody()
      }

      return out
    }

    if (currentToken.type === TokenType.AssignmentOperator) {
      // Skip this token
      currentIndex++

      const assignmentNameNode = tokens[currentIndex++]

      if (assignmentNameNode.type !== TokenType.Literal) {
        throw new Error('Variable name must be a literal')
      }

      const name = assignmentNameNode.value

      if (!assignmentNameNode || assignmentNameNode.type !== TokenType.Literal) {
        throw new Error('Must assign variable to literal')
      }

      const assignmentValueNode = process()

      if (!assignmentValueNode || assignmentValueNode.type !== TokenType.Literal) {
        throw new Error('Must assign value to variable')
      }

      return {
        type: TokenType.AssignmentOperator,
        name,
        value: assignmentValueNode
      }
    }

    if (currentToken.type === TokenType.FunctionArguments) {
      let nextNode = tokens[currentIndex++]

      const args: AST.Token[] = []

      while (nextNode.type !== TokenType.LineBreak) {
        let next = process()
        if (next) {
          args.push(next)
        }
        nextNode = tokens[currentIndex]
      }

      return {
        type: TokenType.FunctionArguments,
        args
      }
    }

    if (currentToken.type === TokenType.Definition) {
      // Skip this
      currentIndex++

      const typeNode = tokens[currentIndex++]

      if (typeNode.type === TokenType.FunctionDefinition) {
        const nameNode = tokens[currentIndex++]
        
        if (nameNode.type !== TokenType.Literal) {
          throw new Error('Assignment requires a literal')
        }

        const body = getDefinitionBody()

        if (body.length === 0) {
          throw new Error('Functions require bodies')
        }

        let args: AST.Token[] = []

        const first = body[0]

        // Check if we have any function arguments, and if we
        // do, then pull them out of the function body and use them.
        if (first.type === TokenType.FunctionArguments) {
          args = first.args
          body.shift()
        }

        return {
          type: TokenType.FunctionDefinition,
          name: nameNode.value,
          body,
          args
        }
      }

      // TODO: Handle variable assignment
    }

    if (currentToken.type === TokenType.ConsoleLog) {
      let nextNode = tokens[currentIndex++]

      const args: AST.Token[] = []

      while (nextNode.type !== TokenType.LineBreak) {
        let next = process()
        if (next) {
          args.push(next)
        }
        nextNode = tokens[currentIndex]
      }

      return {
        type: TokenType.ConsoleLog,
        args
      }
    }

    throw new Error(`Unknown token: ${currentToken.type}`)
  }

  const body: AST.Token[] = []

  while (currentIndex < tokens.length) {
    let next = process()
    if (next) {
      body.push(next)
    }
  }

  return {
    type: TokenType.Program,
    body
  }
}

export default toAST
