import * as React from "react";
import { Text, StyleSheet, TouchableWithoutFeedback, View, Image } from "react-native";
import Container from "./components/Container";
import { FontFamily, Color } from "./GlobalStyles";
import { useNavigation } from '@react-navigation/native';
import { StackActions } from '@react-navigation/native';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();

const HomePage = () => {
  const navigation = useNavigation(); // Access navigation object

  const handleScanPress = () => {
    console.log("hello")
    let orders = [];
    let summary = { "_id": "65e896a5edfb9faa551aa1c4", "copyIndex": 0, "created": "5-3-2024", "images": [], "isScanned": false, "items": [], "title": "title1", "userId": "0" };
    let code = 0;
    const pushAction = StackActions.push("Detections", { orders, summary, code, });
    navigation.dispatch(pushAction);
  };
  return (
    <View style={styles.homePage}>
      <TouchableWithoutFeedback onPress={handleScanPress}>
        <View style={[styles.frame, styles.frameLayout]}>
          <View style={[styles.frame1, styles.scanLayout]}>
            <Text style={[styles.scan, styles.scanLayout]}>Scan</Text>
          </View>
          <View style={styles.frame2}>
            <Container />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <View style={[styles.frame3, styles.framePosition1]}>
        <Image
          style={styles.frameIcon}
          contentFit="cover"
          source={require("./assets/frame.png")}
        />
        <View style={styles.frame4}>
          <View style={styles.frame5}>
            <Image
              style={styles.circle3SideBottem}
              contentFit="cover"
              source={require("./assets/circle-3-side-bottem.png")}
            />
            <Image
              style={styles.circle2Mid}
              contentFit="cover"
              source={require("./assets/circle-2-mid.png")}
            />
            <Image
              style={styles.circle1Top}
              contentFit="cover"
              source={require("./assets/circle-1-top.png")}
            />
            <Image
              style={[styles.transparentLogo1Icon, styles.welcomePosition]}
              contentFit="cover"
              source={require("./assets/transparent-logo-1.png")}
            />
            <Text style={[styles.welcome, styles.welcomePosition]}>
              Welcome
            </Text>
            <Text style={[styles.productDetection, styles.productDetectionPosition]}>
              Product Detection
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  frameLayout: {
    width: 4243,
    overflow: "hidden",
  },
  scanLayout: {
    height: 36,
    position: "absolute",
  },
  framePosition1: {
    left: -4003,
    position: "absolute",
  },
  welcomePosition: {
    left: 244,
    position: "absolute",
  },
  framePosition: {
    width: 227,
    left: 0,
    position: "absolute",
    overflow: "hidden",
  },
  scan: {
    marginLeft: 2037.5,
    marginTop: -9,
    left: "50%",
    fontSize: 24,
    fontWeight: "500",
    fontFamily: FontFamily.interMedium,
    color: "#000",
    width: 84,
    textAlign: "left",
    top: 0,
  },
  frame1: {
    top: 77,
    left: 0,
    width: 4243,
    overflow: "hidden",
  },
  frame2: {
    width: 4224,
    height: 74,
    top: 0,
    left: 0,
    position: "absolute",
    overflow: "hidden",
  },
  frame: {
    top: 625,
    height: 124,
    left: -3998,
    position: "absolute",
  },
  frameIcon: {
    width: 24,
    height: 645,
    top: 0,
    left: 0,
    position: "absolute",
    overflow: "hidden",
  },
  circle3SideBottem: {
    left: 425,
    width: 366,
    height: 340,
    top: 369,
    position: "absolute",
  },
  circle2Mid: {
    width: 655,
    height: 648,
    top: 0,
    left: 0,
    position: "absolute",
  },
  circle1Top: {
    top: 16,
    left: 26,
    width: 535,
    height: 515,
    position: "absolute",
  },
  transparentLogo1Icon: {
    width: 221,
    height: 71,
    top: 390,
  },
  welcome: {
    top: 558,
    fontSize: 40,
    fontWeight: "700",
    fontFamily: FontFamily.nunitoBold,
    color: Color.colorWhite,
    width: 196,
    height: 60,
    textAlign: "left",
  },
  frame5: {
    left: 250,
    width: 791,
    height: 2000,
    top: 0,
    position: "absolute",
    overflow: "hidden",
  },
  frame7: {
    top: 691,
    height: 240,
  },
  frame6: {
    height: 931,
    top: 0,
  },
  frame4: {
    left: 3529,
    width: 1041,
    height: 931,
    top: 0,
    position: "absolute",
    overflow: "hidden",
  },
  frame3: {
    top: -345,
    width: 4570,
    height: 931,
    overflow: "hidden",
  },
  homePage: {
    borderRadius: 40,
    backgroundColor: Color.colorWhite,
    shadowColor: "rgba(0, 0, 0, 0.15)",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 75,
    elevation: 75,
    shadowOpacity: 1,
    flex: 1,
    width: "100%",
    height: 812,
    overflow: "hidden",
  },
  productDetection: {
    fontSize: 30,
    color: "#3D85C6",
    fontFamily: FontFamily.nunitoBold,
  },
  productDetectionPosition: {
    marginTop: 890,
    marginLeft: 290,
  },
});

export default HomePage;
