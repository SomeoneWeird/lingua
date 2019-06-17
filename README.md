# Lingua

## Requirements
- Magic
- Happiness

### Language

#### Ignored words

There are certain words that are ignored so scripts can seem more english.

Included but not limited to:

| Word |
|------|
| and |
| an |
| a |
| named |
| called |
| with |
| to |

#### Class Definition

```
archetype Wizard
```

#### Variables

Define a variable named `fred` of type `frog`.

This type is ignored unless there is also a class defined of the same name, and if so, the variable will be instantiated as an instance of that class.

```
twas a frog named fred
```

#### Assignment

```
twas a frog named fred

transmute fred to 'F R E D'
```

#### Logging

```
scribe 'hello' myVariable
```

#### Functions

```
twas an incantation say
  it required a name and a sentence

  scribe name 'said:' sentence
terminus
```

#### Class Function

```
archetype Wizard

enchant Wizard with an incantation named jump
  it required a height

  scribe 'The wizard jumped to' height 'meters'
terminus
```

#### Return Value

```
shazam 'return this'
```
