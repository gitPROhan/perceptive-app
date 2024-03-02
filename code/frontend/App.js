/*Root file where the compilation begins.

After all the screen were imported, we render them using a react stack navigator(Version 5)
*/


import React from "react";
import {StyleSheet} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
//Component Imports.
import Home from "./Home";
import OrderInfo from "./orderinfo.js";
import NewSummary from "./newSummary ";
import Detected_Images from "./Detected_Images";
import Detections from "./Detections";
import Inputs from "./Input_order.js";
import Processing from "./Processing";
import Settings from "./Settings"


const Stack = createStackNavigator(); // for more information refer https://reactnavigation.org/docs/stack-navigator/


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
      {/* Using the below names we can create transitions from one page to other witht he navigation prop */}
      {/* name act as an id for a page */}
      {/*the headerShown:false will omit the title display on the header of the screen. */}
        <Stack.Screen name="Home"         component ={Home} />
        <Stack.Screen name="OrderInfo"    component ={OrderInfo} />
        <Stack.Screen name="Summary"      component ={NewSummary} options={{headerShown: false,}} />
        <Stack.Screen name="ImageViewer"  component ={Detected_Images} options={{ headerShown: true,}} /> 
        <Stack.Screen name="Settings"     component ={Settings} />
        <Stack.Screen name="Detections"   component ={Detections} options={{ headerShown: false,}}/>
        <Stack.Screen name="New_Order"    component ={Inputs} />

      </Stack.Navigator>
    </NavigationContainer>
  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
