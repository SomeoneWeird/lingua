import test from 'ava'

import tokenizer from '../../src/tokenizer'

import { TokenType } from '../../src/types'

const magic1Incantation = `
  twas an incantation named foobar
    it required a name and a location

    // scribe name
    // scribe location
    shazam five
  terminus
`

const magic2Incantation = `
  archetype Wizard

  enchant Wizard with an incantation named say
    it required a name and a sentence

    scribe 'Hello ' name ': ' sentence
  terminus

  twas a Wizard named Hagrid

  Hagrid cast say 'harry' 'youre a wizard now'
`

const magic = [
  {
    incantation: magic1Incantation,
    result: [
      { type: TokenType.LineBreak },
      { type: TokenType.Definition },
      { type: TokenType.Word },
      { type: TokenType.FunctionDefinition },
      { type: TokenType.Literal, value: 'named' },
      { type: TokenType.Literal, value: 'foobar' },
      { type: TokenType.LineBreak },
      { type: TokenType.FunctionArguments },
      { type: TokenType.Word },
      { type: TokenType.Literal, value: 'name' },
      { type: TokenType.Word },
      { type: TokenType.Word },
      { type: TokenType.Literal, value: 'location' },
      { type: TokenType.LineBreak },
      { type: TokenType.LineBreak },
      { type: TokenType.ConsoleLog },
      { type: TokenType.Literal, value: 'name' },
      { type: TokenType.LineBreak },
      { type: TokenType.ConsoleLog },
      { type: TokenType.Literal, value: 'location' },
      { type: TokenType.LineBreak },
      { type: TokenType.Return },
      { type: TokenType.Literal, value: 'five' },
      { type: TokenType.LineBreak },
      { type: TokenType.DefinitionFinish },
      { type: TokenType.LineBreak }
    ]
  },
  {
    incantation: magic2Incantation,
    result: [
      { type: TokenType.LineBreak },
      { type: TokenType.ClassDefinition },
      { type: TokenType.Literal, value: 'Wizard' },
      { type: TokenType.LineBreak },
      { type: TokenType.LineBreak },
      { type: TokenType.Literal, value: 'enchant' },
      { type: TokenType.Literal, value: 'Wizard' },
      { type: TokenType.Literal, value: 'with' },
      { type: TokenType.Word },
      { type: TokenType.FunctionDefinition },
      { type: TokenType.Literal, value: 'named' },
      { type: TokenType.Literal, value: 'say' },
      { type: TokenType.LineBreak },
      { type: TokenType.FunctionArguments },
      { type: TokenType.Word },
      { type: TokenType.Literal, value: 'name' },
      { type: TokenType.Word },
      { type: TokenType.Word },
      { type: TokenType.Literal, value: 'sentence' },
      { type: TokenType.LineBreak },
      { type: TokenType.LineBreak },
      { type: TokenType.ConsoleLog },
      { type: TokenType.StringLiteral, value: 'Hello ' },
      { type: TokenType.Literal, value: 'name' },
      { type: TokenType.StringLiteral, value: ': ' },
      { type: TokenType.Literal, value: 'sentence' },
      { type: TokenType.LineBreak },
      { type: TokenType.DefinitionFinish },
      { type: TokenType.LineBreak },
      { type: TokenType.LineBreak },
      { type: TokenType.Definition },
      { type: TokenType.Word },
      { type: TokenType.Literal, value: 'Wizard' },
      { type: TokenType.Literal, value: 'named' },
      { type: TokenType.Literal, value: 'Hagrid' },
      { type: TokenType.LineBreak },
      { type: TokenType.LineBreak },
      { type: TokenType.Literal, value: 'Hagrid' },
      { type: TokenType.Literal, value: 'cast' },
      { type: TokenType.Literal, value: 'say' },
      { type: TokenType.StringLiteral, value: 'harry' },
      { type: TokenType.StringLiteral, value: 'youre a wizard now' },
      { type: TokenType.LineBreak }
    ]
  }
]

magic.forEach((script, index) => {
  test(`Magic Script ${index}`, (t) => {
    t.deepEqual(script.result, tokenizer(script.incantation))
  })
})
