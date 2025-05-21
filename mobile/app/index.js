import React, { useState, useEffect } from 'react';
import LoadingScreen from './screens/LoadingPage/loadingScreen'; 
import MainScreen from './screens/LoginScreen/loginScreen'; 

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); 
  }, []);

  return isLoading ? <LoadingScreen /> : <MainScreen />;
};

export default App;