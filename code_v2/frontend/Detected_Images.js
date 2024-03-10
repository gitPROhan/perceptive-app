//Showing Detected Images
//Called upon clinking images option in any other componenet

import React, { useEffect } from "react";
import {ScrollView, View, BackHandler } from "react-native";
import ImageView from "./ImageView";
import { StackActions } from "@react-navigation/native";

const logo = {
  uri: "https://reactnative.dev/img/tiny_logo.png",
  height: 200,
  flexDirection: "row",
};

export default function App({ route, navigation }) {
  var { photos } = route.params;
  // console.log("high")
  // console.log(photos)
  

  var uris = photos.map((base64) => {
    return "data:image/png;base64," + base64;
  });
  // console.log(uris)
  var images = [];
  for (let index = 0; index < uris.length; index++) {
    images.push(
      <View key={index + 1}>
        <ImageView ind={index + 1} key={index + 1} uri={uris[index]} />
      </View>
    );
  }

  const backAction = () => {
    const popAction = StackActions.pop(1);
    navigation.dispatch(popAction);
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () =>
      BackHandler.removeEventListener("hardwareBackPress", backAction);
  }, []);

  return (
    <ScrollView style={{ alignSelf: "center" }}>
      {/* <Text style={{ textAlign: "center", fontSize: 50 }}>Order-Title</Text> */}
      {images}
    </ScrollView>
  );
}
