import React, { useState, useCallback } from 'react';
import { Check, ChevronsUpDown, Minus, Plus, Trash2 } from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Text,
  useToasts,
  cn,
} from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import type {
  ProductRow,
  InvoiceProductItem,
} from '../../InvoiceFormScreen.types';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export interface ProductsSectionProps {
  availableProducts: ProductRow[];
  selectedProducts: InvoiceProductItem[];
  invoiceTotal: number;
  onAddProduct: (product: ProductRow) => void;
  onRemoveProduct: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onIncrementQuantity: (id: string) => void;
  onDecrementQuantity: (id: string) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  availableProducts,
  selectedProducts,
  invoiceTotal,
  onAddProduct,
  onRemoveProduct,
  onUpdateQuantity,
  onIncrementQuantity,
  onDecrementQuantity,
}) => {
  const { t } = useTranslation();
  const toast = useToasts();
  const [open, setOpen] = useState(false);

  const addedProductIds = new Set(selectedProducts.map((p) => p.productId));

  const handleSelectProduct = useCallback(
    (product: ProductRow) => {
      if (product.quantity === 0) {
        toast.error(t('invoice.products.outOfStock'));
        return;
      }
      onAddProduct(product);
      setOpen(false);
    },
    [onAddProduct, toast, t]
  );

  const handleQuantityInput = (
    id: string,
    raw: string,
    availableStock: number
  ) => {
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) return;
    if (parsed > availableStock) {
      toast.warning(
        t('invoice.products.stockExceeded', { max: String(availableStock) })
      );
    }
    onUpdateQuantity(id, parsed);
  };

  return (
    <div className="space-y-4">
      <Text variant="bodySmall" color="muted">
        {t('invoice.products')}
      </Text>

      {/* Product search / add */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
              'ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'text-muted-foreground'
            )}
          >
            {t('invoice.products.placeholder')}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          align="start"
        >
          <Command>
            <CommandInput placeholder={t('invoice.products.search')} />
            <CommandList>
              <CommandEmpty>{t('invoice.products.empty')}</CommandEmpty>
              <CommandGroup>
                {availableProducts.map((product) => {
                  const isAdded = addedProductIds.has(product.id);
                  const reserved =
                    selectedProducts.find((p) => p.productId === product.id)
                      ?.quantity ?? 0;
                  const effectiveStock = product.quantity - reserved;
                  const isOutOfStock = effectiveStock <= 0;
                  return (
                    <CommandItem
                      key={product.id}
                      value={product.name}
                      onSelect={() => {
                        if (!isAdded) handleSelectProduct(product);
                      }}
                      disabled={isAdded || isOutOfStock}
                      className={cn(
                        (isAdded || isOutOfStock) &&
                          'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4',
                          isAdded ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="flex-1">{product.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {isAdded
                          ? t('invoice.products.alreadyAdded')
                          : isOutOfStock
                            ? t('invoice.products.outOfStock')
                            : `${t('invoice.products.table.quantity')}: ${effectiveStock}`}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Products table */}
      {selectedProducts.length === 0 ? (
        <Text variant="caption" className="text-muted-foreground">
          {t('invoice.products.noProducts')}
        </Text>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[minmax(0,3fr)_80px_minmax(0,1fr)_minmax(0,1fr)_40px] gap-3 bg-muted/50 px-3 py-2">
            <Text variant="label" className="text-muted-foreground">
              {t('invoice.products.table.name')}
            </Text>
            <Text variant="label" className="text-muted-foreground text-center">
              {t('invoice.products.table.quantity')}
            </Text>
            <Text variant="label" className="text-muted-foreground text-right">
              {t('invoice.products.table.unitPrice')}
            </Text>
            <Text variant="label" className="text-muted-foreground text-right">
              {t('invoice.products.table.totalPrice')}
            </Text>
            <span />
          </div>

          {/* Table rows */}
          {selectedProducts.map((item, idx) => (
            <div
              key={item.id}
              className={cn(
                'grid grid-cols-[minmax(0,3fr)_80px_minmax(0,1fr)_minmax(0,1fr)_40px] gap-3 px-3 py-2 items-center',
                idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
              )}
            >
              {/* Name */}
              <Text variant="bodySmall" className="truncate font-medium">
                {item.name}
              </Text>

              {/* Quantity stepper */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => onDecrementQuantity(item.id)}
                  disabled={item.quantity <= 1}
                  className="flex size-6 items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="size-3" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityInput(
                      item.id,
                      e.target.value,
                      item.availableStock
                    )
                  }
                  className="w-8 text-center text-sm bg-transparent border-none outline-none"
                  aria-label={t('invoice.products.table.quantity')}
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => onIncrementQuantity(item.id)}
                  disabled={item.quantity >= item.availableStock}
                  className="flex size-6 items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="size-3" />
                </button>
              </div>

              {/* Unit price */}
              <Text
                variant="bodySmall"
                className="text-right text-foreground/80"
              >
                {formatPrice(item.unitPrice)}
              </Text>

              {/* Total price */}
              <Text variant="bodySmall" className="text-right font-medium">
                {formatPrice(item.totalPrice)}
              </Text>

              {/* Remove */}
              <button
                type="button"
                onClick={() => onRemoveProduct(item.id)}
                aria-label={t('invoice.products.remove')}
                className="flex size-7 items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}

          {/* Total row */}
          <div className="grid grid-cols-[minmax(0,3fr)_80px_minmax(0,1fr)_minmax(0,1fr)_40px] gap-3 bg-muted/30 px-3 py-2 border-t border-border">
            <Text
              variant="label"
              className="font-semibold col-span-3 text-right"
            >
              {t('invoice.form.total')}
            </Text>
            <Text variant="body" className="text-right font-bold text-primary">
              {formatPrice(invoiceTotal)}
            </Text>
            <span />
          </div>
        </div>
      )}
    </div>
  );
};
