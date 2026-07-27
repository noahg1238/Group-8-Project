import { Link, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { hasPassword } from "./hooks/passworded";

export default function Index() {
  if (hasPassword()) {
    useEffect(() => {
      const router = useRouter();
      router.replace("/home");
    }, []);

    return (
      <View className="items-center">
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <View>
      {/* component here*/}
      <Text>enter password</Text>
      <Link href={"/home"} className="text-lg">
        Home
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
