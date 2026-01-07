import '@testing-library/jest-dom';
import 'jest-fetch-mock';

// Mock window.fetch
global.fetch = require('jest-fetch-mock'); 