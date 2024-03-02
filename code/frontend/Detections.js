/*

Description  : When called by Home or orderIndo or summary, 
this manages camera functionality and Request sending fucntionality 


Note : 
If a case arrise like mutiple images or videos , they there must be a way  to remember the previous detections and summary, 
So while adding new image from Order Info page or Home page , 
along with image and order, those components can send some addition data like 
previous detections summary to this detections component and this detections 
component with just the additional data back to summary.js without midfying it
*/

import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  BackHandler,
} from "react-native";
import Camera1 from "./Camera.js";
import Processing from "./Processing";
import { StackActions } from "@react-navigation/native";
import axios from "axios";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    // this.orders = ['waffy','bru','choclate'];
    // this.orders = this.props.order
    // this.previousSummary = this.props.mySummary
    // this.code = this.
    // this.toSummaryRoute = [];
    this.dataFromSummaryRoute = this.props.route.params;
    this.fileToProcess = null;
    this.toSummaryRoute = [];
    this.state = {
      isCamera: 1,
      isProcessing: 0,
      isSummary: 0,
    };
    this.cancelToken = axios.CancelToken.source();
  }

  dataFromCam = (data) => {
    this.fileToProcess = data;
    this.setState((state, prop) => {
      return {
        isCamera: 0,
        isProcessing: 1,
        isSummary: 0,
      };
    });
  };

  dataFromProc = (data) => {
    this.toSummaryRoute = data;
    this.setState((s, p) => {
      return {
        isCamera: 0,
        isProcessing: 0,
        isSummary: 1,
      };
    });
  };

  resetData = () => {
    this.fileToProcess = null;
    this.toSummaryRoute = [];
    this.setState({
      isCamera: 1,
      isProcessing: 0,
      isSummary: 0,
    });
  };

  backAction1 = () => {
    this.cancelToken.cancel();
    const popAction = StackActions.pop(1);
    this.props.navigation.dispatch(popAction);
    return true;
  };
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.backAction1);
  }

  componentWillUnmount() {
    return BackHandler.removeEventListener("hardwareBackPress", this.backAction1);
  }

  render() {
    if (this.state.isCamera) {
      return <Camera1 sendData={this.dataFromCam.bind(this)} />;
    } else if (this.state.isProcessing) {
      return (
        <Processing
          dataFromSummaryRoute={this.dataFromSummaryRoute}
          fileData={this.fileToProcess}
          sendData={this.dataFromProc.bind(this)}
          resetData={this.resetData.bind(this)}
          cancelToken = {this.cancelToken}
          prevProps={this.props}
        />
      );
    } else {
      // console.log("iam enterring DSummary : \n");
      // return (
      //   <Summary
      //     receiveData={{ isPresent: true, data: this.toSummaryRoute }}
      //     backToCam={this.resetData.bind(this)}
      //   />
      // );
    }
    // } else {
    //   return (
    //     <SafeAreaView>
    //       <Summary
    //         receiveData={this.state.data}
    //         backToCam={this.resetData.bind(this)}
    //       />
    //     </SafeAreaView>
    //   );
    // }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

//return (
//   <Summary
//   receiveData={this.state.data}
//   backToCam={this.resetData.bind(this)}
// />
// );
