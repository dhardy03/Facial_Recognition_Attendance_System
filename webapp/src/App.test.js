import { render, screen } from '@testing-library/react';
import Attendance from './Attendance/Attendance';

test('renders learn react link', () => {
  render(<Attendance />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
