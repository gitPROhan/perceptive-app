/*
This file has the implementation of the settings (quantity editable button)

Used Async storage for the storing the yes/no value of the setting editable option.

*/





import React, { Component } from "react";
import { View, Switch, StyleSheet, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { keyForEditable } from "./Constants";

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditable: false,
    };
  }
//function for updating the boolean option.
  toggleSwitch = async () => {
    try {
      await AsyncStorage.setItem(
        keyForEditable,
        this.state.isEditable == true ? "false" : "true"
      );
    } catch (e) {
      console.log(e);
    }
    this.setState({ isEditable: !this.state.isEditable });
  };

  componentDidMount = async () => {
    //retriving editable quanitty key
    try {
      let value = await AsyncStorage.getItem(keyForEditable);
      value == null
        ? this.setState({ isEditable: false })
        : this.setState({ isEditable: value == "true" ? true : false });
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.container1}>
          <AntDesign
            style={{ paddingRight: 15 }}
            name="edit"
            size={24}
            color="black"
          />
          <Text style={{ fontWeight: "bold", fontSize: 17 }}>
            Quatity Editable
          </Text>
        </View>
        <Switch
          style={{ marginRight: 10 }}
          ios_backgroundColor="#3e3e3e"
          onValueChange={this.toggleSwitch}
          value={this.state.isEditable}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  container1: {
    marginLeft: 10,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});
