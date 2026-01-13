import json

# open file with all cards
path = r"C:\Users\Migue\Documents\GitHub\tcg-trader-mern\routeDataDumps\25122025_allCardsInfo.json"

allCardsFetchedFromTcgDex = []
with open(path,encoding="utf-8") as f:
    allCardsFetchedFromTcgDex = json.load(f)
    # print(d)

testSubsetPokemonFetchedCards = allCardsFetchedFromTcgDex[0:2]

# print(testSubsetPokemonFetchedCards[0])


# getting all keys from the object 
def setDisplayName(pokemonCard):
    # make name with name, set.name and id.

    pokemonCard['newDisplayName'] = f'{pokemonCard['name']} | {pokemonCard['set']['name']} | {pokemonCard['id']} '

def transform_card_structure(pokemonDatabase):
    # loop through cards
    # for currentCard in allCardsFetchedFromTcgDex:
    new_structure = {
    "availableCards": 0,
    "tradeUsers": {
            
            },
    "newDisplayName": "",
    }

# loop through cards
    for pokemoncard in pokemonDatabase:
        pokemoncard.update(new_structure)
        setDisplayName(pokemoncard)


    return pokemonDatabase

rarityArray =[]
def getRarityList():
    for pokemonCard in allCardsFetchedFromTcgDex:
        if pokemonCard['rarity'] not in rarityArray: 
            rarityArray.append(pokemonCard['rarity'])
    return rarityArray
cardSet=[]
def getSetNamesList():
    for pokemonCard in allCardsFetchedFromTcgDex:
        if pokemonCard['set']['name'] not in rarityArray: 
            rarityArray.append(pokemonCard['set']['name'])
    return rarityArray


print(getSetNamesList())

    
    



extrafields = {
        "newDisplayName": "Bulbasaur (Genetic Apex) (A1) ",
        "availableCards": 2,
        "tradeUsers": {
            "6915de68785ebb086aea353f": {
                "es": 1
            },
            "6915bdc1a03d8cdb3d287ac1": {
                "es": 1
            }
        },
        "id": "A1-001",
        "image": "https://assets.tcgdex.net/en/tcgp/A1/001",
        "localId": "001",
        "name": "Bulbasaur"
    
}

def saveToFile():
    # Source - https://stackoverflow.com/a
# Posted by phihag, modified by community. See post 'Timeline' for change history
# Retrieved 2025-12-25, License - CC BY-SA 4.0

    with open(r'C:\Users\Migue\Documents\GitHub\tcg-trader-mern\routeDataDumps\data.json', 'w') as f:
        json.dump(transform_card_structure(allCardsFetchedFromTcgDex), f)
# saveToFile()

# create new object for new structure
# feed in in a array inside a for loop
# map