/* Enables camera with reording fucntionality, longpress to capture and imagae and 
tap to start / stop recording
*/

import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { AntDesign } from "@expo/vector-icons";
import { Audio } from "expo-av";

export default class Camera1 extends React.Component {
  constructor(props) {
    super(props);
    this.window = Dimensions.get("window");
    this.state = {
      cameraPer: null,
      cameraRollPer: null,
      cameraRef: null,
      audioPer: null,
      isVideoRecording: false,
    };
  }

  async componentDidMount() {
    // const { status } = await Permissions.askAsync(Permissions.CAMERA);
    const { status } = await Camera.requestPermissionsAsync();
    const cameraRoll = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const audioPer = await Audio.requestPermissionsAsync();
    this.setState((state, props) => {
      return {
        cameraPer: status === "granted",
        cameraRollPer: cameraRoll.status === "granted",
        audioPer: audioPer.status === "granted",
      };
    });
  }

  uriToBase64 = async (uri) => {
    let base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  };

  renderVideoRecordIndicator = () => (
    <View style={styles.recordIndicatorContainer}>
      <View style={styles.recordDot} />
      <Text style={styles.recordTitle}>{"Recording..."}</Text>
    </View>
  );

  pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      base64: true,
    });
    if (result.cancelled) {
      return;
    }
    if (result.type == "image") {
      this.tosummary({ type: result.type, base64: result.base64 });
    } else {
      base64 = await this.uriToBase64(result.uri);
      this.tosummary({ type: result.type, base64: base64 });
    }
  };

  handlePhoto = async (cameraRef, data) => {
    if (cameraRef) {
      let photo = await cameraRef.takePictureAsync();

      try {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        let photo_base64 = await this.uriToBase64(photo.uri);
        this.tosummary({ type: "image", base64: photo_base64 });
      } catch (err) {
        //console.log("Photo uploading/conversion failed", err);
      }
    }
  };

  tosummary = (data) => {
    try {
      this.props.sendData(data);
    } catch (err) {
      //console.log("Sending DATA error :\n", err);
    }
  };

  render() {
    let data = "Let it be";
    let cameraRef = null;
    if (
      this.state.cameraPer === null ||
      this.state.cameraRollPer === null ||
      this.state.audioPer === null
    ) {
      return (
        <View>
          <Text>This is null page</Text>
        </View>
      );
    }
    if (
      this.state.cameraPer === false ||
      this.state.cameraRollPer === false ||
      this.state.audioPer === false
    ) {
      return (
        <View>
          <Text>Permissions Denied</Text>
        </View>
      );
    }
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#000000",
          paddingTop: this.window.height / 10,
        }}
      >
        <Camera
          ratio="16:9"
          //useCamera2Api={Platform.OS === "ios" ? false : true}
          //uncomment above line and comment the line below for using camera2API which might not work if you are using 3rd party camera apps.
          useCamera2Api={false} 
          style={{ flex: 1 }}
          type={Camera.Constants.Type.back}
          ref={(ref) => {
            cameraRef = ref;
          }}
        >
          <View style={styles.container}>
            {this.state.isVideoRecording === true
              ? this.renderVideoRecordIndicator()
              : null}
          </View>
        </Camera>
        <View
          style={{
            backgroundColor: "transparent",
            justifyContent: "flex-end",
            paddingBottom: this.window.height / 10,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              bottom: 20,
            }}
          >
            <TouchableOpacity
              style={{
                alignSelf: "center",
                right: -15,
                paddingTop: this.window.height / 15,
              }}
              onPress={async () => {
                //console.log("recording", this.state.isVideoRecording);
                if (!this.state.isVideoRecording) {
                  this.setState({ isVideoRecording: true });
                  let video = await cameraRef.recordAsync({ mute: true });
                  try {
                    //console.log("Video:\n", video);
                    await MediaLibrary.saveToLibraryAsync(video.uri);
                    let video_base64 = await this.uriToBase64(video.uri);
                    this.tosummary({ type: "video", base64: video_base64 });
                  } catch (err) {
                    ////console.log("Video present error ", err);
                  }
                } else {
                  this.setState({ isVideoRecording: false });
                  cameraRef.stopRecording();
                }
              }}
              onLongPress={async () => {
                this.handlePhoto(cameraRef, data);
              }}
            >
              <View
                style={{
                  borderWidth: 2,
                  borderRadius: 25,
                  borderColor: "white",
                  height: 50,
                  width: 50,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    borderWidth: 2,
                    borderRadius: 25,
                    borderColor: "white",
                    height: 40,
                    width: 40,
                    backgroundColor: "white",
                  }}
                ></View>
              </View>
            </TouchableOpacity>
            <View style={{ alignSelf: "flex-end", right: -100, bottom: 10 }}>
              {this.state.isVideoRecording ? null : (
                <TouchableOpacity
                  onPress={async () => {
                    this.pickMedia();
                  }}
                >
                  <AntDesign name="upload" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  recordIndicatorContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 25,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    opacity: 0.7,
  },
  recordTitle: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
  recordDot: {
    borderRadius: 3,
    height: 6,
    width: 6,
    backgroundColor: "#ff0000",
    marginHorizontal: 5,
  },
  text: {
    color: "#fff",
  },
});
