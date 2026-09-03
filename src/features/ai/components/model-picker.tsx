import { Field, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    IMAGE_MODELS,
    TEXT_MODELS,
    type ImageModelId,
    type TextModelId,
} from '@/features/ai/shared/schema';
import { useEffect, useState } from 'react';

type Catalog = readonly { readonly id: string; readonly label: string }[];

/** Remembers the last pick per purpose in this browser. */
export function useRememberedModel<T extends string>(key: string, catalog: Catalog, fallback: T) {
    const [model, setModel] = useState<T>(fallback);
    useEffect(() => {
        try {
            const saved = window.localStorage.getItem(key);
            if (saved && catalog.some(item => item.id === saved)) setModel(saved as T);
        } catch {
            /* storage unavailable */
        }
    }, [key, catalog]);
    return [
        model,
        (next: T) => {
            setModel(next);
            try {
                window.localStorage.setItem(key, next);
            } catch {
                /* storage unavailable */
            }
        },
    ] as const;
}

export function ModelPicker({
    id,
    label = 'Model',
    catalog,
    value,
    onChange,
    compact = false,
}: {
    id: string;
    label?: string;
    catalog: Catalog;
    value: string;
    onChange: (value: string) => void;
    compact?: boolean;
}) {
    const items = catalog.map(item => ({ value: item.id, label: item.label }));
    return (
        <Field>
            {compact ? null : <FieldLabel htmlFor={id}>{label}</FieldLabel>}
            <Select
                items={items}
                onValueChange={next => {
                    if (next) onChange(next);
                }}
                value={value}>
                <SelectTrigger
                    aria-label={compact ? label : undefined}
                    className='w-full'
                    id={id}
                    size={compact ? 'sm' : 'default'}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {items.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </Field>
    );
}

export const textModelCatalog = TEXT_MODELS;
export const imageModelCatalog = IMAGE_MODELS;
export const defaultTextModel: TextModelId = TEXT_MODELS[0].id;
export const defaultImageModel: ImageModelId = IMAGE_MODELS[0].id;
