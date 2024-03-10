import React, { useMemo } from "react";
import { Text, StyleSheet, View } from "react-native";
import { FontSize, FontFamily, Color, Padding } from "../GlobalStyles";

const getStyleValue = (key, value) => {
  if (value === undefined) return;
  return { [key]: value === "unset" ? undefined : value };
};
const TypeText2 = ({
  typeTextPosition,
  typeTextAlignSelf,
  typeTextPaddingHorizontal,
  typeTextPaddingVertical,
  textFontSize,
  textLineHeight,
}) => {
  const typeText2Style = useMemo(() => {
    return {
      ...getStyleValue("position", typeTextPosition),
      ...getStyleValue("alignSelf", typeTextAlignSelf),
      ...getStyleValue("paddingHorizontal", typeTextPaddingHorizontal),
      ...getStyleValue("paddingVertical", typeTextPaddingVertical),
    };
  }, [
    typeTextPosition,
    typeTextAlignSelf,
    typeTextPaddingHorizontal,
    typeTextPaddingVertical,
  ]);

  const textStyle = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize),
      ...getStyleValue("lineHeight", textLineHeight),
    };
  }, [textFontSize, textLineHeight]);

  return (
    <View style={[styles.typetext, typeText2Style]}>
      <Text style={[styles.text, textStyle]}>Text</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    flex: 1,
    fontSize: FontSize.subtitle_size,
    lineHeight: 20,
    fontWeight: "300",
    fontFamily: FontFamily.body,
    color: Color.neutral900,
    textAlign: "left",
  },
  typetext: {
    backgroundColor: Color.colorWhite,
    overflow: "hidden",
    flexDirection: "row",
    paddingHorizontal: Padding.p_base,
    paddingVertical: Padding.p_sm,
    alignSelf: "stretch",
  },
});

export default TypeText2;
