#


## requirements
- magic
- happiness

## Synonyms
original | our translation
-- | --
variable | rune
import | summon
export | _todo_
return | shazam
class | archetype
function | incantation
if | fancy that
then | futhermore
else | albiet
__ | enchant
terminus | _end statement_
twas | _declaration_
alter, transmute(d) | _assignement_
[variableName]: [type] | twas a [type] named [variableName] 
[variableName] = [value] | transmute [variableName] to [value]

## Ignored works

* i
* was


```js
  def fnName (name, string) {
    console.log(`Hello ${name}: ${string}`)
    return 5
  }

  twas an incantation named foobar
    it required a name and a location

    scribe `Hello ${name}: ${location}`
    shazam five
  terminus

  I cast foobar with my name which was 'harry potter' and my location, 'under the stairs'

  
```

```js
twas a rune named stick // -> let stick
transmute stick to five       // stick = 5
```

```
twere hieroglyphs named foo and baz // let foo, baz
```

```
there was a hieroglyph that twas a number that twas 5
```

```js
achetype Wizard

function Wizard {}
```

```js
enchant Summoner with an incantation named foobar
  it required a name and a string

  scribe `Hello ${name}: ${string}`
  shazam five
terminus


Summoner.prototype.foobar = (name, string) => {
  console.log(`Hello ${name}: ${string}`)
  return 5
}
```

```js
twere runes named foobar and foobaz
i transmuted foobar to five and altered foobaz to seven

fancy that, foobar was <blah> foobaz,
  <body>
albeit
  <body>
terminus
```

```js
achetype Wizard

enchant Wizard with an incantation named say
  it required a name, and a sentence

  scribe `Hello ${name}, ${sentence}`
terminus

twas a Wizard named Hagrid

Hagrid cast say `harry`, `you're a wizard now`
```
