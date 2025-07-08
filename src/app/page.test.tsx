import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('should render the main heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', {
      name: /track your gains — with gaintrack/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('should render the description', () => {
    render(<Home />);
    const description = screen.getByText(
      /gaintrack is a tool that helps you track your gains./i
    );
    expect(description).toBeInTheDocument();
  });

  it('should render the call to action button', () => {
    render(<Home />);
    const button = screen.getByRole('link', {
      name: /start tracking your gains/i,
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/dashboard');
  });

  it('should render the logo', () => {
    render(<Home />);
    const logo = screen.getByAltText(/gaintrack logo/i);
    expect(logo).toBeInTheDocument();
  });
});
