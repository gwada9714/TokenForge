// Mock fetch globalement
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Mock console.error pour éviter le bruit dans les tests
console.error = jest.fn();

// Reset tous les mocks après chaque test
afterEach(() => {
  jest.clearAllMocks();
});
