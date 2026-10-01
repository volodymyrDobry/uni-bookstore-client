import {Add, DeleteOutlined, Remove, SaveOutlined} from "@mui/icons-material";
import {Button, IconButton, Paper, Stack, TextField, Tooltip, Typography} from "@mui/material";
import {useState} from "react";
import type {BasketItem} from "../../../types/basketTypes.ts";

type BasketItemRowProps = {
    item: BasketItem;
    saving: boolean;
    removing: boolean;
    onSave: (bookId: number, quantity: number) => void;
    onRemove: (bookId: number) => void;
};

export function BasketItemRow({item, saving, removing, onSave, onRemove}: BasketItemRowProps) {
    const [quantity, setQuantity] = useState(item.quantity);
    const isChanged = quantity !== item.quantity;

    const changeQuantity = (value: number) => {
        setQuantity(Math.max(1, Math.floor(value)));
    };

    const updateQuantityFromInput = (value: string) => {
        const parsedValue = Number(value);
        if (Number.isFinite(parsedValue)) {
            changeQuantity(parsedValue);
        }
    };

    return <Paper variant="outlined" sx={{p: {xs: 1.5, sm: 2}}}>
        <Stack direction={{xs: "column", sm: "row"}} spacing={2} sx={{alignItems: {sm: "center"}}}>
            <Typography variant="subtitle1" sx={{flex: 1, fontWeight: 700}}>{item.title}</Typography>
            <Stack direction="row" spacing={0.5} sx={{alignItems: "center"}}>
                <IconButton
                    aria-label={`Decrease ${item.title} quantity`}
                    disabled={saving || removing || quantity <= 1}
                    onClick={() => changeQuantity(quantity - 1)}
                >
                    <Remove/>
                </IconButton>
                <TextField
                    label="Quantity"
                    type="number"
                    size="small"
                    value={quantity}
                    disabled={saving || removing}
                    slotProps={{htmlInput: {min: 1, step: 1}}}
                    onChange={(event) => updateQuantityFromInput(event.target.value)}
                    sx={{width: 106}}
                />
                <IconButton
                    aria-label={`Increase ${item.title} quantity`}
                    disabled={saving || removing}
                    onClick={() => changeQuantity(quantity + 1)}
                >
                    <Add/>
                </IconButton>
            </Stack>
            <Stack direction="row" spacing={0.5}>
                <Button
                    size="small"
                    startIcon={<SaveOutlined/>}
                    disabled={!isChanged || saving || removing}
                    onClick={() => onSave(item.bookId, quantity)}
                >
                    Save
                </Button>
                <Tooltip title="Remove from basket">
                    <span>
                        <IconButton
                            color="error"
                            aria-label={`Remove ${item.title}`}
                            disabled={saving || removing}
                            onClick={() => onRemove(item.bookId)}
                        >
                            <DeleteOutlined/>
                        </IconButton>
                    </span>
                </Tooltip>
            </Stack>
        </Stack>
    </Paper>;
}
