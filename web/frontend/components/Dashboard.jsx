import React, { useState, useEffect } from 'react';
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Stack,
  Badge,
  ResourceList,
  ResourceItem,
  Avatar,
  Tabs,
  EmptyState,
} from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import { useAppQuery } from '../hooks/useAppQuery';

function Dashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);

  const {
    data: badges,
    isLoading: badgesLoading,
  } = useAppQuery('/api/badges');

  const {
    data: timers,
    isLoading: timersLoading,
  } = useAppQuery('/api/timers');

  const {
    data: settings,
    isLoading: settingsLoading,
  } = useAppQuery('/api/settings');

  const tabs = [
    {
      id: 'overview',
      content: 'Overview',
    },
    {
      id: 'recent',
      content: 'Recent Activity',
    },
  ];

  const stats = [
    {
      title: 'Active Badges',
      value: badges?.filter(b => b.isActive).length || 0,
      action: () => navigate('/badges'),
    },
    {
      title: 'Active Timers',
      value: timers?.filter(t => t.isActive && new Date(t.endDate) > new Date()).length || 0,
      action: () => navigate('/timers'),
    },
    {
      title: 'Total Products Enhanced',
      value: new Set([
        ...(badges?.map(b => b.productId) || []),
        ...(timers?.map(t => t.productId) || [])
      ]).size,
      action: () => {},
    },
  ];

  const renderOverview = () => (
    <Layout>
      <Layout.Section oneHalf>
        {stats.map((stat, index) => (
          <Card key={index} sectioned>
            <Stack alignment="center" distribution="equalSpacing">
              <Stack vertical spacing="tight">
                <Text variant="headingMd">{stat.title}</Text>
                <Text variant="headingXl">{stat.value}</Text>
              </Stack>
              {stat.action && (
                <Button onClick={stat.action}>View Details</Button>
              )}
            </Stack>
          </Card>
        ))}
      </Layout.Section>
      
      <Layout.Section oneHalf>
        <Card title="Quick Actions" sectioned>
          <Stack vertical>
            <Button
              primary
              fullWidth
              onClick={() => navigate('/badges')}
            >
              Create New Badge
            </Button>
            <Button
              fullWidth
              onClick={() => navigate('/timers')}
            >
              Create Countdown Timer
            </Button>
            <Button
              fullWidth
              onClick={() => navigate('/settings')}
            >
              App Settings
            </Button>
          </Stack>
        </Card>
      </Layout.Section>
    </Layout>
  );

  const renderRecentActivity = () => {
    const recentItems = [
      ...(badges?.slice(0, 5).map(badge => ({
        id: badge.id,
        type: 'badge',
        title: `Badge: ${badge.text}`,
        subtitle: `Product ID: ${badge.productId}`,
        status: badge.isActive ? 'Active' : 'Inactive',
        createdAt: badge.createdAt,
      })) || []),
      ...(timers?.slice(0, 5).map(timer => ({
        id: timer.id,
        type: 'timer',
        title: `Timer: ${timer.message}`,
        subtitle: `Ends: ${new Date(timer.endDate).toLocaleDateString()}`,
        status: timer.isActive && new Date(timer.endDate) > new Date() ? 'Active' : 'Inactive',
        createdAt: timer.createdAt,
      })) || []),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (recentItems.length === 0) {
      return (
        <EmptyState
          heading="No recent activity"
          description="Create your first badge or timer to get started."
          primaryAction={{
            content: 'Create Badge',
            onAction: () => navigate('/badges'),
          }}
          secondaryAction={{
            content: 'Create Timer',
            onAction: () => navigate('/timers'),
          }}
        />
      );
    }

    return (
      <Card>
        <ResourceList
          resourceName={{ singular: 'item', plural: 'items' }}
          items={recentItems}
          renderItem={(item) => {
            const { id, type, title, subtitle, status } = item;
            return (
              <ResourceItem
                id={id}
                accessibilityLabel={`View details for ${title}`}
              >
                <Stack alignment="center" distribution="equalSpacing">
                  <Stack vertical spacing="extraTight">
                    <Stack alignment="center" spacing="tight">
                      <Avatar
                        customer
                        size="small"
                        name={type}
                        initials={type === 'badge' ? 'B' : 'T'}
                      />
                      <Text variant="bodyMd" fontWeight="medium">
                        {title}
                      </Text>
                    </Stack>
                    <Text variant="bodySm" color="subdued">
                      {subtitle}
                    </Text>
                  </Stack>
                  <Badge
                    status={status === 'Active' ? 'success' : 'info'}
                  >
                    {status}
                  </Badge>
                </Stack>
              </ResourceItem>
            );
          }}
        />
      </Card>
    );
  };

  if (badgesLoading || timersLoading || settingsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Page
      title="Product Enhancer Pro"
      subtitle="Manage your product badges and countdown timers"
      primaryAction={{
        content: 'Settings',
        onAction: () => navigate('/settings'),
      }}
    >
      <Tabs
        tabs={tabs}
        selected={selectedTab}
        onSelect={setSelectedTab}
      >
        {selectedTab === 0 ? renderOverview() : renderRecentActivity()}
      </Tabs>
    </Page>
  );
}

export default Dashboard;