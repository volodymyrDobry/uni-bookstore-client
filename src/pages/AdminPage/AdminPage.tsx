import {
    Alert,
    Button,
    Chip,
    Container,
    FormControlLabel,
    Grid,
    IconButton,
    LinearProgress,
    MenuItem,
    Pagination,
    Paper,
    Snackbar,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {Add, EditOutlined, Inventory2Outlined, Remove, Visibility, VisibilityOff} from "@mui/icons-material";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {type FormEvent, useState} from "react";
import {createBook, setStock, updateBook} from "../../api/bookApi.ts";
import {
    GENRES,
    type Book,
    type CreateBookRequest,
    type Genre,
    type StockRequest,
    type UpdateBookDetailsRequest
} from "../../types/bookTypes.ts";
import {useCurrentUser} from "../../hooks/authHooks.ts";
import {useBooks} from "../../hooks/useBooks.ts";
import {formatGenre, formatPrice} from "../../utils/bookUtils.ts";
import {getErrorMessage} from "../../utils/errorUtils.ts";

const PAGE_SIZE = 10;

type BookForm = {
    title: string;
    description: string;
    author: string;
    genre: Genre;
    imageUrl: string;
    enabled: boolean;
    price: string;
    quantity: string;
};

const emptyBookForm: BookForm = {
    title: "",
    description: "",
    author: "",
    genre: "FANTASY",
    imageUrl: "",
    enabled: true,
    price: "",
    quantity: "0"
};

export function AdminPage() {
    const {auth, isAdmin} = useCurrentUser();
    const token = auth.user?.access_token ?? "";
    const queryClient = useQueryClient();
    const [form, setForm] = useState<BookForm>(emptyBookForm);
    const [selectedBook, setSelectedBook] = useState<Book>();
    const [stock, setStockForm] = useState<StockRequest>({quantity: 0, price: 1});
    const [visibleBooks, setVisibleBooks] = useState(true);
    const [page, setPage] = useState(0);
    const [formError, setFormError] = useState<string>();
    const [notice, setNotice] = useState<{severity: "success" | "error"; message: string}>();
    const catalogue = useBooks(isAdmin ? token : undefined, {page, size: PAGE_SIZE, enabled: visibleBooks});

    const refreshBooks = () => queryClient.invalidateQueries({queryKey: ["books", token]});

    const saveBook = useMutation({
        mutationFn: () => {
            const details: UpdateBookDetailsRequest = {
                title: form.title.trim(),
                description: form.description.trim(),
                author: form.author.trim(),
                genre: form.genre,
                imageUrl: form.imageUrl.trim(),
                enabled: form.enabled
            };

            if (selectedBook) {
                return updateBook(token, selectedBook.id, details);
            }

            const request: CreateBookRequest = {
                title: form.title.trim(),
                description: form.description.trim(),
                author: form.author.trim(),
                genre: form.genre,
                imageUrl: form.imageUrl.trim(),
                enabled: form.enabled,
                price: Number(form.price),
                quantity: Number(form.quantity)
            };
            return createBook(token, request);
        },
        onSuccess: async () => {
            setNotice({severity: "success", message: selectedBook ? "Book details updated." : "Book created."});
            resetForm();
            await refreshBooks();
        },
        onError: (error) => setNotice({
            severity: "error",
            message: getErrorMessage(error, "The book could not be saved.")
        })
    });

    const saveStock = useMutation({
        mutationFn: () => setStock(token, selectedBook!.id, stock),
        onSuccess: async (updatedStock) => {
            setStockForm({quantity: updatedStock.quantity, price: updatedStock.price});
            setSelectedBook((book) => book && book.id === updatedStock.bookId
                ? {...book, quantity: updatedStock.quantity, price: updatedStock.price}
                : book);
            setNotice({severity: "success", message: "Stock and price updated."});
            await refreshBooks();
        },
        onError: (error) => setNotice({
            severity: "error",
            message: getErrorMessage(error, "Stock and price could not be updated.")
        })
    });

    const updateVisibility = useMutation({
        mutationFn: ({bookId, enabled}: {bookId: number; enabled: boolean}) => updateBook(token, bookId, {enabled}),
        onSuccess: async (_, variables) => {
            setNotice({severity: "success", message: variables.enabled ? "Book is now visible." : "Book is now hidden."});
            setSelectedBook((book) => book && book.id === variables.bookId ? {...book, enabled: variables.enabled} : book);
            await refreshBooks();
        },
        onError: (error) => setNotice({
            severity: "error",
            message: getErrorMessage(error, "Book visibility could not be updated.")
        })
    });

    const updateForm = <K extends keyof BookForm>(key: K, value: BookForm[K]) => {
        setForm((current) => ({...current, [key]: value}));
    };

    const resetForm = () => {
        setSelectedBook(undefined);
        setForm(emptyBookForm);
        setStockForm({quantity: 0, price: 1});
        setFormError(undefined);
    };

    const selectBook = (book: Book) => {
        setSelectedBook(book);
        setForm({
            title: book.title,
            description: book.description,
            author: book.author,
            genre: book.genre,
            imageUrl: book.imageUrl,
            enabled: book.enabled,
            price: String(book.price ?? ""),
            quantity: String(book.quantity ?? 0)
        });
        setStockForm({quantity: book.quantity ?? 0, price: book.price ?? 1});
        setFormError(undefined);
    };

    const submitBook = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!form.title.trim() || !form.description.trim() || !form.author.trim() || !form.imageUrl.trim()) {
            setFormError("Title, author, description, and image URL are required.");
            return;
        }

        if (!selectedBook) {
            const price = Number(form.price);
            const quantity = Number(form.quantity);
            if (!Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
                setFormError("Initial price must be non-negative and initial stock must be a non-negative whole number.");
                return;
            }
        }

        setFormError(undefined);
        saveBook.mutate();
    };

    const submitStock = () => {
        if (!Number.isInteger(stock.quantity) || stock.quantity < 0 || !Number.isFinite(stock.price) || stock.price <= 0) {
            setNotice({severity: "error", message: "Stock must be a whole number and price must be greater than zero."});
            return;
        }
        saveStock.mutate();
    };

    return <Container maxWidth="xl" sx={{py: {xs: 3, md: 4}}}>
        <Stack spacing={3}>
            <AdminPageHeader onNewBook={resetForm}/>
            <Stack direction={{xs: "column", xl: "row"}} spacing={3} sx={{alignItems: "flex-start"}}>
                <Paper component="form" onSubmit={submitBook} variant="outlined" sx={{p: {xs: 2, md: 3}, flex: 1, width: "100%"}}>
                    <Stack spacing={2.25}>
                        <BookFormHeader editing={Boolean(selectedBook)} onCancel={resetForm}/>
                        <Grid container spacing={2}>
                            <Grid size={{xs: 12, md: 7}}>
                                <TextField label="Title" value={form.title} required fullWidth
                                           onChange={(event) => updateForm("title", event.target.value)}/>
                            </Grid>
                            <Grid size={{xs: 12, md: 5}}>
                                <TextField label="Author" value={form.author} required fullWidth
                                           onChange={(event) => updateForm("author", event.target.value)}/>
                            </Grid>
                            <Grid size={{xs: 12, md: 5}}>
                                <TextField label="Genre" select value={form.genre} fullWidth
                                           onChange={(event) => updateForm("genre", event.target.value as Genre)}>
                                    {GENRES.map((genre) => <MenuItem key={genre} value={genre}>{formatGenre(genre)}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid size={{xs: 12, md: 7}}>
                                <TextField label="Cover image URL" type="url" value={form.imageUrl} required fullWidth
                                           onChange={(event) => updateForm("imageUrl", event.target.value)}/>
                            </Grid>
                            <Grid size={12}>
                                <TextField label="Description" value={form.description} required fullWidth multiline minRows={4}
                                           onChange={(event) => updateForm("description", event.target.value)}/>
                            </Grid>
                        </Grid>
                        <FormControlLabel
                            control={<Switch checked={form.enabled} onChange={(event) => updateForm("enabled", event.target.checked)}/>}
                            label={form.enabled ? "Visible in the catalogue" : "Hidden from the catalogue"}
                        />
                        {!selectedBook && <Paper variant="outlined" sx={{p: 2, backgroundColor: "action.hover"}}>
                            <Stack spacing={1.5}>
                                <Typography variant="subtitle2">Initial stock and price</Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{xs: 12, sm: 6}}>
                                        <TextField label="Initial quantity" type="number" value={form.quantity} fullWidth required
                                                   slotProps={{htmlInput: {min: 0, step: 1}}}
                                                   onChange={(event) => updateForm("quantity", event.target.value)}/>
                                    </Grid>
                                    <Grid size={{xs: 12, sm: 6}}>
                                        <TextField label="Initial price" type="number" value={form.price} fullWidth required
                                                   slotProps={{htmlInput: {min: 0, step: 0.01}}}
                                                   onChange={(event) => updateForm("price", event.target.value)}/>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Paper>}
                        {formError && <Alert severity="warning">{formError}</Alert>}
                        <Stack direction="row" spacing={1}>
                            <Button type="submit" variant="contained" disabled={saveBook.isPending}>
                                {selectedBook ? "Save details" : "Create book"}
                            </Button>
                            {selectedBook && <Button type="button" color="inherit" onClick={resetForm}>Cancel</Button>}
                        </Stack>
                    </Stack>
                </Paper>
                {selectedBook && <Paper variant="outlined" sx={{p: {xs: 2, md: 3}, width: "100%", maxWidth: {xl: 420}}}>
                    <Stack spacing={2.25}>
                        <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
                            <Inventory2Outlined color="primary"/>
                            <Typography variant="h6" sx={{lineHeight: 1.25}}>Stock for {selectedBook.title}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            Adjust locally, then save one replacement stock request.
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
                            <Tooltip title="Remove one from stock">
                                <span><IconButton disabled={stock.quantity <= 0 || saveStock.isPending}
                                                  onClick={() => setStockForm((current) => ({...current, quantity: current.quantity - 1}))}><Remove/></IconButton></span>
                            </Tooltip>
                            <TextField label="Stock quantity" type="number" value={stock.quantity} fullWidth
                                       disabled={saveStock.isPending} slotProps={{htmlInput: {min: 0, step: 1}}}
                                       onChange={(event) => setStockForm((current) => ({
                                           ...current,
                                           quantity: Math.max(0, Math.floor(Number(event.target.value) || 0))
                                       }))}/>
                            <Tooltip title="Add one to stock">
                                <span><IconButton disabled={saveStock.isPending}
                                                  onClick={() => setStockForm((current) => ({...current, quantity: current.quantity + 1}))}><Add/></IconButton></span>
                            </Tooltip>
                        </Stack>
                        <TextField label="Price" type="number" value={stock.price} fullWidth disabled={saveStock.isPending}
                                   slotProps={{htmlInput: {min: 0.01, step: 0.01}}}
                                   onChange={(event) => setStockForm((current) => ({
                                       ...current,
                                       price: Math.max(0, Number(event.target.value) || 0)
                                   }))}/>
                        <Button variant="contained" disabled={saveStock.isPending} onClick={submitStock}>
                            Save stock and price
                        </Button>
                    </Stack>
                </Paper>}
            </Stack>
            <Paper variant="outlined" sx={{p: {xs: 2, md: 3}}}>
                <Stack spacing={2}>
                    <Stack direction={{xs: "column", sm: "row"}} spacing={2} sx={{alignItems: {sm: "center"}}}>
                        <Stack>
                            <Typography variant="h6">Catalogue books</Typography>
                            <Typography variant="body2" color="text.secondary">Showing {visibleBooks ? "visible" : "hidden"} books.</Typography>
                        </Stack>
                        <TextField
                            select
                            label="Show"
                            value={visibleBooks ? "visible" : "hidden"}
                            onChange={(event) => {
                                setVisibleBooks(event.target.value === "visible");
                                setPage(0);
                            }}
                            sx={{minWidth: 170, ml: {sm: "auto"}}}
                        >
                            <MenuItem value="visible">Visible books</MenuItem>
                            <MenuItem value="hidden">Hidden books</MenuItem>
                        </TextField>
                    </Stack>
                    {catalogue.isFetching && <LinearProgress/>}
                    {catalogue.error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => catalogue.refetch()}>Retry</Button>}>
                        {getErrorMessage(catalogue.error, "Books could not be loaded.")}
                    </Alert>}
                    <Stack spacing={1}>
                        {catalogue.data?.content.map((book) => <Paper key={book.id} variant="outlined" sx={{p: 1.5}}>
                            <Stack direction={{xs: "column", md: "row"}} spacing={1.5} sx={{alignItems: {md: "center"}}}>
                                <Stack spacing={0.25} sx={{flex: 1}}>
                                    <Typography sx={{fontWeight: 700}}>{book.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {book.author} · {formatGenre(book.genre)} · {formatPrice(book.price)} · {book.quantity ?? 0} in stock
                                    </Typography>
                                </Stack>
                                <Chip label={book.enabled ? "Visible" : "Hidden"} color={book.enabled ? "success" : "default"} size="small"/>
                                <Stack direction="row" spacing={1}>
                                    <Button size="small" startIcon={<EditOutlined/>} onClick={() => selectBook(book)}>Edit</Button>
                                    <Button
                                        size="small"
                                        color={book.enabled ? "warning" : "success"}
                                        startIcon={book.enabled ? <VisibilityOff/> : <Visibility/>}
                                        disabled={updateVisibility.isPending}
                                        onClick={() => updateVisibility.mutate({bookId: book.id, enabled: !book.enabled})}
                                    >
                                        {book.enabled ? "Hide" : "Show"}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>)}
                    </Stack>
                    {!catalogue.error && catalogue.data?.content.length === 0 && <Typography color="text.secondary" sx={{py: 3, textAlign: "center"}}>
                        No {visibleBooks ? "visible" : "hidden"} books found.
                    </Typography>}
                    {(catalogue.data?.totalPages ?? 0) > 1 && <Stack sx={{alignItems: "center", pt: 1}}>
                        <Pagination count={catalogue.data?.totalPages ?? 0} page={page + 1} showFirstButton showLastButton
                                    onChange={(_, nextPage) => setPage(nextPage - 1)}/>
                    </Stack>}
                </Stack>
            </Paper>
        </Stack>
        <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice(undefined)}>
            <Alert severity={notice?.severity} variant="filled" onClose={() => setNotice(undefined)}>
                {notice?.message}
            </Alert>
        </Snackbar>
    </Container>;
}

function AdminPageHeader({onNewBook}: {onNewBook: () => void}) {
    return <Stack direction={{xs: "column", sm: "row"}} spacing={1} sx={{alignItems: {sm: "center"}, justifyContent: "space-between"}}>
        <Stack>
            <Typography variant="h4" component="h1">Book administration</Typography>
            <Typography color="text.secondary">Create, update, hide, and manage inventory from one workspace.</Typography>
        </Stack>
        <Button variant="contained" startIcon={<Add/>} onClick={onNewBook}>New book</Button>
    </Stack>;
}

function BookFormHeader({editing, onCancel}: {editing: boolean; onCancel: () => void}) {
    return <Stack direction="row" sx={{alignItems: "center", justifyContent: "space-between"}}>
        <Typography variant="h6">{editing ? "Edit book details" : "Create a book"}</Typography>
        {editing && <Button size="small" color="inherit" onClick={onCancel}>Start a new book</Button>}
    </Stack>;
}
