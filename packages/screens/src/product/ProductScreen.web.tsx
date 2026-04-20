import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Building2,
  Tag,
  Hash,
  Info,
  ImageOff,
} from 'lucide-react';
import {
  SecondaryButton,
  PrimaryButton,
  Input,
  Table,
  Drawer,
  BottomSheet,
  Separator,
  Text,
} from '@automatize/ui/web';
import type { TableColumn } from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';
import { useResponsive } from '@automatize/ui/responsive';
import type { ProductScreenProps, ProductRow } from './ProductScreen.types';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

function matchesSearch(product: ProductRow, query: string): boolean {
  const q = query.toLowerCase();
  if (product.name.toLowerCase().includes(q)) return true;
  if (product.companyName?.toLowerCase().includes(q)) return true;
  if (product.info?.toLowerCase().includes(q)) return true;
  return false;
}

export const ProductScreen: React.FC<ProductScreenProps> = ({
  products,
  onAddProduct,
  onEditProduct,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(
    null
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim();
    if (!query) return products;
    return products.filter((product) => matchesSearch(product, query));
  }, [products, search]);

  const columns: TableColumn<ProductRow>[] = useMemo(
    () => [
      {
        key: 'name',
        header: t('product.table.name'),
        flex: 3,
        minWidth: 140,
        sortable: true,
        sortFn: (a, b) => a.name.localeCompare(b.name),
        render: (product) => (
          <span className="text-sm text-foreground font-medium truncate">
            {product.name}
          </span>
        ),
      },
      {
        key: 'quantity',
        header: t('product.table.quantity'),
        flex: 1,
        minWidth: 80,
        sortable: true,
        sortFn: (a, b) => a.quantity - b.quantity,
        render: (product) => (
          <span className="text-sm text-foreground/80 truncate">
            {product.quantity}
          </span>
        ),
      },
      {
        key: 'price',
        header: t('product.table.price'),
        flex: 2,
        minWidth: 100,
        sortable: true,
        sortFn: (a, b) => a.price - b.price,
        render: (product) => (
          <span className="text-sm text-foreground/80 truncate">
            {formatPrice(product.price)}
          </span>
        ),
      },
    ],
    [t]
  );

  const handleRowClick = (product: ProductRow) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  const handleEdit = () => {
    if (!selectedProduct) return;
    onEditProduct?.(selectedProduct);
    setSelectedProduct(null);
  };

  const detailContent = selectedProduct ? (
    <div className="space-y-6">
      {/* Photo */}
      {selectedProduct.photo ? (
        <div className="flex justify-center">
          <img
            src={selectedProduct.photo}
            alt={selectedProduct.name}
            className="w-full max-w-xs h-48 object-cover rounded-lg border border-border"
          />
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-full h-32 rounded-lg border border-border bg-muted/20">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageOff className="size-7" />
              <Text variant="caption">{t('product.photo.none')}</Text>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Supplier */}
      {selectedProduct.companyName && (
        <>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0">
              <Text variant="label" className="block text-muted-foreground">
                {t('product.supplier')}
              </Text>
              <Text variant="body" className="font-medium">
                {selectedProduct.companyName}
              </Text>
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Price & Quantity */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
            <Tag className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <Text variant="label" className="block text-muted-foreground">
              {t('product.price')}
            </Text>
            <Text variant="body" className="font-medium block truncate">
              {formatPrice(selectedProduct.price)}
            </Text>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
            <Hash className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <Text variant="label" className="block text-muted-foreground">
              {t('product.quantity')}
            </Text>
            <Text variant="body" className="font-medium block truncate">
              {String(selectedProduct.quantity)}
            </Text>
          </div>
        </div>
      </div>

      {/* Info */}
      {selectedProduct.info && (
        <>
          <Separator />
          <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
              <Info className="size-5" />
            </div>
            <div className="min-w-0">
              <Text variant="label" className="block text-muted-foreground">
                {t('product.info')}
              </Text>
              <Text variant="body" className="break-words">
                {selectedProduct.info}
              </Text>
            </div>
          </div>
        </>
      )}
    </div>
  ) : null;

  const detailFooter = selectedProduct ? (
    <PrimaryButton type="button" onClick={handleEdit} className="w-full">
      {t('product.detail.edit')}
    </PrimaryButton>
  ) : null;

  return (
    <>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Table<ProductRow>
          columns={columns}
          data={filteredProducts}
          selectable={false}
          toolbarLeft={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('product.list.search')}
                className="pl-9 backdrop-blur-none"
                aria-label={t('product.list.search')}
              />
            </div>
          }
          toolbarRight={
            <SecondaryButton
              size="icon"
              onClick={onAddProduct}
              aria-label={t('product.list.add')}
              className="size-8"
            >
              <Plus className="size-4" />
            </SecondaryButton>
          }
          getItemId={(product) => product.id}
          onRowClick={handleRowClick}
          emptyMessage={t('product.list.empty')}
          itemLabel={t('product.list.itemLabel')}
          previousLabel={t('product.list.previous')}
          nextLabel={t('product.list.next')}
          pageLabel={(current, total) =>
            t('product.list.page', {
              current: String(current),
              total: String(total),
            })
          }
        />
      </div>

      {isMobile ? (
        <BottomSheet
          open={selectedProduct !== null}
          onClose={handleCloseDetail}
          title={selectedProduct?.name ?? ''}
          footer={detailFooter}
        >
          {detailContent}
        </BottomSheet>
      ) : (
        <Drawer
          open={selectedProduct !== null}
          onClose={handleCloseDetail}
          title={selectedProduct?.name ?? ''}
          footer={detailFooter}
        >
          {detailContent}
        </Drawer>
      )}
    </>
  );
};
