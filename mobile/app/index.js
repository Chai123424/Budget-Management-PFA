import { Redirect } from "expo-router"
import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import LoadingScreen from "./loadingScreen"

export default function Index() {
  const [isLoading, setIsLoading] = useState(true)
  const [userToken, setUserToken] = useState(null)

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token")
      setUserToken(token)
      setTimeout(() => setIsLoading(false), 2000) // petit délai pour loading screen
    }
    checkToken()
  }, [])

  if (isLoading) return <LoadingScreen />
  return <Redirect href={userToken ? "/dashboard" : "/screens/LoginScreen/loginScreen"} />
}
