
from tcgdexsdk import TCGdex
import asyncio
import requests
import json


tcgdex = TCGdex('en')


# allInfo = 
# print(allInfo)

# Source - https://stackoverflow.com/a/3013686
# Posted by Duncan, modified by community. See post 'Timeline' for change history
# Retrieved 2026-01-13, License - CC BY-SA 4.0

def filterbyvalue(seq, value):
   for el in seq:
       if el.attribute==value: yield el


async def getCardsOfAllSets(allSetNames):
    allCards = []
    # there's an array inside an array, so I need to look inside the second array

    for index, setName in enumerate(allSetNames[0]): 
        # get all cards for this set
        currentSetCards = requests.get(f"https://api.tcgdex.net/v2/en/sets/{setName}").json()
        # print(currentSetCards)
        for card in currentSetCards['cards']:
            # get all card detailed Info from each card url
            allCards.append(requests.get(f"https://api.tcgdex.net/v2/en/cards/{card['id']}").json())
            
            # allCards.append(requests.get(f"https://api.tcgdex.net/v2/en/cards/{card['id']}").content.json())
            # ensure ascii allows accents are decoded
    # with open(r"routeDataDumps/tests/allCardsDetailedInfo.json", 'w', encoding="utf-8") as f:
    #     json.dump(allCards, f, ensure_ascii=False)
        # with open(r"routeDataDumps/tests/allCardsDetailedInfo.json", 'a', encoding="utf-8-sig") as f:
        
    return allCards

async def getLatestSetCards(allSetNames):
    latestSet = allSetNames[0][-1]
    latestSetCards = []
    currentSetCards = requests.get(f"https://api.tcgdex.net/v2/en/sets/{latestSet}").json()
    for card in currentSetCards['cards']:
        # get all card detailed Info from each card url
        latestSetCards.append(requests.get(f"https://api.tcgdex.net/v2/en/cards/{card['id']}").json())
    with open(r"routeDataDumps/tests/allCardsLatestSet.json", 'w', encoding="utf-8") as f:
        json.dump(latestSetCards, f, ensure_ascii=False)
    
    



async def getNamesOfAllSets():
    # gets names of all sets (getting ids instead because of fetching set Names)
    setNames =  requests.get('https://api.tcgdex.net/v2/en/series/tcgp').json()
    # print to file
    setNamesList = []
    # getting list of ALL set Names
    for index, setName in enumerate(setNames['sets']):
        setNamesList.append(setNames['sets'][index]['id'])
    # filter out Promos-A P-A in ids
    setNamesList.remove("P-A")



    # card = await tcgdex.fetchSets('tcgp')
    # print(card.text)
    return setNamesList

#   // getNamesOfAllSets()
#   async function getNamesOfAllCardsOfAllSets(){
#     const allSets = await getNamesOfAllSets();
#     const ids = allSets.map(set => set.id);
#     // remove P-A
#     const filterId = ids.filter(set => set != "P-A") 
#     // console.log(filterId)
#     // will store all cards from loop
#     const allCards = []
#     let setNo = 5
#     // let currentSetCards = await tcgdex.fetchCards(allSets[setNo]);
#     // fs.writeFileSync("set"+setNo+".json", JSON.stringify(currentSetCards, null, 2), "utf8");
    
#     for(let i=0;i<filterId.length; i++){
#       let currentSetCards = await tcgdex.fetchCards(filterId[i]);
#       allCards.push(currentSetCards);
#     }
#     // console.log(allCards.flat(Infinity).length)
#     // console.log(allCards.length)
#     fs.writeFileSync("tcg-pocket-cards2.json", JSON.stringify(allCards, null, 2), "utf8");
#     return allCards.flat(Infinity);
#   }
#   // getNamesOfAllSets();
  
#   async function addExtraFieldsToEachPokemonCard(){
#     const allCardsAllSets = await getNamesOfAllCardsOfAllSets();
    
#     const allSetsInfo = await getNamesOfAllSets();
#     const filterPromo = allSetsInfo.filter(set => set.id != "P-A") 
#     const newFilteredCards = [];
#     // console.log(allCardsAllSets[500])
#     for(let i=0;i<allCardsAllSets.length;i++){
#       // console.log(allCardsAllSets[i])
#       let currentCardSetInfo = await determineCardSet(allCardsAllSets[i],filterPromo) 
#       let newDisplayName = `${allCardsAllSets[i].name} (${currentCardSetInfo[0].name}) (${currentCardSetInfo[0].id}) `
#       let availableCards = 0;
#       let tradeUsers = [];
#       let cardNewFields = {
#         newDisplayName,
#         availableCards,
#         tradeUsers,
#         ...allCardsAllSets[i],
        
#       }
#       newFilteredCards.push(cardNewFields)
      
#     }
    
    
    
#     fs.writeFileSync("tcg-pocket-cards4.json", JSON.stringify(newFilteredCards, null, 2), "utf8");
#     console.log(newFilteredCards)
#   }
  
#   async function determineCardSet(cardInfo,setInfo){
    
#     // get first part of split in -
#     // console.log(cardInfo)
#     let cardSet = cardInfo.id.split("-")[0]
#     let setname = setInfo.filter(set => set.id == cardSet);
#     // console.log(setname[0].name)
#     return setname;
#   }
  
async def main():
    # get All set Names except Promos
    allSetNames = await asyncio.gather(getNamesOfAllSets())
    # get All cards info from all sets
    # await asyncio.gather(getCardsOfAllSets(allSetNames))
    # get All cards info from all sets
    await asyncio.gather(getLatestSetCards(allSetNames))
if __name__ == "__main__":
    asyncio.run(main())