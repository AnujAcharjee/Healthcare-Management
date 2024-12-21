import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import FilterAltTwoToneIcon from '@mui/icons-material/FilterAltTwoTone';
import { Autocomplete, TextField, Button, Paper, InputBase, Divider, SwipeableDrawer, Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import api from "../axios";
import { allStates, ownershipOptions, doctorSpecializations } from '../../utils/autoCompleteOptions';

function Search() {
    const [filter, setFilter] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [category, setCategory] = useState(null);
    const [ownership, setOwnerShip] = useState(null);
    const [state, setState] = useState(null);
    const [city, setCity] = useState(null);
    const [specialization, setSpecialization] = useState(null);
    const [name, setName] = useState(null);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setName(value);
        setIsTyping(true);
      };

    const handleSearch = async () => {
        const data = { ownership, state, city, specialization, name };
        console.log(data);

        try {
            const response = await api.get("/search", { params: data });
            console.log(response.data); // Handle the response data
        } catch (error) {
            console.error("Error during search:", error);
            // Handle the error appropriately
        }
    };

    const SearchInput = () => {
        return (
            <>
                <Paper component="form" sx={{ borderRadius: '30px' }} className="md:w-96 w-full flex justify-center align-middle mx-auto radius-md">
                    <IconButton type="button" sx={{ p: { xs: '5px', sm: '10px' } }} aria-label="filter" onClick={() => setFilter(!filter)}>
                        <FilterAltTwoToneIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                    </IconButton>
                    <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                    <InputBase
                        value={name}
                        onChange={handleInputChange}
                        onFocus={() => setIsTyping(true)}
                        onBlur={() => setIsTyping(false)}
                        className="w-full px-2 text-sm flex-1"
                        placeholder="Search by name"
                    />
                    <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                    <IconButton type="button" onClick={handleSearch} sx={{ p: { xs: '5px', sm: '10px' } }} aria-label="search">
                        <SearchIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                    </IconButton>
                </Paper>
            </>
        );
    };

    return (
        <>
            <SearchInput />
            <SwipeableDrawer
                anchor="top"
                open={filter}
                onClose={() => setFilter(false)}
                onOpen={() => setFilter(true)}
                PaperProps={{
                    sx: { borderRadius: '24px', width: { xs: '100%', sm: '40%' }, maxHeight: 'calc(100vh - 64px)', minHeight: '70vh', marginX: 'auto', marginTop: 1, padding: 4 },
                }}
            >
                <Box className="flex flex-col pb-10 space-y-2">
                    <SearchInput />

                    <div className='mx-auto space-y-2 border-2 px-2 py-5 rounded-md'>
                        <FormControl>
                            <FormLabel sx={{ marginX: 'auto' }} id="demo-radio-buttons-group-label">Select a category to search:</FormLabel>
                            <RadioGroup onClick={(e) => setCategory(e.target.value)} aria-labelledby="demo-radio-buttons-group-label" defaultValue="female" name="radio-buttons-group" row className='text-slate-500'>
                                <FormControlLabel value="Hospital" control={<Radio />} label="Hospital" />
                                <FormControlLabel value="Medicine" control={<Radio />} label="Medicine" />
                                <FormControlLabel value="Doctor" control={<Radio />} label="Doctor" />
                            </RadioGroup>
                        </FormControl>

                        {category && category === "Hospital" ? (
                            <>
                                <Autocomplete onChange={(e, value) => setOwnerShip(value)} disablePortal options={ownershipOptions} sx={{ width: 300 }} renderInput={(params) => <TextField {...params} label="Ownership" />} />
                                <Autocomplete onChange={(e, value) => setState(value)} disablePortal options={allStates} sx={{ width: 300 }} renderInput={(params) => <TextField {...params} label="State" />} />
                                <input onChange={(e) => setCity(e.target.value)} placeholder="City" className='mx-auto border-2 border-slate-300 rounded-md p-3 w-72' />
                            </>
                        ) : category === "Doctor" ? (
                            <>
                                <Autocomplete onChange={(e, value) => setSpecialization(value)} disablePortal options={doctorSpecializations} sx={{ width: 300 }} renderInput={(params) => <TextField {...params} label="Specialization" />} />
                            </>
                        ) : null}
                    </div>
                    <Button onClick={() => {
                        setFilter(false)
                        setOwnerShip(null)
                        setState(null)
                        setCity(null)
                        setSpecialization(null)
                        setName(null)
                        setCategory(null)
                    }}
                    >
                        Close
                    </Button>
                </Box>
            </SwipeableDrawer>
        </>
    );
}

export default Search;
