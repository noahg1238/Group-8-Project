import {
  hasPassword,
  setPassword,
  setup,
  tableExists,
} from "@/repositories/databaseFunctions";
import * as Crypto from "expo-crypto";
import { Link, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import PasskeyEntry from "./components/PasskeyEntry";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [passwordExists, setPasswordExists] = useState(false);

  useEffect(() => {
    (async () => {
      const exists = await tableExists();

      if (!exists) {
        await setup();
      }

      setPasswordExists(await hasPassword());

      setLoading(false);

      if (!passwordExists) {
        const password = 123765;
        const hashed = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          password.toString(),
        );

        setPassword(hashed);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#242736]">
        <ActivityIndicator size={"large"} color={"#ffffff"} />
      </View>
    );
  }

  if (!passwordExists) {
    return <Redirect href="/home" />;
  }

  return (
    <View className="flex-1 justify-center bg-[#242736] px-6">
      <PasskeyEntry />
      <Link href="/home" className="mt-6 self-center">
        <Text className="text-lg text-white">Home</Text>
      </Link>
    </View>
  );
}
/*
Landing page when app starts up. If a user has chosen to add password protection 
they will have to enter a password otherwise the page should either automatically 
send them to the home page or it should display some page and have them press some 
sort of button. This will have at least 2 components( event list, and the calendar.)
Each event should be expandable, should have the ability to add an event, should be
scrollable without moving calendar. 
*/

//hopefully this all works
