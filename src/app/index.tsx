import { View } from "react-native";
import { hasPassword } from "../hooks/passworded";
import { useEffect } from "react";
import { useRouter } from "expo-router";

useEffect(()=>{
  router.push()
}, [])

export default function Index() {
  if hasPassword() {
    return (
    <View>
      {hasPassword() ? (
        <>{/* insert component to display here */}</>
      ) : (
        <View></View>
      )}
    </View>
  );
  }
  
}
/*
Landing page when app starts up. If a user has chosen to add password protection 
they will have to enter a password otherwise the page should either automatically 
send them to the home page or it should display some page and have them press some 
sort of button. This will have at least 2 components( event list, and the calendar.)
Each event should be expandable, should have the ability to add an event, should be
scrollable without moving calendar. 
*/
