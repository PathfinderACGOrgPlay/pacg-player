---@shape Error
---@field error string

---@shape TBD

---@shape CardInfo
---@field id string
---@field traits string[]
---@field count number|nil
---@field type string
---@field subDeck string
---@field name string

---@shape DeckInfo
---@field count number
---@field height number
---@field width number
---@field info CardInfo[]

---@shape CharacterDataCard
---@field deck string
---@field card string

---@shape CharacterData
---@field uid string
---@field name string
---@field systemId string | nil
---@field deckId string | nil
---@field characterId string | nil
---@field orgPlayId string | nil
---@field deckOne string | nil
---@field deckOneSubstitutions TBD | nil
---@field cardsOne CharacterDataCard[] | nil
---@field deckTwo string | nil
---@field deckTwoSubstitutions TBD | nil
---@field cardsTwo CharacterDataCard[] | nil
---@field deckThree string | nil
---@field deckThreeSubstitutions TBD | nil
---@field cardsThree CharacterDataCard[] | nil
---@field chronicleOrder string[] | nil
---@field skills {[string]: number} | nil
---@field cards {[string]: number} | nil
---@field powers {[string]: boolean} | nil
---@field handSize number | nil
---@field role number
---@field baseHash string
---@field roleHashes string[]
---@field dark boolean | nil

---@shape PowerText
---@field optional boolean
---@field text string
---@field id string
---@field fromBase boolean

---@shape Power
---@field texts PowerText[]
---@field id string
---@field fromBase boolean

---@shape HandSize
---@field base number
---@field add number

---@shape Proficiency
---@field name string
---@field optional boolean

---@shape Powers
---@field powers Power
---@field handSize HandSize
---@field proficiencies Proficiency | nil

---@shape NamedPowers
---@field name string
---@field powers Power
---@field handSize HandSize
---@field proficiencies Proficiency | nil

---@shape Skill
---@field die string
---@field order number | nil
---@field feats number
---@field skills {[string]: number}

---@shape CardListRow
---@field base number
---@field add number
---@field order number | nil

---@shape Character
---@field name string
---@field description string | nil
---@field removed boolean
---@field image string
---@field traits string[]
---@field skills {[string]: Skill}
---@field base Powers
---@field roles NamedPowers[]
---@field cardsList {[string]: CardListRow}
---@field favoredCardType string | nil
---@field extraCardsText {[string]: string}

---@shape CardsListDeck
---@field id string
---@field name string
---@field hash string
---@field logo string | nil
---@field subDecks string[]
---@field removed boolean
---@field hasCards boolean
---@field isClassDeck boolean | nil

---@shape Deck
---@field name string
---@field hash string
---@field logo string | nil
---@field subDecks string[]
---@field removed boolean
---@field hasCards boolean
---@field isClassDeck boolean | nil

---@shape CardsListItem
---@field deck CardsListDeck
---@field selected string[]
---@field cards DeckInfo[]

---@shape CardsList
---@field one CardsListItem
---@field two CardsListItem
---@field three CardsListItem

---@shape Role
---@field value number
---@field label string
---@field x number
---@field y number

---@shape Coord
---@field x number
---@field y number

---@shape CoordDictionary
---@field [string] Coord | CoordDictionary

---@shape TTSPlayerDeck
---@field characterData CharacterData
---@field wikiCharacter Character
---@field cards CardsList
---@field deck Deck
---@field checkboxes CoordDictionary
---@field roles Role[]