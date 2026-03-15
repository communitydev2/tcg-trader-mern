
from tcgdexsdk import TCGdex
import asyncio
import requests
import json
import pandas as pd
from io import StringIO
from array import array

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

# number of fields to add to new json
# 


# number of things to extract
'''
0 - Card Info
1 - Artists list
2 - rarity list
3 - set

'''
def filterCardDBToDesiredOutcomeIntoCsv(file_path,filterChoice,saveCsvName):
        # get data
        # filter pokemon names into csv
        with open(file_path, 'r', encoding="utf-8") as file:
            data = json.load(file)
        # print(data)
        filtered_data=[]
        for index, currentPokemon in enumerate(data):

            # with open(r"routeDataDumps/tests/filteredCardsTable.json", 'w', encoding="utf-8") as f:
            #     json.dump(data[0], f, ensure_ascii=False)
            # print(currentPokemon)
            if filterChoice==0:
                try:

                    filtered_object = {
                        "card_name":currentPokemon['name'],
                        "card_image" : currentPokemon['image'],
                        "card_local_id" : currentPokemon['id'],
                        "rarity_id" : currentPokemon['rarity'],
                        "set_id" : currentPokemon['set']['name'],

                        # "rarity" : currentPokemon['rarity'],
                    }
                    # oddish has no card image
                except:
                    filtered_object = {
                        "card_name":currentPokemon['name'],
                        "card_local_id" : currentPokemon['id'],
                        "rarity_id" : currentPokemon['rarity'],
                        "set_id" : currentPokemon['set']['name'],



                        # "rarity" : currentPokemon['rarity'],
                    }
            elif filterChoice ==1:
                # avoiding duplicate names
                if currentPokemon['illustrator'] not in filtered_data:
                    try:

                        filtered_object = {
                            "name":currentPokemon['illustrator'],

                            # "rarity" : currentPokemon['rarity'],
                        }
                    except:
                        filtered_object = {

                            # "rarity" : currentPokemon['rarity'],
                        }
            elif filterChoice ==2:
                    try:

                        filtered_object = {
                            "name":currentPokemon['rarity'],

                            # "rarity" : currentPokemon['rarity'],
                        }
                    except:
                        filtered_object = {

                            # "rarity" : currentPokemon['rarity'],
                        }
            elif filterChoice ==3:
                
                    # print(currentPokemon['set']['cardCount']['official'])
                    # print(currentPokemon['set']['cardCount']['total'])
                    # print(currentPokemon['set']['id'])
                    # print(currentPokemon['set']['name'])
                
                    try:

                        filtered_object = {
                            "official_card_count":currentPokemon['set']['cardCount']['official'],
                            "total_card_count":currentPokemon['set']['cardCount']['total'],
                            "set_code":currentPokemon['set']['id'],
                            "set_name":currentPokemon['set']['name'],

                            # "rarity" : currentPokemon['rarity'],
                        }
                    except:
                        filtered_object = {

                            # "rarity" : currentPokemon['rarity'],
                        }

    
            filtered_data.append(filtered_object)
        # with open(r"routeDataDumps/tests/filteredCardsTable.json", 'w', encoding="utf-8") as f:
        #     json.dump(filtered_data, f, ensure_ascii=False)

        # read in pandas
        e =json.dumps(filtered_data)



        data = pd.read_json(StringIO(e))
        #  remove duplicates in certain choices (illustrator, rarity)
        if filterChoice ==1 or filterChoice ==2 or filterChoice ==3 :
            data.drop_duplicates(subset=None, keep="first",inplace=True)
        # save in csv file
        data.to_csv(rf"C:/Users/Migue/Documents/community_dev/docker/{saveCsvName}.csv",index=False, mode="w")
        # with open(r"routeDataDumps/filteredCsvs/cardsTable.json", 'w', encoding="utf-8") as f:
            # json.dump(filtered_data, f, ensure_ascii=False)

# 

def assignSupabaseIdsToRarityAndSet(file_to_treat,rarity_table,set_table,new_csv_rarity_set_file_path

):
    # get file to treat
         # filter pokemon names into csv

    import csv
    file_untreated = []
    new_csv = []
    with open(file_to_treat, newline='') as file:
        read = csv.reader(file,delimiter=',',quotechar='|')
        for i, row in enumerate(read):
            # row 0 is the table names which is considered to be a list of length 1
            #so it has to be ignored
            if i==0:
                new_csv.append(row)
            if i != 0:
                file_untreated.append(row)
                # rarity
                rarity = row[3]
                #set 
                set = row[4]
                matching_rarity_id = ""
                matching_set_id = ""
                #  find matching value in rarity_table
                for i,v in enumerate(rarity_table):
                    if rarity == v['name']:
                        matching_rarity_id = v['rarity_id']
                #  find matching value in set_table
                for i,v in enumerate(set_table):
                    if set == v['set_name']:
                        matching_set_id = v['set_id']


                untouched_values = row[:3]
                new_row = untouched_values
                new_row.append(matching_rarity_id)
                new_row.append(matching_set_id)
                # print(new_row)
                new_csv.append(new_row)
                
                # break
        with open(new_csv_rarity_set_file_path, 'w', newline='') as csvfile: 
            spamwriter = csv.writer(csvfile, delimiter=',', quotechar='|', quoting=csv.QUOTE_MINIMAL) 
            spamwriter.writerows(new_csv)
    # print(data)

    filtered_data=[]

    # for index, currentPokemon in enumerate(data):
    #     print(currentPokemon)
    #     for i, current_rarity in enumerate(rarity_table): 
    #         if currentPokemon['rarity_id'] == current_rarity['name']:
    #             print(current_rarity['rarity_id'])


    # get matching value in table
    # swap value in new table




async def main():
    # get All set Names except Promos
    # allSetNames = await asyncio.gather(getNamesOfAllSets())
    # get All cards info from all sets
    # await asyncio.gather(getCardsOfAllSets(allSetNames))
    # ^ get All cards info from all sets (run for new set)
    # await asyncio.gather(getLatestSetCards(allSetNames))
    pass

def mergeallFilesIntoOne(files_path):
    import os
    import csv
    allWords =[]
    for filename in os.listdir(files_path):

        with open(os.path.join(files_path,filename),'r',encoding="utf-8") as f:
            allWords.append(f.read())
    e =json.dumps(allWords)

    data = pd.read_json(StringIO(e))
    #  remove duplicates in certain choices (illustrator, rarity)
    # save in csv file
    data.to_csv(rf"C:/Users/Migue/Documents/community_dev/docker/profanityWords.csv",index=False, mode="w")
        

if __name__ == "__main__":
    asyncio.run(main())
    file_path = r"C:/Users/Migue/Documents/GitHub/tcg-trader-mern/routeDataDumps/25122025_allCardsInfo.json"
    # file_path = r"C:\Users\Migue\Documents\GitHub\tcg-trader-mern\routeDataDumps\tests\allCardsLatestSet.json"
    # 0 gets cards table info
    # filterCardDBToDesiredOutcomeIntoCsv(file_path,0,"cardsTable")
    # 1 get artists list
    # filterCardDBToDesiredOutcomeIntoCsv(file_path,1,"artistsTable")
    # 2 get rarity
    # filterCardDBToDesiredOutcomeIntoCsv(file_path,2,"rarity")
    # 3 get set
    # filterCardDBToDesiredOutcomeIntoCsv(file_path,3,"set")

    # merge all profanity words
    # file_path = r"C:/Users/Migue/Documents/community_dev/Development/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words-master"
    # mergeallFilesIntoOne(file_path)
    # update these values when a new set comes
    rarity_table=[{"idx":0,"rarity_id":"6f112f77-85fa-4bc3-8a42-33759898f9b8","name":"Crown"},{"idx":1,"rarity_id":"f082796c-822c-4851-a039-d09f95b3dd3a","name":"Four Diamond"},{"idx":2,"rarity_id":"b3ec1026-17c9-42c8-b069-966c7ea3d0fe","name":"One Diamond"},{"idx":3,"rarity_id":"93181bc3-c921-4433-98cd-67db6d46864a","name":"One Shiny"},{"idx":4,"rarity_id":"48d4b93d-2999-4567-8d86-62206b8582c6","name":"One Star"},{"idx":5,"rarity_id":"c15def91-ccd8-4707-8ab8-9c07eeea3f4d","name":"Three Diamond"},{"idx":6,"rarity_id":"c55b6396-9283-4dc6-a2f9-5c74b1023c06","name":"Three Star"},{"idx":7,"rarity_id":"3812c945-69a7-47d6-bf09-e42bdcb8f428","name":"Two Diamond"},{"idx":8,"rarity_id":"8fcdc4ef-5e05-4fe9-ad52-aef42f4fd735","name":"Two Shiny"},{"idx":9,"rarity_id":"e6f683be-56ad-44aa-b196-bccff933ebb4","name":"Two Star"}]
    set_table=[{"idx":0,"set_id":"109f3ffc-96ea-4970-8e0b-8ad3a95c44c0","official_card_count":68,"total_card_count":86,"set_code":"A1a","set_name":"Mythical Island"},{"idx":1,"set_id":"1c960509-2605-4b3f-a6e0-39d8ef6724e1","official_card_count":140,"total_card_count":207,"set_code":"A2","set_name":"Space-Time Smackdown"},{"idx":2,"set_id":"2524d3b5-7406-4b94-91b6-8c0317c8812d","official_card_count":72,"total_card_count":111,"set_code":"A2b","set_name":"Shining Revelry"},{"idx":3,"set_id":"46787926-9f02-4262-abb2-d397d5eb373a","official_card_count":69,"total_card_count":103,"set_code":"B1a","set_name":"Crimson Blaze"},{"idx":4,"set_id":"4dc3bf50-5c21-4ad7-bb11-d867cb29aa1b","official_card_count":75,"total_card_count":96,"set_code":"A2a","set_name":"Triumphant Light"},{"idx":5,"set_id":"5b6a6123-7ebe-4d3c-aea9-e48d15c1e07b","official_card_count":71,"total_card_count":105,"set_code":"A4a","set_name":"Secluded Springs"},{"idx":6,"set_id":"6b4a93da-21a3-4e59-85d2-6e731e872cd2","official_card_count":69,"total_card_count":107,"set_code":"A3b","set_name":"Eevee Grove"},{"idx":7,"set_id":"98386032-0d9d-4011-90e1-a0596765c17d","official_card_count":155,"total_card_count":239,"set_code":"A3","set_name":"Celestial Guardians"},{"idx":8,"set_id":"b9620ac1-335f-463d-9bf7-8b04a01851d3","official_card_count":69,"total_card_count":103,"set_code":"A3a","set_name":"Extradimensional Crisis"},{"idx":9,"set_id":"cf352b83-8bb9-478b-a583-487ca6db5d2b","official_card_count":226,"total_card_count":286,"set_code":"A1","set_name":"Genetic Apex"},{"idx":10,"set_id":"d1bb1f2b-7410-4f1b-aca1-b381e4f876cf","official_card_count":226,"total_card_count":331,"set_code":"B1","set_name":"Mega Rising"},{"idx":11,"set_id":"d6499e7d-5fc4-4d28-844c-32d2f2c1b00e","official_card_count":161,"total_card_count":241,"set_code":"A4","set_name":"Wisdom of Sea and Sky"}]

    # replace rarity_id and set_id in cardsTable for their supabase id values
    file_path = r"C:\Users\Migue\Documents\community_dev\docker\cardsTable.csv"
    new_csv_rarity_set_file_path = r"C:\Users\Migue\Documents\community_dev\docker\cardsTable_supabase_rarity_set_ids.csv"
    # assignSupabaseIdsToRarityAndSet(file_path,rarity_table,set_table,new_csv_rarity_set_file_path)
    