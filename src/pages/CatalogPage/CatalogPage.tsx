import {
    Alert,
    Box,
    Button,
    Container,
    Grid,
    LinearProgress,
    MenuItem,
    Pagination,
    Paper,
    Skeleton,
    Snackbar,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {RestartAlt, Search} from "@mui/icons-material";
import {type FormEvent, useMemo, useState} from "react";
import {useCurrentUser} from "../../hooks/authHooks.ts";
import {useBooks} from "../../hooks/useBooks.ts";
import {useBasket} from "../../hooks/useBasket.ts";
import {GENRES, type BookFilters, type Genre} from "../../types/bookTypes.ts";
import {BookCard} from "../../components/Book/BookCard.tsx";
import {getErrorMessage} from "../../utils/errorUtils.ts";

const PAGE_SIZE = 12;
const initialFilters: BookFilters = {page: 0, size: PAGE_SIZE, enabled: true};

type FilterForm = {
    title: string;
    author: string;
    genre: Genre | "";
    minPrice: string;
    maxPrice: string;
};

const initialFilterForm: FilterForm = {title: "", author: "", genre: "", minPrice: "", maxPrice: ""};

export function CatalogPage() {
    const {auth} = useCurrentUser();
    const [filters, setFilters] = useState<BookFilters>(initialFilters);
    const [filterForm, setFilterForm] = useState<FilterForm>(initialFilterForm);
    const [filterError, setFilterError] = useState<string>();
    const [notice, setNotice] = useState<{severity: "success" | "error"; message: string}>();
    const books = useBooks(auth.user?.access_token, filters);
    const basket = useBasket(auth.user?.access_token);
    const totalBooksLabel = useMemo(() => {
        const total = books.data?.totalElements;
        return total === undefined ? "Browse the catalogue" : `${total} book${total === 1 ? "" : "s"} found`;
    }, [books.data?.totalElements]);

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const minPrice = filterForm.minPrice === "" ? undefined : Number(filterForm.minPrice);
        const maxPrice = filterForm.maxPrice === "" ? undefined : Number(filterForm.maxPrice);

        if ((minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0))
            || (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0))) {
            setFilterError("Price filters must be non-negative numbers.");
            return;
        }
        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
            setFilterError("The minimum price cannot exceed the maximum price.");
            return;
        }

        setFilterError(undefined);
        setFilters({
            title: filterForm.title.trim() || undefined,
            author: filterForm.author.trim() || undefined,
            genre: filterForm.genre || undefined,
            minPrice,
            maxPrice,
            page: 0,
            size: PAGE_SIZE,
            enabled: true
        });
    };

    const resetFilters = () => {
        setFilterForm(initialFilterForm);
        setFilterError(undefined);
        setFilters(initialFilters);
    };

    const addToBasket = (bookId: number, quantity: number) => {
        basket.add.mutate({bookId, quantity}, {
            onSuccess: () => setNotice({severity: "success", message: "Book added to your basket."}),
            onError: (error) => setNotice({
                severity: "error",
                message: getErrorMessage(error, "The book could not be added to your basket.")
            })
        });
    };

    return <Container maxWidth="xl" sx={{py: {xs: 3, md: 4}}}>
        <Stack spacing={3}>
            <Box>
                <Typography variant="h4" component="h1">Books</Typography>
                <Typography color="text.secondary">{totalBooksLabel}</Typography>
            </Box>
            <Paper component="form" onSubmit={applyFilters} variant="outlined" sx={{p: {xs: 2, md: 2.5}}}>
                <Stack spacing={2}>
                    <Stack direction={{xs: "column", lg: "row"}} spacing={2}>
                        <TextField
                            label="Search by title"
                            value={filterForm.title}
                            onChange={(event) => setFilterForm((current) => ({...current, title: event.target.value}))}
                            fullWidth
                        />
                        <TextField
                            label="Author"
                            value={filterForm.author}
                            onChange={(event) => setFilterForm((current) => ({...current, author: event.target.value}))}
                            fullWidth
                        />
                        <TextField
                            select
                            label="Genre"
                            value={filterForm.genre}
                            onChange={(event) => setFilterForm((current) => ({
                                ...current,
                                genre: event.target.value as Genre | ""
                            }))}
                            sx={{minWidth: {lg: 190}}}
                        >
                            <MenuItem value="">All genres</MenuItem>
                            {GENRES.map((genre) => <MenuItem key={genre} value={genre}>
                                {genre.replaceAll("_", " ")}
                            </MenuItem>)}
                        </TextField>
                    </Stack>
                    <Stack direction={{xs: "column", sm: "row"}} spacing={2} sx={{alignItems: {sm: "center"}}}>
                        <TextField
                            label="Minimum price"
                            type="number"
                            value={filterForm.minPrice}
                            slotProps={{htmlInput: {min: 0, step: 0.01}}}
                            onChange={(event) => setFilterForm((current) => ({...current, minPrice: event.target.value}))}
                        />
                        <TextField
                            label="Maximum price"
                            type="number"
                            value={filterForm.maxPrice}
                            slotProps={{htmlInput: {min: 0, step: 0.01}}}
                            onChange={(event) => setFilterForm((current) => ({...current, maxPrice: event.target.value}))}
                        />
                        <Stack direction="row" spacing={1} sx={{ml: {sm: "auto"}}}>
                            <Button type="button" color="inherit" startIcon={<RestartAlt/>} onClick={resetFilters}>
                                Reset
                            </Button>
                            <Button type="submit" variant="contained" startIcon={<Search/>}>
                                Apply filters
                            </Button>
                        </Stack>
                    </Stack>
                    {filterError && <Alert severity="warning">{filterError}</Alert>}
                </Stack>
            </Paper>
            {books.isFetching && <LinearProgress/>}
            {books.error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => books.refetch()}>Retry</Button>}>
                {getErrorMessage(books.error, "Books could not be loaded.")}
            </Alert>}
            {books.isLoading ? <Grid container spacing={2}>
                {Array.from({length: PAGE_SIZE}, (_, index) => <Grid key={index} size={{xs: 12, md: 6, lg: 4}}>
                    <Skeleton variant="rounded" height={280}/>
                </Grid>)}
            </Grid> : <>
                <Grid container spacing={2}>
                    {books.data?.content.map((book) => <Grid key={book.id} size={{xs: 12, md: 6, lg: 4}}>
                        <BookCard
                            book={book}
                            adding={basket.add.isPending && basket.add.variables?.bookId === book.id}
                            onAdd={addToBasket}
                        />
                    </Grid>)}
                </Grid>
                {!books.error && books.data?.content.length === 0 && <Paper variant="outlined" sx={{p: 5, textAlign: "center"}}>
                    <Typography variant="h6">No books match these filters.</Typography>
                    <Typography color="text.secondary" sx={{mt: 0.5}}>Try broadening your search or clearing a filter.</Typography>
                </Paper>}
                {(books.data?.totalPages ?? 0) > 1 && <Stack sx={{alignItems: "center", pt: 1}}>
                    <Pagination
                        count={books.data?.totalPages ?? 0}
                        page={filters.page + 1}
                        showFirstButton
                        showLastButton
                        onChange={(_, page) => setFilters((current) => ({...current, page: page - 1}))}
                    />
                </Stack>}
            </>}
        </Stack>
        <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice(undefined)}>
            <Alert severity={notice?.severity} variant="filled" onClose={() => setNotice(undefined)}>
                {notice?.message}
            </Alert>
        </Snackbar>
    </Container>;
}
