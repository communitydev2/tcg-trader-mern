import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import api from "./api/axiosConfig.tsx";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { getPokemonCardsBackend } from "./api/axiosConfig.tsx";
import PokeCard from "./components/PokeCards/PokeCard.tsx";
import {  usePokemonCardStore } from "./store/pokemonCardsStore.tsx";
import LoginForm from "./components/accounts/LoginForm.tsx";


function App2() {
    const pokeCardStore = usePokemonCardStore();
    
  //  const { isPending, error, data } = useQuery({
  //   queryKey: ['repoData'],
  //   queryFn: () =>
  //     fetch('https://api.github.com/repos/TanStack/query').then((res) =>
  //       res.json(),
  //     ),
  // })
   const { isPending, error, data } = useQuery({
    queryKey: ['record'],
    queryFn: async() => {
      
      const response = await api.get("/record");
      pokeCardStore.setPokemonCards(response.data)
      return response

    }
  })

  if (isPending) return 'Loading...'
  // console.log(data)
  if (error) return 'An error has occurred: ' + error.message

  return (
    <div>


      <LoginForm/>
     {data.data.length > 0 && (
          
        // <PokeCard key ={pokemonCards[0].localId} card={pokemonCards[0]}/>

        
        //  
        <TableContainer>
      <Table sx={{minWidth:650}} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Card Name (Hover For Image)</TableCell>
            <TableCell align="left">No. of Available Cards</TableCell>
            <TableCell align="left">Cards Required For Trade</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        
          <PokeCard key ={data.data[0].localId} card={data.data[0]}/>
     
        {/* {data.data.map((pokemonCard) => (
          <PokeCard key ={pokemonCard.localId} card={pokemonCard}/>
        ))} */}
                  </TableBody>
      </Table>
      </TableContainer>

        )}

      </div>
  )
 
 
}
