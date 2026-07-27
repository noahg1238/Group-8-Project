import React from "react";
import { View } from "react-native";

const home = () => {
  return <View className="bg-blue-500">This is the Home screen</View>;
};
/*
This will be the current month view. When the user clicks the arrows to switch between months it
should switch which month is being displayed. This could probably be done with references to an
API that updates some component. The user should be able to go 25 years worth of months in either direction.
*/
export default home;
