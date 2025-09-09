// Safari-specific polyfills and fixes

// Ensure fetch is available (for older Safari versions)
if (typeof window !== 'undefined' && !window.fetch) {
  // This would require a fetch polyfill library
  console.warn('Fetch not available, consider adding a polyfill');
}

// Safari-specific fetch wrapper with better error handling
export const safariFetch = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    mode: 'cors',
    credentials: 'omit',
    ...options,
  };

  // Add timeout for Safari (increased for better reliability)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased from 5s to 10s
  
  try {
    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Safari-specific console error handler
export const safariErrorHandler = (error: any, context: string) => {
  console.error(`Safari Error in ${context}:`, error);
  
  // Handle specific Safari errors
  if (error.name === 'AbortError') {
    console.warn('Request was aborted (likely due to timeout)');
  } else if (error.message?.includes('CORS')) {
    console.warn('CORS error detected - this might be a Safari-specific issue');
  } else if (error.message?.includes('NetworkError')) {
    console.warn('Network error detected - check internet connection');
  }
};

// Check if running in Safari
export const isSafari = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  return /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
};

// Safari-specific retry logic
export const safariRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// Utility function to sort countries with Turkey first
export const sortCountriesWithTurkeyFirst = (countries: { name: string; flag: string; iso: string }[]) => {
  return countries.sort((a, b) => {
    if (a.name === "Turkey") return -1;
    if (b.name === "Turkey") return 1;
    return a.name.localeCompare(b.name);
  });
};

// Utility function to remove duplicate countries
export const removeDuplicateCountries = (countries: { name: string; flag: string; iso: string }[]) => {
  return countries.reduce((acc: { name: string; flag: string; iso: string }[], country) => {
    if (!acc.find(c => c.name === country.name)) {
      acc.push(country);
    }
    return acc;
  }, []);
}; 