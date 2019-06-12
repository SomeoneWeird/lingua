import test from 'ava'

import tokenizer from '../../src/tokenizer'

test('Ignores whitespace', (t) => {
  t.is(tokenizer('    ').length, 0)
})
