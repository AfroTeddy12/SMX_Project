import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#22344a', // SMX navy blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#b94c1e', // SMX orange
      contrastText: '#fff',
    },
    background: {
      default: '#22344a',
      paper: '#fff',
    },
    text: {
      primary: '#22344a',
      secondary: '#b94c1e',
    },
    grey: {
      100: '#e0e0e0',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
});

export default theme; 