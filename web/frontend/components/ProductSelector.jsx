import React, { useState } from 'react';
import {
  Combobox,
  Listbox,
  Text,
  Stack,
  Tag,
  Thumbnail,
} from '@shopify/polaris';
import { useAppQuery } from '../hooks/useAppQuery';

function ProductSelector({ selectedProductId, selectedVariantId, onProductSelect }) {
  const [productInputValue, setProductInputValue] = useState('');
  const [activeProductOption, setActiveProductOption] = useState(null);
  const [variantInputValue, setVariantInputValue] = useState('');
  const [activeVariantOption, setActiveVariantOption] = useState(null);

  // Fetch products
  const { data: productsData } = useAppQuery(
    `/api/graphql?query=${encodeURIComponent(`
      query GetProducts($first: Int!, $query: String) {
        products(first: $first, query: $query) {
          edges {
            node {
              id
              title
              handle
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                  }
                }
              }
            }
          }
        }
      }
    `)}&variables=${encodeURIComponent(JSON.stringify({ first: 50, query: productInputValue }))}`,
    { enabled: true }
  );

  const products = productsData?.data?.products?.edges?.map(edge => edge.node) || [];
  const selectedProduct = products.find(p => p.id.includes(selectedProductId));
  const variants = selectedProduct?.variants?.edges?.map(edge => edge.node) || [];

  const productOptions = products.map((product) => ({
    value: product.id.split('/').pop(),
    label: product.title,
    ...product,
  }));

  const variantOptions = variants.map((variant) => ({
    value: variant.id.split('/').pop(),
    label: variant.title === 'Default Title' ? 'Default' : variant.title,
    ...variant,
  }));

  const updateProductSelection = (productId) => {
    onProductSelect(productId, '');
    setProductInputValue('');
    setVariantInputValue('');
  };

  const updateVariantSelection = (variantId) => {
    onProductSelect(selectedProductId, variantId);
    setVariantInputValue('');
  };

  const textField = (
    <Combobox.TextField
      onChange={setProductInputValue}
      label="Search products"
      labelHidden
      value={productInputValue}
      placeholder="Search products..."
      autoComplete="off"
    />
  );

  const variantTextField = selectedProductId && (
    <Combobox.TextField
      onChange={setVariantInputValue}
      label="Search variants"
      labelHidden
      value={variantInputValue}
      placeholder="Search variants (optional)..."
      autoComplete="off"
    />
  );

  return (
    <Stack vertical>
      <Text variant="bodyMd" fontWeight="medium">Product Selection</Text>
      
      <Combobox
        activator={textField}
        allowMultiple={false}
        onSelect={updateProductSelection}
        textField={textField}
      >
        {productOptions.length > 0 ? (
          <Listbox
            onSelect={updateProductSelection}
            onActiveOptionChange={setActiveProductOption}
          >
            {productOptions.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                selected={selectedProductId === option.value}
                accessibilityLabel={option.label}
              >
                <Stack alignment="center" spacing="tight">
                  {option.images?.edges?.[0] && (
                    <Thumbnail
                      source={option.images.edges[0].node.url}
                      alt={option.images.edges[0].node.altText || option.title}
                      size="small"
                    />
                  )}
                  <div>
                    <Text variant="bodyMd">{option.title}</Text>
                    <Text variant="bodySm" color="subdued">
                      {option.handle}
                    </Text>
                  </div>
                </Stack>
              </Listbox.Option>
            ))}
          </Listbox>
        ) : (
          productInputValue && (
            <Listbox>
              <Listbox.Option disabled value="">
                No products found
              </Listbox.Option>
            </Listbox>
          )
        )}
      </Combobox>

      {selectedProductId && (
        <Stack spacing="tight">
          <Tag onRemove={() => onProductSelect('', '')}>
            {selectedProduct?.title || `Product ID: ${selectedProductId}`}
          </Tag>
        </Stack>
      )}

      {selectedProductId && variants.length > 1 && (
        <Combobox
          activator={variantTextField}
          allowMultiple={false}
          onSelect={updateVariantSelection}
          textField={variantTextField}
        >
          {variantOptions.length > 0 ? (
            <Listbox
              onSelect={updateVariantSelection}
              onActiveOptionChange={setActiveVariantOption}
            >
              {variantOptions.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  selected={selectedVariantId === option.value}
                  accessibilityLabel={option.label}
                >
                  <Stack vertical spacing="extraTight">
                    <Text variant="bodyMd">{option.label}</Text>
                    <Stack spacing="tight">
                      {option.sku && (
                        <Text variant="bodySm" color="subdued">
                          SKU: {option.sku}
                        </Text>
                      )}
                      <Text variant="bodySm" color="subdued">
                        ${option.price}
                      </Text>
                    </Stack>
                  </Stack>
                </Listbox.Option>
              ))}
            </Listbox>
          ) : null}
        </Combobox>
      )}

      {selectedVariantId && (
        <Stack spacing="tight">
          <Tag onRemove={() => onProductSelect(selectedProductId, '')}>
            {variants.find(v => v.id.includes(selectedVariantId))?.title || `Variant ID: ${selectedVariantId}`}
          </Tag>
        </Stack>
      )}
    </Stack>
  );
}

export default ProductSelector;