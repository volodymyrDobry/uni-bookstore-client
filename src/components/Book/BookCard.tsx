import {AddShoppingCart} from "@mui/icons-material";
import {Button, Card, CardContent, CardMedia, Chip, CircularProgress, Stack, TextField, Typography} from "@mui/material";
import {useState} from "react";
import type {Book} from "../../types/bookTypes.ts";
import {formatGenre, formatPrice} from "../../utils/bookUtils.ts";

type BookCardProps = { book: Book; onAdd: (id: number, quantity: number) => void; adding: boolean };

export function BookCard({book, onAdd, adding}: BookCardProps) {
    const [quantity, setQuantity] = useState(1);
    const availableQuantity = Math.max(book.quantity ?? 0, 0);
    const isAvailable = availableQuantity > 0 && book.price !== null;

    const updateQuantity = (value: string) => {
        const parsedValue = Number(value);
        if (!Number.isFinite(parsedValue)) {
            return;
        }

        setQuantity(Math.min(availableQuantity, Math.max(1, Math.floor(parsedValue))));
    };

    return <Card sx={{display: "flex", height: "100%", minHeight: 280, overflow: "hidden"}}>
        <CardMedia
            component="img"
            image={book.imageUrl}
            alt={`Cover of ${book.title}`}
            sx={{width: {xs: 112, sm: 144}, objectFit: "cover", backgroundColor: "grey.100"}}
        />
        <CardContent sx={{display: "flex", flex: 1, minWidth: 0, p: 2.25, "&:last-child": {pb: 2.25}}}>
            <Stack spacing={1.1} sx={{width: "100%"}}>
                <Stack direction="row" spacing={1} sx={{alignItems: "flex-start", justifyContent: "space-between"}}>
                    <Typography variant="h6" component="h2" sx={{lineHeight: 1.25}}>{book.title}</Typography>
                    <Chip
                        label={isAvailable ? `${availableQuantity} available` : "Unavailable"}
                        color={isAvailable ? "success" : "default"}
                        size="small"
                    />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    {book.author} · {formatGenre(book.genre)}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{display: "-webkit-box", overflow: "hidden", WebkitBoxOrient: "vertical", WebkitLineClamp: 3}}
                >
                    {book.description}
                </Typography>
                <Typography sx={{mt: "auto", fontWeight: 700}} variant="subtitle1">
                    {formatPrice(book.price)}
                </Typography>
                <Stack direction={{xs: "column", sm: "row"}} spacing={1}>
                    <TextField
                        label="Quantity"
                        type="number"
                        size="small"
                        value={isAvailable ? quantity : 0}
                        disabled={!isAvailable || adding}
                        slotProps={{htmlInput: {min: 1, max: availableQuantity, step: 1}}}
                        onChange={(event) => updateQuantity(event.target.value)}
                        sx={{width: {xs: "100%", sm: 108}}}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={adding ? <CircularProgress size={16} color="inherit"/> : <AddShoppingCart/>}
                        disabled={!isAvailable || adding}
                        onClick={() => onAdd(book.id, quantity)}
                    >
                        {adding ? "Adding" : "Add to basket"}
                    </Button>
                </Stack>
            </Stack>
        </CardContent>
    </Card>;
}
