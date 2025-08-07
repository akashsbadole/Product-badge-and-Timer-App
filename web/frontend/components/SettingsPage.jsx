import React, { useState } from 'react';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Checkbox,
  Select,
  RangeSlider,
  Button,
  Toast,
  Frame,
  Stack,
  Text,
  Divider,
} from '@shopify/polaris';
import { useAppQuery, useAppMutation } from '../hooks/useAppQuery';

function SettingsPage() {
  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState('');

  const { data: settings, isLoading, refetch } = useAppQuery('/api/settings');
  const updateSettingsMutation = useAppMutation('/api/settings', 'PUT');

  const [formData, setFormData] = useState({
    enableBadges: true,
    enableTimers: true,
    enableInventoryUrgency: true,
    inventoryThreshold: 10,
    defaultBadgePosition: 'top-left',
    defaultTimerPosition: 'bottom',
    mobileOptimized: true,
  });

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const showToast = (content) => {
    setToastContent(content);
    setToastActive(true);
  };

  const handleSubmit = async () => {
    try {
      await updateSettingsMutation.mutateAsync({ data: formData });
      showToast('Settings saved successfully!');
      refetch();
    } catch (error) {
      showToast('Error saving settings: ' + error.message);
    }
  };

  const positionOptions = [
    { label: 'Top Left', value: 'top-left' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Bottom Right', value: 'bottom-right' },
    { label: 'Center', value: 'center' },
  ];

  const timerPositionOptions = [
    { label: 'Top', value: 'top' },
    { label: 'Bottom', value: 'bottom' },
    { label: 'Center', value: 'center' },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Frame>
      <Page
        title="Settings"
        subtitle="Configure your Product Enhancer Pro app"
        primaryAction={{
          content: 'Save Settings',
          onAction: handleSubmit,
          loading: updateSettingsMutation.isLoading,
        }}
      >
        <Layout>
          <Layout.Section>
            <Card title="General Settings" sectioned>
              <FormLayout>
                <Stack vertical spacing="loose">
                  <Checkbox
                    label="Enable Badges"
                    checked={formData.enableBadges}
                    onChange={(enableBadges) =>
                      setFormData({ ...formData, enableBadges })
                    }
                    helpText="Allow badges to be displayed on products"
                  />

                  <Checkbox
                    label="Enable Countdown Timers"
                    checked={formData.enableTimers}
                    onChange={(enableTimers) =>
                      setFormData({ ...formData, enableTimers })
                    }
                    helpText="Allow countdown timers to be displayed on products"
                  />

                  <Checkbox
                    label="Enable Inventory Urgency"
                    checked={formData.enableInventoryUrgency}
                    onChange={(enableInventoryUrgency) =>
                      setFormData({ ...formData, enableInventoryUrgency })
                    }
                    helpText="Show urgency messages when inventory is low"
                  />

                  {formData.enableInventoryUrgency && (
                    <RangeSlider
                      label={`Inventory Threshold: ${formData.inventoryThreshold} items`}
                      value={formData.inventoryThreshold}
                      min={1}
                      max={50}
                      onChange={(inventoryThreshold) =>
                        setFormData({ ...formData, inventoryThreshold })
                      }
                      helpText="Show urgency message when inventory falls below this number"
                    />
                  )}
                </Stack>
              </FormLayout>
            </Card>

            <Card title="Default Positions" sectioned>
              <FormLayout>
                <Select
                  label="Default Badge Position"
                  options={positionOptions}
                  value={formData.defaultBadgePosition}
                  onChange={(defaultBadgePosition) =>
                    setFormData({ ...formData, defaultBadgePosition })
                  }
                  helpText="Default position for new badges"
                />

                <Select
                  label="Default Timer Position"
                  options={timerPositionOptions}
                  value={formData.defaultTimerPosition}
                  onChange={(defaultTimerPosition) =>
                    setFormData({ ...formData, defaultTimerPosition })
                  }
                  helpText="Default position for new timers"
                />
              </FormLayout>
            </Card>

            <Card title="Display Options" sectioned>
              <FormLayout>
                <Checkbox
                  label="Mobile Optimized"
                  checked={formData.mobileOptimized}
                  onChange={(mobileOptimized) =>
                    setFormData({ ...formData, mobileOptimized })
                  }
                  helpText="Optimize badge and timer display for mobile devices"
                />
              </FormLayout>
            </Card>

            <Card title="App Information" sectioned>
              <Stack vertical spacing="loose">
                <Stack vertical spacing="tight">
                  <Text variant="headingMd">Product Enhancer Pro</Text>
                  <Text variant="bodyMd" color="subdued">
                    Version 1.0.0
                  </Text>
                </Stack>

                <Divider />

                <Stack vertical spacing="tight">
                  <Text variant="bodyMd" fontWeight="medium">
                    Features:
                  </Text>
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    <li>Custom Product Badges</li>
                    <li>Countdown Timers</li>
                    <li>Inventory Urgency Messages</li>
                    <li>Mobile Responsive Design</li>
                    <li>Bulk Operations</li>
                    <li>Real-time Preview</li>
                  </ul>
                </Stack>

                <Divider />

                <Stack vertical spacing="tight">
                  <Text variant="bodyMd" fontWeight="medium">
                    Support:
                  </Text>
                  <Text variant="bodyMd" color="subdued">
                    For support and feature requests, please contact our team.
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Layout.Section>

          <Layout.Section secondary>
            <Card title="Quick Actions" sectioned>
              <Stack vertical>
                <Button fullWidth onClick={() => window.location.href = '/badges'}>
                  Manage Badges
                </Button>
                <Button fullWidth onClick={() => window.location.href = '/timers'}>
                  Manage Timers
                </Button>
                <Button fullWidth onClick={() => window.location.href = '/'}>
                  Dashboard
                </Button>
              </Stack>
            </Card>

            <Card title="Statistics" sectioned>
              <Stack vertical spacing="loose">
                <Stack distribution="equalSpacing">
                  <Text variant="bodyMd">App Status:</Text>
                  <Text variant="bodyMd" fontWeight="medium" color="success">
                    Active
                  </Text>
                </Stack>
                <Stack distribution="equalSpacing">
                  <Text variant="bodyMd">Last Updated:</Text>
                  <Text variant="bodyMd" color="subdued">
                    {new Date().toLocaleDateString()}
                  </Text>
                </Stack>
              </Stack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>

      {toastActive && (
        <Toast
          content={toastContent}
          onDismiss={() => setToastActive(false)}
        />
      )}
    </Frame>
  );
}

export default SettingsPage;