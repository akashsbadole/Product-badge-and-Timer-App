import React, { useState, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  Button,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Stack,
  Modal,
  FormLayout,
  TextField,
  Select,
  ColorPicker,
  Checkbox,
  Toast,
  Frame,
  EmptyState,
  Filters,
  ChoiceList,
  RangeSlider,
} from '@shopify/polaris';
import { useAppQuery, useAppMutation } from '../hooks/useAppQuery';
import ProductSelector from './ProductSelector';

function BadgeManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState('');
  
  // Filters state
  const [statusFilter, setStatusFilter] = useState([]);
  const [positionFilter, setPositionFilter] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    variantId: '',
    text: '',
    color: '#ffffff',
    backgroundColor: '#ff6b6b',
    position: 'top-left',
    shape: 'rectangle',
    fontSize: 12,
    isActive: true,
    priority: 0,
  });

  const { data: badges, isLoading, refetch } = useAppQuery('/api/badges');
  const createBadgeMutation = useAppMutation('/api/badges', 'POST');
  const updateBadgeMutation = useAppMutation('/api/badges', 'PUT');
  const deleteBadgeMutation = useAppMutation('/api/badges', 'DELETE');
  const bulkMutation = useAppMutation('/api/badges/bulk', 'POST');

  const showToast = (content) => {
    setToastContent(content);
    setToastActive(true);
  };

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setEditingBadge(null);
    setFormData({
      productId: '',
      variantId: '',
      text: '',
      color: '#ffffff',
      backgroundColor: '#ff6b6b',
      position: 'top-left',
      shape: 'rectangle',
      fontSize: 12,
      isActive: true,
      priority: 0,
    });
  }, []);

  const handleEdit = (badge) => {
    setEditingBadge(badge);
    setFormData(badge);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingBadge) {
        await updateBadgeMutation.mutateAsync({
          url: `/api/badges/${editingBadge.id}`,
          data: formData,
        });
        showToast('Badge updated successfully!');
      } else {
        await createBadgeMutation.mutateAsync({ data: formData });
        showToast('Badge created successfully!');
      }
      handleModalClose();
      refetch();
    } catch (error) {
      showToast('Error saving badge: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this badge?')) {
      try {
        await deleteBadgeMutation.mutateAsync({ url: `/api/badges/${id}` });
        showToast('Badge deleted successfully!');
        refetch();
      } catch (error) {
        showToast('Error deleting badge: ' + error.message);
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) return;
    
    try {
      await bulkMutation.mutateAsync({
        data: {
          action,
          ids: selectedItems,
        },
      });
      showToast(`Bulk ${action} completed successfully!`);
      setSelectedItems([]);
      refetch();
    } catch (error) {
      showToast(`Error performing bulk ${action}: ` + error.message);
    }
  };

  // Filter badges based on search and filters
  const filteredBadges = badges?.filter((badge) => {
    const matchesSearch = badge.text.toLowerCase().includes(searchValue.toLowerCase()) ||
                         badge.productId.includes(searchValue);
    
    const matchesStatus = statusFilter.length === 0 || 
                         statusFilter.includes(badge.isActive ? 'active' : 'inactive');
    
    const matchesPosition = positionFilter.length === 0 || 
                           positionFilter.includes(badge.position);
    
    return matchesSearch && matchesStatus && matchesPosition;
  }) || [];

  const positionOptions = [
    { label: 'Top Left', value: 'top-left' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Bottom Right', value: 'bottom-right' },
    { label: 'Center', value: 'center' },
  ];

  const shapeOptions = [
    { label: 'Rectangle', value: 'rectangle' },
    { label: 'Circle', value: 'circle' },
    { label: 'Rounded', value: 'rounded' },
    { label: 'Star', value: 'star' },
  ];

  const filters = [
    {
      key: 'status',
      label: 'Status',
      filter: (
        <ChoiceList
          title="Status"
          titleHidden
          choices={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]}
          selected={statusFilter}
          onChange={setStatusFilter}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'position',
      label: 'Position',
      filter: (
        <ChoiceList
          title="Position"
          titleHidden
          choices={positionOptions}
          selected={positionFilter}
          onChange={setPositionFilter}
          allowMultiple
        />
      ),
    },
  ];

  const appliedFilters = [
    ...statusFilter.map((status) => ({
      key: 'status',
      label: `Status: ${status}`,
      onRemove: () => setStatusFilter(statusFilter.filter(s => s !== status)),
    })),
    ...positionFilter.map((position) => ({
      key: 'position',
      label: `Position: ${position}`,
      onRemove: () => setPositionFilter(positionFilter.filter(p => p !== position)),
    })),
  ];

  const bulkActions = [
    {
      content: 'Activate',
      onAction: () => handleBulkAction('activate'),
    },
    {
      content: 'Deactivate',
      onAction: () => handleBulkAction('deactivate'),
    },
    {
      content: 'Delete',
      onAction: () => handleBulkAction('delete'),
      destructive: true,
    },
  ];

  const renderBadgeItem = (item) => {
    const { id, text, backgroundColor, color, position, isActive, productId } = item;
    
    return (
      <ResourceItem
        id={id}
        accessibilityLabel={`Badge ${text}`}
        shortcutActions={[
          { content: 'Edit', onAction: () => handleEdit(item) },
          { content: 'Delete', onAction: () => handleDelete(id) },
        ]}
      >
        <Stack alignment="center" distribution="equalSpacing">
          <Stack alignment="center" spacing="loose">
            <div
              style={{
                backgroundColor,
                color,
                padding: '4px 8px',
                borderRadius: item.shape === 'circle' ? '50%' : '4px',
                fontSize: `${item.fontSize}px`,
                fontWeight: 'bold',
                minWidth: '60px',
                textAlign: 'center',
              }}
            >
              {text}
            </div>
            <Stack vertical spacing="extraTight">
              <Text variant="bodyMd" fontWeight="medium">
                {text}
              </Text>
              <Text variant="bodySm" color="subdued">
                Product ID: {productId} • Position: {position}
              </Text>
            </Stack>
          </Stack>
          <Badge status={isActive ? 'success' : 'critical'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </Stack>
      </ResourceItem>
    );
  };

  const badgeForm = (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      title={editingBadge ? 'Edit Badge' : 'Create New Badge'}
      primaryAction={{
        content: editingBadge ? 'Update Badge' : 'Create Badge',
        onAction: handleSubmit,
        loading: createBadgeMutation.isLoading || updateBadgeMutation.isLoading,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: handleModalClose,
        },
      ]}
    >
      <Modal.Section>
        <FormLayout>
          <ProductSelector
            selectedProductId={formData.productId}
            selectedVariantId={formData.variantId}
            onProductSelect={(productId, variantId) => {
              setFormData({
                ...formData,
                productId,
                variantId: variantId || '',
              });
            }}
          />
          
          <TextField
            label="Badge Text"
            value={formData.text}
            onChange={(text) => setFormData({ ...formData, text })}
            placeholder="e.g., Best Seller, New, Sale"
            required
          />

          <Stack distribution="fillEvenly">
            <div>
              <Text variant="bodyMd" fontWeight="medium">Text Color</Text>
              <ColorPicker
                color={formData.color}
                onChange={(color) => setFormData({ ...formData, color: color.hex })}
              />
            </div>
            <div>
              <Text variant="bodyMd" fontWeight="medium">Background Color</Text>
              <ColorPicker
                color={formData.backgroundColor}
                onChange={(backgroundColor) => 
                  setFormData({ ...formData, backgroundColor: backgroundColor.hex })
                }
              />
            </div>
          </Stack>

          <Stack distribution="fillEvenly">
            <Select
              label="Position"
              options={positionOptions}
              value={formData.position}
              onChange={(position) => setFormData({ ...formData, position })}
            />
            <Select
              label="Shape"
              options={shapeOptions}
              value={formData.shape}
              onChange={(shape) => setFormData({ ...formData, shape })}
            />
          </Stack>

          <RangeSlider
            label={`Font Size: ${formData.fontSize}px`}
            value={formData.fontSize}
            min={8}
            max={24}
            onChange={(fontSize) => setFormData({ ...formData, fontSize })}
          />

          <TextField
            label="Priority"
            type="number"
            value={formData.priority.toString()}
            onChange={(priority) => 
              setFormData({ ...formData, priority: parseInt(priority) || 0 })
            }
            helpText="Higher numbers display on top"
          />

          <Checkbox
            label="Active"
            checked={formData.isActive}
            onChange={(isActive) => setFormData({ ...formData, isActive })}
          />

          {/* Preview */}
          <Card title="Preview">
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div
                style={{
                  backgroundColor: formData.backgroundColor,
                  color: formData.color,
                  padding: '8px 12px',
                  borderRadius: formData.shape === 'circle' ? '50%' : 
                               formData.shape === 'rounded' ? '8px' : '4px',
                  fontSize: `${formData.fontSize}px`,
                  fontWeight: 'bold',
                  display: 'inline-block',
                  minWidth: '80px',
                }}
              >
                {formData.text || 'Preview'}
              </div>
            </div>
          </Card>
        </FormLayout>
      </Modal.Section>
    </Modal>
  );

  const emptyState = (
    <EmptyState
      heading="Create your first badge"
      description="Add custom badges to highlight special products and increase conversions."
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      primaryAction={{
        content: 'Create Badge',
        onAction: () => setModalOpen(true),
      }}
    />
  );

  return (
    <Frame>
      <Page
        title="Badge Manager"
        subtitle={`${filteredBadges.length} badges`}
        primaryAction={{
          content: 'Create Badge',
          onAction: () => setModalOpen(true),
        }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <ResourceList
                resourceName={{ singular: 'badge', plural: 'badges' }}
                items={filteredBadges}
                renderItem={renderBadgeItem}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                bulkActions={bulkActions}
                loading={isLoading}
                emptyState={emptyState}
                filterControl={
                  <Filters
                    queryValue={searchValue}
                    queryPlaceholder="Search badges..."
                    onQueryChange={setSearchValue}
                    onQueryClear={() => setSearchValue('')}
                    filters={filters}
                    appliedFilters={appliedFilters}
                    onClearAll={() => {
                      setStatusFilter([]);
                      setPositionFilter([]);
                      setSearchValue('');
                    }}
                  />
                }
              />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
      
      {badgeForm}
      
      {toastActive && (
        <Toast
          content={toastContent}
          onDismiss={() => setToastActive(false)}
        />
      )}
    </Frame>
  );
}

export default BadgeManager;