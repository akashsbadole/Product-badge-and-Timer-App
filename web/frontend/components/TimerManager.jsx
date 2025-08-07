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
} from '@shopify/polaris';
import { useAppQuery, useAppMutation } from '../hooks/useAppQuery';
import ProductSelector from './ProductSelector';

function TimerManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState('');
  
  // Filters state
  const [statusFilter, setStatusFilter] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    variantId: '',
    endDate: '',
    message: 'Limited Time Offer!',
    textColor: '#ffffff',
    backgroundColor: '#ff4444',
    position: 'bottom',
    showDays: true,
    showHours: true,
    showMinutes: true,
    showSeconds: true,
    isActive: true,
  });

  const { data: timers, isLoading, refetch } = useAppQuery('/api/timers');
  const createTimerMutation = useAppMutation('/api/timers', 'POST');
  const updateTimerMutation = useAppMutation('/api/timers', 'PUT');
  const deleteTimerMutation = useAppMutation('/api/timers', 'DELETE');
  const bulkMutation = useAppMutation('/api/timers/bulk', 'POST');

  const showToast = (content) => {
    setToastContent(content);
    setToastActive(true);
  };

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setEditingTimer(null);
    setFormData({
      productId: '',
      variantId: '',
      endDate: '',
      message: 'Limited Time Offer!',
      textColor: '#ffffff',
      backgroundColor: '#ff4444',
      position: 'bottom',
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      isActive: true,
    });
  }, []);

  const handleEdit = (timer) => {
    setEditingTimer(timer);
    setFormData({
      ...timer,
      endDate: new Date(timer.endDate).toISOString().slice(0, 16),
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingTimer) {
        await updateTimerMutation.mutateAsync({
          url: `/api/timers/${editingTimer.id}`,
          data: submitData,
        });
        showToast('Timer updated successfully!');
      } else {
        await createTimerMutation.mutateAsync({ data: submitData });
        showToast('Timer created successfully!');
      }
      handleModalClose();
      refetch();
    } catch (error) {
      showToast('Error saving timer: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this timer?')) {
      try {
        await deleteTimerMutation.mutateAsync({ url: `/api/timers/${id}` });
        showToast('Timer deleted successfully!');
        refetch();
      } catch (error) {
        showToast('Error deleting timer: ' + error.message);
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) return;
    
    try {
      await bulkMutation.mutateAsync({
        data: { action, ids: selectedItems },
      });
      showToast(`Bulk ${action} completed successfully!`);
      setSelectedItems([]);
      refetch();
    } catch (error) {
      showToast(`Error performing bulk ${action}: ` + error.message);
    }
  };

  const isTimerActive = (timer) => {
    return timer.isActive && new Date(timer.endDate) > new Date();
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference <= 0) return 'Expired';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  // Filter timers
  const filteredTimers = timers?.filter((timer) => {
    const matchesSearch = timer.message.toLowerCase().includes(searchValue.toLowerCase()) ||
                         timer.productId.includes(searchValue);
    
    const timerStatus = isTimerActive(timer) ? 'active' : 'inactive';
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(timerStatus);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const positionOptions = [
    { label: 'Top', value: 'top' },
    { label: 'Bottom', value: 'bottom' },
    { label: 'Center', value: 'center' },
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
  ];

  const appliedFilters = statusFilter.map((status) => ({
    key: 'status',
    label: `Status: ${status}`,
    onRemove: () => setStatusFilter(statusFilter.filter(s => s !== status)),
  }));

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

  const renderTimerItem = (item) => {
    const { id, message, endDate, backgroundColor, textColor, position, productId } = item;
    const timeRemaining = getTimeRemaining(endDate);
    const active = isTimerActive(item);
    
    return (
      <ResourceItem
        id={id}
        accessibilityLabel={`Timer ${message}`}
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
                color: textColor,
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                minWidth: '120px',
                textAlign: 'center',
              }}
            >
              {timeRemaining}
            </div>
            <Stack vertical spacing="extraTight">
              <Text variant="bodyMd" fontWeight="medium">
                {message}
              </Text>
              <Text variant="bodySm" color="subdued">
                Product ID: {productId} • Ends: {new Date(endDate).toLocaleString()}
              </Text>
            </Stack>
          </Stack>
          <Badge status={active ? 'success' : 'critical'}>
            {active ? 'Active' : timeRemaining === 'Expired' ? 'Expired' : 'Inactive'}
          </Badge>
        </Stack>
      </ResourceItem>
    );
  };

  const timerForm = (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      title={editingTimer ? 'Edit Timer' : 'Create New Timer'}
      primaryAction={{
        content: editingTimer ? 'Update Timer' : 'Create Timer',
        onAction: handleSubmit,
        loading: createTimerMutation.isLoading || updateTimerMutation.isLoading,
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
            label="Timer Message"
            value={formData.message}
            onChange={(message) => setFormData({ ...formData, message })}
            placeholder="e.g., Limited Time Offer!, Sale Ends Soon!"
            required
          />

          <TextField
            label="End Date & Time"
            type="datetime-local"
            value={formData.endDate}
            onChange={(endDate) => setFormData({ ...formData, endDate })}
            min={new Date().toISOString().slice(0, 16)}
            required
          />

          <Stack distribution="fillEvenly">
            <div>
              <Text variant="bodyMd" fontWeight="medium">Text Color</Text>
              <ColorPicker
                color={formData.textColor}
                onChange={(textColor) => setFormData({ ...formData, textColor: textColor.hex })}
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

          <Select
            label="Position"
            options={positionOptions}
            value={formData.position}
            onChange={(position) => setFormData({ ...formData, position })}
          />

          <Text variant="headingMd">Display Options</Text>
          
          <Stack>
            <Checkbox
              label="Show Days"
              checked={formData.showDays}
              onChange={(showDays) => setFormData({ ...formData, showDays })}
            />
            <Checkbox
              label="Show Hours"
              checked={formData.showHours}
              onChange={(showHours) => setFormData({ ...formData, showHours })}
            />
            <Checkbox
              label="Show Minutes"
              checked={formData.showMinutes}
              onChange={(showMinutes) => setFormData({ ...formData, showMinutes })}
            />
            <Checkbox
              label="Show Seconds"
              checked={formData.showSeconds}
              onChange={(showSeconds) => setFormData({ ...formData, showSeconds })}
            />
          </Stack>

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
                  color: formData.textColor,
                  padding: '12px 20px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'inline-block',
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  {formData.message || 'Timer Message'}
                </div>
                <div style={{ fontSize: '18px', fontFamily: 'monospace' }}>
                  {formData.showDays && '00:'}{formData.showHours && '00:'}{formData.showMinutes && '00'}{formData.showSeconds && ':00'}
                </div>
              </div>
            </div>
          </Card>
        </FormLayout>
      </Modal.Section>
    </Modal>
  );

  const emptyState = (
    <EmptyState
      heading="Create your first countdown timer"
      description="Add urgency to your products with countdown timers for sales and special offers."
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      primaryAction={{
        content: 'Create Timer',
        onAction: () => setModalOpen(true),
      }}
    />
  );

  return (
    <Frame>
      <Page
        title="Timer Manager"
        subtitle={`${filteredTimers.length} timers`}
        primaryAction={{
          content: 'Create Timer',
          onAction: () => setModalOpen(true),
        }}
      >
        <Layout>
          <Layout.Section>
            <Card>
              <ResourceList
                resourceName={{ singular: 'timer', plural: 'timers' }}
                items={filteredTimers}
                renderItem={renderTimerItem}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
                bulkActions={bulkActions}
                loading={isLoading}
                emptyState={emptyState}
                filterControl={
                  <Filters
                    queryValue={searchValue}
                    queryPlaceholder="Search timers..."
                    onQueryChange={setSearchValue}
                    onQueryClear={() => setSearchValue('')}
                    filters={filters}
                    appliedFilters={appliedFilters}
                    onClearAll={() => {
                      setStatusFilter([]);
                      setSearchValue('');
                    }}
                  />
                }
              />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
      
      {timerForm}
      
      {toastActive && (
        <Toast
          content={toastContent}
          onDismiss={() => setToastActive(false)}
        />
      )}
    </Frame>
  );
}

export default TimerManager;