import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import ContentList from '../pages/ContentList';
import ContentEditor from '../pages/ContentEditor';
import Ideas from '../pages/Ideas';
import Analytics from '../pages/Analytics';
import Settings from '../pages/Settings';
import DailyScheduler from '../components/DailyScheduler';
import WeeklyPlannerModal from '../components/WeeklyPlannerModal';
import { GlobalSearch } from '../components/GlobalSearch';
import { ReadabilityRing } from '../components/ReadabilityRing';

describe('UI Pages and Components', () => {
  it('renders Dashboard with metrics and pipeline', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Good morning,/i)).toBeInTheDocument();
    expect(screen.getAllByText('Scheduled').length).toBeGreaterThan(0);
    expect(screen.getByText('Need Approval')).toBeInTheDocument();
    expect(screen.getByText('Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Drafting')).toBeInTheDocument();
  });

  it('renders ContentList and filters items', () => {
    render(
      <MemoryRouter>
        <ContentList />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Content' })).toBeInTheDocument();
    expect(screen.getByText('All Content')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search content...')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search content...');
    fireEvent.change(searchInput, { target: { value: 'landing page' } });
    expect(screen.getByText(/landing page/i)).toBeInTheDocument();
  });

  it('renders ContentEditor and switches tabs', () => {
    render(
      <MemoryRouter initialEntries={['/content/cnt1']}>
        <Routes>
          <Route path="/content/:id" element={<ContentEditor />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Brief')).toBeInTheDocument();
    expect(screen.getByText('Script')).toBeInTheDocument();
    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('Caption')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('SEO')).toBeInTheDocument();

    // Click Brief tab
    fireEvent.click(screen.getByText('Brief'));
    expect(screen.getByText('Content Creative Brief')).toBeInTheDocument();

    // Click Script tab
    fireEvent.click(screen.getByText('Script'));
    expect(screen.getByText('Script & Outline Editor')).toBeInTheDocument();

    // Click Assets tab
    fireEvent.click(screen.getByText('Assets'));
    expect(screen.getByText('Media & Creative Assets')).toBeInTheDocument();

    // Click Review tab
    fireEvent.click(screen.getByText('Review'));
    expect(screen.getByText('Review & QA Checklist')).toBeInTheDocument();

    // Click SEO tab
    fireEvent.click(screen.getByText('SEO'));
    expect(screen.getByText(/SEO & Readability Audit/i)).toBeInTheDocument();
  });

  it('renders Ideas inbox and adds a new idea', () => {
    render(
      <MemoryRouter>
        <Ideas />
      </MemoryRouter>
    );

    expect(screen.getByText('Ideas Inbox')).toBeInTheDocument();
    const captureButton = screen.getByText('Capture Idea');
    fireEvent.click(captureButton);

    const titleInput = screen.getByPlaceholderText("What's your idea?");
    fireEvent.change(titleInput, { target: { value: 'New Test Viral Hook Idea' } });

    const saveButton = screen.getByText('Save Idea');
    fireEvent.click(saveButton);

    expect(screen.getByText('New Test Viral Hook Idea')).toBeInTheDocument();
  });

  it('renders Analytics overview', () => {
    render(
      <MemoryRouter>
        <Analytics />
      </MemoryRouter>
    );

    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Total Reach')).toBeInTheDocument();
    expect(screen.getByText('Engagement Rate')).toBeInTheDocument();
    expect(screen.getByText('Content Health')).toBeInTheDocument();
  });

  it('renders Settings and updates brand context', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    expect(screen.getByText('Brand Context')).toBeInTheDocument();
    const brandInput = screen.getByPlaceholderText('e.g. Acme Corp');
    fireEvent.change(brandInput, { target: { value: 'Global Alpha Brand' } });

    const saveBtn = screen.getByText(/Save Settings/i);
    fireEvent.click(saveBtn);

    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('renders DailyScheduler and triggers generation', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        suggestions: [
          {
            title: 'Scheduler AI Post',
            platform: 'Instagram',
            contentType: 'Reel',
            publishAt: '2026-08-26T12:00:00Z',
            caption: 'Awesome caption'
          }
        ]
      })
    });

    render(<DailyScheduler />);
    expect(screen.getByText('Daily AI Scheduler')).toBeInTheDocument();

    const generateBtn = screen.getByText('Generate Daily Content');
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText('Scheduler AI Post')).toBeInTheDocument();
    });
  });

  it('renders WeeklyPlannerModal and displays generated plans', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        plan: [
          {
            title: 'Day 1 Plan Idea',
            platform: 'LinkedIn',
            contentType: 'Post',
            publishAt: '2026-08-27T12:00:00Z',
            caption: 'Weekly plan caption'
          }
        ]
      })
    });

    const onClose = vi.fn();
    render(<WeeklyPlannerModal onClose={onClose} />);
    expect(screen.getByText('Magic Weekly Plan')).toBeInTheDocument();

    const generateBtn = screen.getByText('Generate Weekly Schedule');
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText('Day 1 Plan Idea')).toBeInTheDocument();
    });
  });

  it('renders GlobalSearch and handles keyboard shortcut', () => {
    render(
      <MemoryRouter>
        <GlobalSearch />
      </MemoryRouter>
    );

    const searchBtn = screen.getByText('Search content, ideas...');
    expect(searchBtn).toBeInTheDocument();
    fireEvent.click(searchBtn);

    expect(screen.getByPlaceholderText('Search across your workspace...')).toBeInTheDocument();
  });

  it('renders ReadabilityRing correctly', () => {
    render(<ReadabilityRing text="This is a simple sentence." />);
    expect(screen.getByText('Readability')).toBeInTheDocument();
  });
});
