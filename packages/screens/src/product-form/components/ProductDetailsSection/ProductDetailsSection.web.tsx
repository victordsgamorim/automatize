import React from 'react';
import { Input } from '@automatize/ui/web';
import { useTranslation } from '@automatize/core-localization';

export interface ProductDetailsSectionProps {
  name: string;
  onNameChange: (value: string) => void;
  price: string;
  onPriceChange: (value: string) => void;
  quantity: string;
  onQuantityChange: (value: string) => void;
  info: string;
  onInfoChange: (value: string) => void;
}

export const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({
  name,
  onNameChange,
  price,
  onPriceChange,
  quantity,
  onQuantityChange,
  info,
  onInfoChange,
}) => {
  const { t } = useTranslation();

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits, a single dot, and a single comma (normalised to dot)
    const raw = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
    // Prevent multiple dots
    const parts = raw.split('.');
    const normalised =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : raw;
    onPriceChange(normalised);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuantityChange(e.target.value.replace(/[^0-9]/g, ''));
  };

  return (
    <div className="space-y-4">
      <Input
        id="product-name"
        name="name"
        label={t('product.name')}
        placeholder={t('product.name.placeholder')}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        required
        autoComplete="off"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="product-price"
          name="price"
          label={t('product.price')}
          placeholder={t('product.price.placeholder')}
          value={price}
          onChange={handlePriceChange}
          inputMode="decimal"
          autoComplete="off"
        />
        <Input
          id="product-quantity"
          name="quantity"
          label={t('product.quantity')}
          placeholder={t('product.quantity.placeholder')}
          value={quantity}
          onChange={handleQuantityChange}
          inputMode="numeric"
          autoComplete="off"
        />
      </div>

      <Input
        id="product-info"
        name="info"
        label={t('product.info')}
        placeholder={t('product.info.placeholder')}
        value={info}
        onChange={(e) => onInfoChange(e.target.value)}
        autoComplete="off"
      />
    </div>
  );
};
