/*
This file contains the implementation of the home page component of the app.

Up on mounting this component queries all the orders in the database and displays them in floating boxes format.

Functions and thier roles are explained by inline comments. Have a look at the final jsx to understand how the functions are used.


*/
import React, { Component } from "react";
import axios from "axios";
import { header, host, port } from "./Constants";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { StackActions } from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons'

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data1: [], // state array for storing the all the order details in form of an array.
      loaded: false 

    };
  }

//Function for Navigating in to settings page
  callSettings = () => {
    const pushAction = StackActions.push("Settings");
    this.props.navigation.dispatch(pushAction);
  };

  componentDidMount = async () => {
    
    var flaskRouteName = "/getAllOrders";
    var route = header + host + ":" + port + flaskRouteName;

    

    var response = await axios.get(route); // getting data from the database.
    response = response.data;
    var data = [];
    for (var i = 0; i < response.length; i++) {
      var scan;
      if (response[i].isScanned) scan = "Scanned";
      else scan = "Not Scanned";
      var temp = {
        toSend: response[i], // the json object which will be sent to the processing page for detections.
        id: response[i]._id,
        title: response[i].title,
        created: response[i].created,
        status: scan,
        images: response[i].images,
      };
      data.push(temp);
    }
    this.setState({ data1: data, loaded:true }); // finally storing the data in state.

  };

  //Function for intiating the copy order 
  callCopy = async (title) => {
    //staring copy
    var flaskRouteName = "/copyOrder";
    var route = header + host + ":" + port + flaskRouteName;
    var response = await axios.post(route, { title: title });
    //copied
    this.setState({loaded:false})


    //again quering db for orders to reflect changes on UI.
    flaskRouteName = "/getAllOrders";
    route = header + host + ":" + port + flaskRouteName;
    response = await axios.get(route);
    response = response.data;
    var data = [];
    for (var i = 0; i < response.length; i++) {
      if (response[i].isScanned) var scan = "Scanned";
      else var scan = "Not Scanned";
      var temp = {
        toSend: response[i],
        id: response[i]._id,
        title: response[i].title,
        created: response[i].created,
        status: scan,
        images: response[i].images,
      };
      data.push(temp);
    }
    this.setState({ data1: data, loaded:true }); // repeating the intial rendering process for reflecting the changes on UI.
  };


//Function for intiating the delete order 
  callDelete = async (title) => {
    //staring delete
    var flaskRouteName = "/deleteOrder";
    var route = header + host + ":" + port + flaskRouteName;
    var response = await axios.post(route, { title: title });
    //deleted
    this.setState({loaded:false})

    //again quering db for orders to reflect changes on UI.
    flaskRouteName = "/getAllOrders";
    route = header + host + ":" + port + flaskRouteName;
    response = await axios.get(route);
    response = response.data;
    var data = [];
    for (var i = 0; i < response.length; i++) {
      if (response[i].isScanned) var scan = "Scanned";
      else var scan = "Not Scanned";
      var temp = {
        toSend: response[i],
        id: response[i]._id,
        title: response[i].title,
        created: response[i].created,
        status: scan,
        images: response[i].images,
      };
      data.push(temp);
    }
    this.setState({ data1: data,loaded:true }); // repeating the intial rendering process for reflecting the changes on UI.
  };

  //function Sending order Info to the order infos for seeing the order details.code will be ak.
  sendData = async (obj, code) => {
    var flaskRouteName = "/getOrderByTitle";
    var route = header + host + ":" + port + flaskRouteName;
    var response = await axios.post(route, { title: obj.title });

    let summary = response.data;

    this.props.navigation.navigate("OrderInfo", {
      summary,
      code,
    });
  };

  //function for staring a fresh scan of an unscanned order from homepage.
  callCamera = (obj, code) => {
    let orders = [];
    let summary = obj;

    const pushAction = StackActions.push("Detections", {orders, summary, code,});
    this.props.navigation.dispatch(pushAction);

  };

  //function to send images data to imageViewer 
  sendPhotos = (photos) => 
  {
    
    this.props.navigation.navigate("ImageViewer", {
      photos,
    });
  };

  render() {

    if(this.state.loaded===true){
   return(
      <SafeAreaView style={styles.container1}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

        <TouchableOpacity
            style={[styles.button]}
            onPress={() => {
              this.callSettings();
            }}
          >
            <Ionicons name="settings" size={24} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button]}
            onPress=
            { () => this.props.navigation.navigate
              ("New_Order",
              {titles: this.state.data1.map( (value,key) =>{ return value.title} )}
              )
            }
          >
            <Image
              style={styles.icon1}
              source={{ uri: "https://img.icons8.com/ios-filled/2x/plus.png" }}
            />
          </TouchableOpacity>
        </View>
        <FlatList
          enableEmptySections={true}
          data={this.state.data1.sort(function (a, b) {
            var statusA = a.status;
            var statusB = b.status;
            if (a.status == b.status) {
              return -1;
            } else {
              if (a.status == "Scanned") {
                return -1;
              }
              return 1;
            }
          })}
          keyExtractor={(item) => {
            return item.id.toString();
          }}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={styles.container}
                onPress={() => this.sendData(item.toSend, "ak")}
              >
                <View style={styles.RectangleShape}>
                  <View style={styles.box}>
                    <View style={styles.boxContent}>
                      <Text style={styles.text}>{item.title}</Text>
                      <View style={styles.border} />

                      <Text style={styles.text}>{item.created}</Text>
                      <View style={styles.border} />

                      <Text style={styles.text}>
                        Status:
                        <Text
                          style={
                            (styles.text1,
                            {
                              color: item.status == "Scanned" ? "green" : "red",
                            })
                          }
                        >
                          {" "}
                          {item.status}
                        </Text>
                      </Text>
                      <View style={styles.border} />
                      <TouchableOpacity
                        style={[styles.button1]}
                        onPress={() => this.callCamera(item.toSend, 0)}
                      >
                        {item.status == "Scanned" ? <View style= {styles.icon1} ></View> : (
                          <Image
                            style={styles.icon1}
                            source={{
                              uri:
                                "https://img.icons8.com/material/2x/images-folder.png",
                            }}
                          />
                        )}
                      </TouchableOpacity>

                      <View style={styles.Rec}>
                        <TouchableOpacity
                          style={[styles.button]}
                          onPress={() => this.sendPhotos(item.images)}
                        >
                          <Image
                            style={styles.icon}
                            source={{
                              uri:
                                "https://img.icons8.com/fluent-systems-filled/2x/pictures-folder.png",
                            }}
                          />
                          
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={[styles.button]}>
                          <Image
                            style={styles.icon}
                            source={{
                              uri:
                                "https://img.icons8.com/android/2x/share.png",
                            }}
                          />
                        </TouchableOpacity> */}

                        <TouchableOpacity
                          style={[styles.button]}
                          onPress={() => {
                            this.callCopy(item.title);
                          }}
                        >
                          <Image
                            style={styles.icon}
                            source={{
                              uri:
                                "https://img.icons8.com/pastel-glyph/2x/copy--v2.png",
                            }}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.button]}
                          onPress={() => {
                            this.callDelete(item.title);
                          }}
                        >
                          <Image
                            style={styles.icon}
                            source={{
                              uri:
                                "https://img.icons8.com/ios-glyphs/2x/filled-trash.png",
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              //</View>
            );
          }}
        />
      </SafeAreaView>
    );
    }
    else{
      return(

        <View style={[styles.container, styles.horizontal]}>
          <ActivityIndicator color="blue" size="large" />
        </View>
      )
    }
    
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  },
  container1: {
    flex: 1,
  },
  container2: {
    flex: 1,
    width: 70,
    alignSelf: "flex-end",
    padding: 10,
  },
  buttonContainer: {
    flex: 1,
  },

  Rec: {
    width: 280,
    height: 50,
    backgroundColor: "#a9a9a9",
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 7,
  },
  RectangleShape: {
    marginTop: 20,
    width: 300,
    height: 200,
    backgroundColor: "#00bfff", //'#1e90ff',
    padding: 10,
    borderRadius: 7,
  },
  boxContent: {
    height: 100,
  },
  title: {
    fontSize: 18,
    color: "#151515",
  },
  description: {
    fontSize: 15,
    color: "#646464",
  },
  buttons: {
    flexDirection: "row",
  },
  button1: {
    flexDirection: "row",
    padding: 0,
    borderRadius: 10,
    left: 250,
    marginRight: 0,
    marginTop: 5,
  },
  butt: {
    flexDirection: "row",
    alignSelf: "flex-end",
    width: 5,
    //padding:10,
    borderRadius: 20,
    left: 10,
    marginRight: 0,
    marginTop: 5,
    color: "black",
    backgroundColor: "red",
  },
  button: {
    height: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    width: 60,
    marginRight: 5,
    marginTop: 5,
  },
  icon: {
    width: 20,
    height: 20,
  },
  icon1: {
    width: 30,
    height: 30,
  },
  text: {
    padding: 4,
    fontSize: 15,
    fontWeight: "bold",
    color: "black",
  },
  text1: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
  },
  border: {
    borderBottomColor: "white",
    borderBottomWidth: 0.3,
  },
});

export default Home;
