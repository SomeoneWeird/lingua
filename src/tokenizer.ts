import * as util from 'util'

import { Tokenizer, TokenType } from './types'

export const TokenStringMap: Array<{
  key: Tokenizer.TokenString,
  value: Tokenizer.Token
}> = [
  { key: 'twas', value: { type: TokenType.Definition } },
  { key: 'it required', value: { type: TokenType.FunctionArguments } },
  { key: 'transmute', value: { type: TokenType.AssignmentOperator } },
  { key: 'incantation', value: { type: TokenType.FunctionDefinition } },
  { key: 'shazam', value: { type: TokenType.Return } },
  { key: 'fancy that', value: { type: TokenType.IfStatement } },
  { key: 'albeit', value: { type: TokenType.ElseStatement } },
  { key: 'terminus', value: { type: TokenType.DefinitionFinish } },
  { key: 'scribe', value: { type: TokenType.ConsoleLog } },
  { key: 'summon', value: { type: TokenType.ImportStatement } },
  { key: 'archetype', value: { type: TokenType.ClassDefinition } },
  { key: 'enchant', value: { type: TokenType.ClassFunctionDefinition } },
  { key: 'and', value: { type: TokenType.Word } },
  { key: 'an', value: { type: TokenType.Word } },
  { key: 'a', value: { type: TokenType.Word } },
  { key: 'named', value: { type: TokenType.Word } },
  { key: 'called', value: { type: TokenType.Word } },
  { key: 'with', value: { type: TokenType.Word } },
  { key: 'to', value: { type: TokenType.Word } },
  { key: '\n', value: { type: TokenType.LineBreak } }
]

export default function tokenizer (input: string): Tokenizer.Token[] {
  const out: Tokenizer.Token[] = []
  
  let currentPosition: number = 0

  function lookahead (match: RegExp, matchNext?: RegExp): string[] {
    const bucket: string[] = []

    while (true) {
      const nextIndex = currentPosition + bucket.length
      const nextToken = input[nextIndex]
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

  function lookaheadString (str: Tokenizer.TokenString): null | number {
    const _tokens = str.split('')
    for (let i = 0; i < _tokens.length; i++) {
      if (input[currentPosition + i] !== _tokens[i]) {
        return null
      }
    }
    return _tokens.length
  }

  while (currentPosition < input.length) {
    const currentToken: string = input[currentPosition]
    const nextToken: string = input[currentPosition + 1]

    if (currentToken === ' ') {
      // ignore
      currentPosition++
      continue
    }

    let matchedString: boolean = false

    TokenStringMap.forEach((pair) => {
      const { key, value } = pair

      const match = lookaheadString(key)

      if (!match) {
        return
      }

      out.push(value)
      currentPosition += match
      matchedString = true
    })

    if (matchedString) {
      continue
    }

    const literalRegex = /[a-zA-Z]/
    const literalRegexNext = /[a-zA-Z0-9\.]/

    if (literalRegex.test(currentToken)) {
      const literalBucket = lookahead(literalRegex, literalRegexNext)
      currentPosition += literalBucket.length
      out.push({
        type: TokenType.Literal,
        value: literalBucket.join('')
      })
      continue
    }

    // Start of StringLiteral
    if (currentToken === "'") {
      currentPosition++ // skip first '
      const bucket = lookahead(/[^']/)
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
        const bucket = lookahead(/[^\n]/)
        currentPosition += bucket.length
        out.push({
          type: TokenType.SingleLineComment,
          value: bucket.join('')
        })
        continue
      }
      if (nextToken === '*') {
        currentPosition += 2 // skip both /*
        const bucket = lookahead(/(?!\*\/)/)
        // that regex leaves us with */ still on the end, pop them off
        bucket.pop()
        bucket.pop()
        currentPosition += bucket.length
        out.push({
          type: TokenType.MultiLineComment,
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
