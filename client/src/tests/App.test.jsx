import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { EmptyState } from '../components/EmptyState.jsx';

describe('Frontend Component Tests', () => {
  it('renders status badges with appropriate classes and text', () => {
    const { container } = render(<StatusBadge status="available" />);
    expect(screen.getByText('available')).toBeInTheDocument();
    expect(container.querySelector('.badge-available')).toBeInTheDocument();
  });

  it('renders empty states with custom titles and messages', () => {
    render(
      <BrowserRouter>
        <EmptyState
          title="No Artworks Available"
          description="Please check back after the next artisan drop."
          actionText="Browse Again"
          actionLink="/catalogue"
        />
      </BrowserRouter>
    );

    expect(screen.getByText('No Artworks Available')).toBeInTheDocument();
    expect(screen.getByText('Please check back after the next artisan drop.')).toBeInTheDocument();
    expect(screen.getByText('Browse Again')).toBeInTheDocument();
  });

  it('renders CataloguePage without error when paintings are loaded', async () => {
    const { CataloguePage } = await import('../pages/CataloguePage.jsx');
    const { paintingApi } = await import('../api/paintingApi.js');
    const { AuthProvider } = await import('../context/AuthContext.jsx');
    const spy = vi.spyOn(paintingApi, 'getPaintings').mockResolvedValueOnce({
      paintings: [
        {
          id: 'p-001',
          title: 'Royal Bengal Roar',
          artist: 'Shambhu Das',
          price: 24500,
          description: 'Authentic folk art canvas',
          imageUrl: 'images/p-001.jpg',
          status: 'available'
        }
      ]
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <CataloguePage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText('Royal Bengal Roar')).toBeInTheDocument();
    expect(screen.getByText('Shambhu Das', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('₹24,500')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Buy/i })).toBeInTheDocument();

    spy.mockRestore();
  }, 15000);
});
