import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY_PREFIX = "likes_counter_";
const COUNTERS_LIST_KEY = "likes_counters_list";

// Interface for our counter data
export interface LikeCounter {
  id: string;
  name: string;
  count: number;
}

// Create a single instance of the counters state that can be shared
let globalCounters: LikeCounter[] = [];
const listeners: (() => void)[] = [];

// Function to notify all listeners of changes
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Load counters from storage initially
const loadStoredCounters = () => {
  const storedCounters = localStorage.getItem(COUNTERS_LIST_KEY);
  if (storedCounters) {
    globalCounters = JSON.parse(storedCounters);
  } else {
    // Initialize with default counter if none exist
    const defaultCounter: LikeCounter = {
      id: "default",
      name: "Default",
      count: 0
    };
    globalCounters = [defaultCounter];
    localStorage.setItem(COUNTERS_LIST_KEY, JSON.stringify([defaultCounter]));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}default`, JSON.stringify(defaultCounter));
  }
};

// Initialize on first import
loadStoredCounters();

// Hook to manage the list of all counters
export const useCountersList = () => {
  const [counters, setCounters] = useState<LikeCounter[]>(globalCounters);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add this component as a listener for global counter changes
  useEffect(() => {
    const updateCounters = () => {
      setCounters([...globalCounters]); // Create a new array reference to trigger React updates
    };
    
    listeners.push(updateCounters);
    updateCounters(); // Initial set
    setIsLoading(false);
    
    return () => {
      const index = listeners.indexOf(updateCounters);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  // Create a new counter
  const createCounter = useCallback((name: string) => {
    const newId = `counter_${Date.now()}`;
    const newCounter: LikeCounter = {
      id: newId,
      name,
      count: 0
    };
    
    globalCounters = [...globalCounters, newCounter];
    localStorage.setItem(COUNTERS_LIST_KEY, JSON.stringify(globalCounters));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${newId}`, JSON.stringify(newCounter));
    notifyListeners();
    
    return newId;
  }, []);

  // Update a counter in the list
  const updateCounterInList = useCallback((counter: LikeCounter) => {
    globalCounters = globalCounters.map(c => c.id === counter.id ? counter : c);
    localStorage.setItem(COUNTERS_LIST_KEY, JSON.stringify(globalCounters));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${counter.id}`, JSON.stringify(counter));
    notifyListeners();
  }, []);

  // Get a counter by ID
  const getCounterById = useCallback((id: string) => {
    return globalCounters.find(c => c.id === id) || null;
  }, []);

  return {
    counters,
    isLoading,
    createCounter,
    updateCounterInList,
    getCounterById
  };
};

// Hook to manage a specific counter
export const useLikes = (counterId: string) => {
  const { getCounterById, updateCounterInList } = useCountersList();
  const [counter, setCounter] = useState<LikeCounter | null>(getCounterById(counterId));
  const [isLoading, setIsLoading] = useState<boolean>(counter === null);

  // Update the local counter when global one changes
  useEffect(() => {
    const updateCounter = () => {
      const currentCounter = getCounterById(counterId);
      if (currentCounter) {
        setCounter(currentCounter);
        setIsLoading(false);
      }
    };
    
    listeners.push(updateCounter);
    updateCounter(); // Ensure we have the latest
    
    return () => {
      const index = listeners.indexOf(updateCounter);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [counterId, getCounterById]);

  // If counter doesn't exist, initialize it
  useEffect(() => {
    if (!counter && counterId) {
      const storedCounter = localStorage.getItem(`${STORAGE_KEY_PREFIX}${counterId}`);
      
      if (storedCounter) {
        const parsedCounter = JSON.parse(storedCounter);
        setCounter(parsedCounter);
        updateCounterInList(parsedCounter);
      } else {
        // Create a new counter if it doesn't exist
        const newCounter: LikeCounter = {
          id: counterId,
          name: "Unnamed",
          count: 0
        };
        setCounter(newCounter);
        updateCounterInList(newCounter);
      }
      setIsLoading(false);
    }
  }, [counter, counterId, updateCounterInList]);

  const increment = useCallback(() => {
    if (counter) {
      const updatedCounter = {
        ...counter,
        count: counter.count + 1
      };
      setCounter(updatedCounter);
      updateCounterInList(updatedCounter);
    }
  }, [counter, updateCounterInList]);

  const decrement = useCallback(() => {
    if (counter) {
      const updatedCounter = {
        ...counter,
        count: Math.max(0, counter.count - 1)
      };
      setCounter(updatedCounter);
      updateCounterInList(updatedCounter);
    }
  }, [counter, updateCounterInList]);

  const updateName = useCallback((name: string) => {
    if (counter) {
      const updatedCounter = {
        ...counter,
        name
      };
      setCounter(updatedCounter);
      updateCounterInList(updatedCounter);
    }
  }, [counter, updateCounterInList]);

  return {
    counter,
    likes: counter?.count || 0,
    name: counter?.name || "",
    increment,
    decrement,
    updateName,
    isLoading,
  };
};
