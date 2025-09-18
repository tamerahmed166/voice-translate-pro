// Jest setup file
// Global test setup

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn(),
    getRegistrations: jest.fn(() => Promise.resolve([])),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  },
  writable: true
});

// Mock Speech Recognition
Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  })),
  writable: true
});

// Mock Speech Synthesis
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: jest.fn(() => [])
  },
  writable: true
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock fetch
global.fetch = jest.fn();

// Mock Tesseract
global.Tesseract = {
  createWorker: jest.fn(() => Promise.resolve({
    loadLanguage: jest.fn(() => Promise.resolve()),
    initialize: jest.fn(() => Promise.resolve()),
    recognize: jest.fn(() => Promise.resolve({ data: { text: 'test' } })),
    terminate: jest.fn(() => Promise.resolve())
  }))
};

// Mock Firebase
global.firebase = {
  initializeApp: jest.fn(),
  auth: jest.fn(() => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn()
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        get: jest.fn()
      }))
    }))
  }))
};

// Mock LZString
global.LZString = {
  compress: jest.fn((str) => str),
  decompress: jest.fn((str) => str),
  compressToUTF16: jest.fn((str) => str),
  decompressFromUTF16: jest.fn((str) => str)
};

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock Performance
global.performance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
};

// Mock URL
global.URL = jest.fn(() => ({
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: ''
}));

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};
