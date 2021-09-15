import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../.';

describe('<App />', () => {
    it('renders', () => {
        render(<App />);

        expect(screen.getByText('It Works!')).toBeInTheDocument();
    });
});