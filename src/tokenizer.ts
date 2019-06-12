import * as util from 'util'

interface Token {
  type: string,
  value?: string
  values?: string[]
}

// TODO: remove spaces, match either space or linebreak at end
export enum TokenString {
  Twas = 'twas ',
  ItRequired = 'it required ',
  Transmute = 'transmute ',
  Shazam = 'shazam ',
  FancyThat = 'fancy that ',
  Terminus = 'terminus ',
  Summon = 'summon ',
  Albeit = 'albiet ',
  Scribe = 'scribe ',
  Incantation = 'incantation ',
  Archetype = 'archetype '
}

export enum TokenWord {
  a = 'a ',
  an = 'an ',
  and = 'and ',
  named = 'named '
}

export enum TokenType {
  Word = 'Word',
  LineBreak = 'LineBreak',
  AssignmentOperator = 'AssignmentOperator',
  Definition = 'Definition',
  DefinitionPoint = 'DefinitionPoint',
  Return = 'Return',
  ArrayStart = 'ArrayStart',
  ArrayEnd = 'ArrayEnd',
  ImportStatement = 'ImportStatement',
  FunctionArguments = 'FunctionArguments',
  IfStatement = 'IfStatement',
  ElseStatement = 'ElseStatement',
  ConsoleLog = 'ConsoleLog',
  Literal = 'Literal',
  StringLiteral = 'StringLiteral',
  FunctionDefinition = 'FunctionDefinition',
  ClassDefinition = 'ClassDefinition'
}

export default function tokenizer (input: string): Token[] {
  const out: Token[] = []
  
  let currentPosition: number = 0

  function lookahead (match: RegExp, matchNext?: RegExp): string[] {
    const bucket: string[] = []

    while (true) {
      const nextIndex = currentPosition + bucket.length
      let nextToken = input[nextIndex]
      if (!nextToken) {
        break
      }
      let m: string | RegExp = match
      if (matchNext && bucket.length) {
        m = matchNext
      }
      if (m && !m.test(nextToken)) {
        break
      }
      bucket.push(nextToken)
    }

    return bucket
  }

  function lookaheadString (str: TokenString | TokenWord, add: boolean, type: string, value?: string): boolean {
    let _tokens = str.split('')
    for (let i = 0; i < _tokens.length; i++) {
      if (input[currentPosition + i] !== _tokens[i]) {
        return false
      }
    }
    if (add) {
      const obj: Token = { type }
      
      if (value) obj.value = value

      out.push(obj)
      currentPosition += _tokens.length
    }
    return true
  }

  function singleAdd (match: string, type: string, value?: string) {
    let currentToken = input[currentPosition]
    if (currentToken !== match) {
      return false
    }
    let tmp: {
      type: string,
      value?: string
    } = {
      type
    }
    if (value) {
      tmp.value = value
    }
    out.push(tmp)
    currentPosition++
    return true
  }

  while (currentPosition < input.length) {
    let currentToken: string = input[currentPosition]
    let nextToken: string = input[currentPosition + 1]

    if (currentToken === ' ') {
      // ignore
      currentPosition++
      continue
    }

    // Linebreaks
    if (singleAdd('\n', TokenType.LineBreak)) continue

    // Assignments
    if (lookaheadString(TokenString.Twas, true, TokenType.Definition)) continue
    if (lookaheadString(TokenString.ItRequired, true, TokenType.FunctionArguments)) continue
    if (lookaheadString(TokenString.Transmute, true, TokenType.AssignmentOperator)) continue
    if (lookaheadString(TokenString.Incantation, true, TokenType.FunctionDefinition)) continue
    if (lookaheadString(TokenString.Shazam, true, TokenType.Return)) continue

    if (lookaheadString(TokenString.FancyThat, true, TokenType.IfStatement)) continue
    if (lookaheadString(TokenString.Albeit, true, TokenType.ElseStatement)) continue

    if (lookaheadString(TokenString.Terminus, true, TokenType.DefinitionPoint, 'end')) continue
    
    if (lookaheadString(TokenString.Scribe, true, TokenType.ConsoleLog)) continue
    
    if (lookaheadString(TokenString.Summon, true, TokenType.ImportStatement)) continue

    if (lookaheadString(TokenString.Archetype, true, TokenType.ClassDefinition)) continue


    if (lookaheadString(TokenWord.and, true, TokenType.Word)) continue
    if (lookaheadString(TokenWord.an, true, TokenType.Word)) continue
    if (lookaheadString(TokenWord.a, true, TokenType.Word)) continue

    // if (singleAdd('[', TokenType.ArrayStart)) continue
    // if (singleAdd(']', TokenType.ArrayEnd)) continue
    
    let literalRegex = /[a-zA-Z]/
    let literalRegexNext = /[a-zA-Z0-9\.]/

    if (literalRegex.test(currentToken)) {
      let literalBucket = lookahead(literalRegex, literalRegexNext)
      currentPosition += literalBucket.length
      let str = literalBucket.join('')
      out.push({
        type: TokenType.Literal,
        value: str
      })
      continue
    }

    let numberLiteralRegex = /[0-9]/
    let numberLiteralRegexNext = /[0-9\.]/

    if (numberLiteralRegex.test(currentToken)) {
      let numberBucket = lookahead(numberLiteralRegex, numberLiteralRegexNext)
      currentPosition += numberBucket.length
      let type = 'NumberLiteral'
      let value = numberBucket.join('')
      if (~value.indexOf('.')) {
        type = 'FloatLiteral'
      }
      if (/\.$/.test(value)) {
        throw new Error('invalid character .')
      }
      out.push({
        type: type,
        value: value
      })
      continue
    }

    // Start of StringLiteral
    if (currentToken === "'") {
      currentPosition++ // skip first '
      let bucket = lookahead(/[^']/)
      currentPosition += bucket.length
      out.push({
        type: TokenType.StringLiteral,
        value: bucket.join('')
      })
      currentPosition++ // skip last '
      continue
    }

    if (currentToken === '/') {
      if (nextToken === '/') {
        currentPosition += 2 // skip both //
        let bucket = lookahead(/[^\n]/)
        currentPosition += bucket.length
        out.push({
          type: 'SingleLineComment',
          value: bucket.join('')
        })
        continue
      }
      if (nextToken === '*') {
        currentPosition += 2 // skip both /*
        let bucket = lookahead(/(?!\*\/)/)
        // that regex leaves us with */ still on the end, pop them off
        bucket.pop()
        bucket.pop()
        currentPosition += bucket.length
        out.push({
          type: 'MultiLineComment',
          values: bucket.join('').split('\n')
        })
        currentPosition += 2 // skip */
        continue
      }
    }

    throw new TypeError(`Unknown token: ${util.inspect(currentToken)}`)
  }

  return out
}
