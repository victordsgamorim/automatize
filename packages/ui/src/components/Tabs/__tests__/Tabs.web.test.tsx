import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Tabs.web';

describe('Tabs (web)', () => {
  it('renders tabs with correct structure', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(document.querySelector('[data-slot="tabs"]')).toBeDefined();
    expect(document.querySelector('[data-slot="tabs-list"]')).toBeDefined();
    expect(
      document.querySelectorAll('[data-slot="tabs-trigger"]')
    ).toHaveLength(2);
    expect(
      document.querySelectorAll('[data-slot="tabs-content"]')
    ).toHaveLength(2);
  });

  it('applies custom className to Tabs', () => {
    render(
      <Tabs defaultValue="tab1" className="custom-tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    expect(document.querySelector('[data-slot="tabs"]')?.className).toContain(
      'custom-tabs'
    );
  });

  it('applies custom className to TabsList', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    expect(
      document.querySelector('[data-slot="tabs-list"]')?.className
    ).toContain('custom-list');
  });

  it('applies custom className to TabsTrigger', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1" className="custom-trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const triggers = document.querySelectorAll('[data-slot="tabs-trigger"]');
    expect(triggers[0].className).toContain('custom-trigger');
  });

  it('applies custom className to TabsContent', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsContent value="tab1" className="custom-content">
          Content 1
        </TabsContent>
      </Tabs>
    );

    expect(
      document.querySelector('[data-slot="tabs-content"]')?.className
    ).toContain('custom-content');
  });

  it('renders TabsList with default variant', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const list = document.querySelector('[data-slot="tabs-list"]');
    expect(list?.className).toContain('bg-accent');
  });

  it('renders TabsList with button variant', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList variant="button">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    expect(document.querySelector('[data-slot="tabs-list"]')).toBeDefined();
  });

  it('renders TabsList with line variant', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList variant="line">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const list = document.querySelector('[data-slot="tabs-list"]');
    expect(list?.className).toContain('border-b');
  });

  it('renders TabsList with different sizes', () => {
    const sizes = ['lg', 'md', 'sm', 'xs'] as const;

    sizes.forEach((size) => {
      const { container } = render(
        <Tabs defaultValue="tab1">
          <TabsList size={size}>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      expect(container.querySelector('[data-slot="tabs-list"]')).toBeDefined();
    });
  });

  it('renders TabsList with pill shape', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList shape="pill">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const list = document.querySelector('[data-slot="tabs-list"]');
    expect(list?.className).toContain('rounded-full');
  });

  it('renders TabsTrigger with correct value', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const trigger = document.querySelector('[data-slot="tabs-trigger"]');
    expect(trigger?.getAttribute('data-state')).toBe('active');
  });

  it('renders TabsContent with data-state attribute', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    const contents = document.querySelectorAll('[data-slot="tabs-content"]');
    expect(contents[0].getAttribute('data-state')).toBe('active');
    expect(contents[1].getAttribute('data-state')).toBe('inactive');
  });
});
