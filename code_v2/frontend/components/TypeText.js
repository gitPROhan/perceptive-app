import React, { useMemo } from "react";
import { Text, StyleSheet, View } from "react-native";
import TypeText1 from "./TypeText1";
import TypeText2 from "./TypeText2";

const getStyleValue = (key, value) => {
  if (value === undefined) return;
  return { [key]: value === "unset" ? undefined : value };
};
const TypeText = ({
  header,
  typeTextPosition,
  typeTextWidth,
  typeTextHeight,
  headerPadding,
  headerFontSize,
  headerLineHeight,
  cellPaddingHorizontal,
  cellPaddingVertical,
  textFontSize,
  textLineHeight,
  cellPaddingHorizontal1,
  cellPaddingVertical1,
  textFontSize1,
  textLineHeight1,
  cellPaddingHorizontal2,
  cellPaddingVertical2,
  textFontSize2,
  textLineHeight2,
  cellPaddingHorizontal3,
  cellPaddingVertical3,
  textFontSize3,
  textLineHeight3,
  cellPaddingHorizontal4,
  cellPaddingVertical4,
  textFontSize4,
  textLineHeight4,
  cellPaddingHorizontal5,
  cellPaddingVertical5,
  textFontSize5,
  textLineHeight5,
  cellPaddingHorizontal6,
  cellPaddingVertical6,
  textFontSize6,
  textLineHeight6,
  cellPaddingHorizontal7,
  cellPaddingVertical7,
  textFontSize7,
  textLineHeight7,
  cellPaddingHorizontal8,
  cellPaddingVertical8,
  textFontSize8,
  textLineHeight8,
  cellPaddingHorizontal9,
  cellPaddingVertical9,
  textFontSize9,
  textLineHeight9,
  cellPaddingHorizontal10,
  cellPaddingVertical10,
  textFontSize10,
  textLineHeight10,
  cellPaddingHorizontal11,
  cellPaddingVertical11,
  textFontSize11,
  textLineHeight11,
  cellPaddingHorizontal12,
  cellPaddingVertical12,
  textFontSize12,
  textLineHeight12,
  cellPaddingHorizontal13,
  cellPaddingVertical13,
  textFontSize13,
  textLineHeight13,
  cellPaddingHorizontal14,
  cellPaddingVertical14,
  textFontSize14,
  textLineHeight14,
  cellPaddingHorizontal15,
  cellPaddingVertical15,
  textFontSize15,
  textLineHeight15,
}) => {
  const typeTextStyle = useMemo(() => {
    return {
      ...getStyleValue("position", typeTextPosition),
      ...getStyleValue("width", typeTextWidth),
      ...getStyleValue("height", typeTextHeight),
    };
  }, [typeTextPosition, typeTextWidth, typeTextHeight]);

  const typeText1Style = useMemo(() => {
    return {
      ...getStyleValue("padding", headerPadding),
    };
  }, [headerPadding]);

  const headerStyle = useMemo(() => {
    return {
      ...getStyleValue("fontSize", headerFontSize),
      ...getStyleValue("lineHeight", headerLineHeight),
    };
  }, [headerFontSize, headerLineHeight]);

  const typeText2Style = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal),
      ...getStyleValue("paddingVertical", cellPaddingVertical),
    };
  }, [cellPaddingHorizontal, cellPaddingVertical]);

  const textStyle = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize),
      ...getStyleValue("lineHeight", textLineHeight),
    };
  }, [textFontSize, textLineHeight]);

  const typeText2Style1 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal1),
      ...getStyleValue("paddingVertical", cellPaddingVertical1),
    };
  }, [cellPaddingHorizontal1, cellPaddingVertical1]);

  const textStyle1 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize1),
      ...getStyleValue("lineHeight", textLineHeight1),
    };
  }, [textFontSize1, textLineHeight1]);

  const typeText2Style2 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal2),
      ...getStyleValue("paddingVertical", cellPaddingVertical2),
    };
  }, [cellPaddingHorizontal2, cellPaddingVertical2]);

  const textStyle2 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize2),
      ...getStyleValue("lineHeight", textLineHeight2),
    };
  }, [textFontSize2, textLineHeight2]);

  const typeText2Style3 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal3),
      ...getStyleValue("paddingVertical", cellPaddingVertical3),
    };
  }, [cellPaddingHorizontal3, cellPaddingVertical3]);

  const textStyle3 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize3),
      ...getStyleValue("lineHeight", textLineHeight3),
    };
  }, [textFontSize3, textLineHeight3]);

  const typeText2Style4 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal4),
      ...getStyleValue("paddingVertical", cellPaddingVertical4),
    };
  }, [cellPaddingHorizontal4, cellPaddingVertical4]);

  const textStyle4 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize4),
      ...getStyleValue("lineHeight", textLineHeight4),
    };
  }, [textFontSize4, textLineHeight4]);

  const typeText2Style5 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal5),
      ...getStyleValue("paddingVertical", cellPaddingVertical5),
    };
  }, [cellPaddingHorizontal5, cellPaddingVertical5]);

  const textStyle5 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize5),
      ...getStyleValue("lineHeight", textLineHeight5),
    };
  }, [textFontSize5, textLineHeight5]);

  const typeText2Style6 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal6),
      ...getStyleValue("paddingVertical", cellPaddingVertical6),
    };
  }, [cellPaddingHorizontal6, cellPaddingVertical6]);

  const textStyle6 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize6),
      ...getStyleValue("lineHeight", textLineHeight6),
    };
  }, [textFontSize6, textLineHeight6]);

  const typeText2Style7 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal7),
      ...getStyleValue("paddingVertical", cellPaddingVertical7),
    };
  }, [cellPaddingHorizontal7, cellPaddingVertical7]);

  const textStyle7 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize7),
      ...getStyleValue("lineHeight", textLineHeight7),
    };
  }, [textFontSize7, textLineHeight7]);

  const typeText2Style8 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal8),
      ...getStyleValue("paddingVertical", cellPaddingVertical8),
    };
  }, [cellPaddingHorizontal8, cellPaddingVertical8]);

  const textStyle8 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize8),
      ...getStyleValue("lineHeight", textLineHeight8),
    };
  }, [textFontSize8, textLineHeight8]);

  const typeText2Style9 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal9),
      ...getStyleValue("paddingVertical", cellPaddingVertical9),
    };
  }, [cellPaddingHorizontal9, cellPaddingVertical9]);

  const textStyle9 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize9),
      ...getStyleValue("lineHeight", textLineHeight9),
    };
  }, [textFontSize9, textLineHeight9]);

  const typeText2Style10 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal10),
      ...getStyleValue("paddingVertical", cellPaddingVertical10),
    };
  }, [cellPaddingHorizontal10, cellPaddingVertical10]);

  const textStyle10 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize10),
      ...getStyleValue("lineHeight", textLineHeight10),
    };
  }, [textFontSize10, textLineHeight10]);

  const typeText2Style11 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal11),
      ...getStyleValue("paddingVertical", cellPaddingVertical11),
    };
  }, [cellPaddingHorizontal11, cellPaddingVertical11]);

  const textStyle11 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize11),
      ...getStyleValue("lineHeight", textLineHeight11),
    };
  }, [textFontSize11, textLineHeight11]);

  const typeText2Style12 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal12),
      ...getStyleValue("paddingVertical", cellPaddingVertical12),
    };
  }, [cellPaddingHorizontal12, cellPaddingVertical12]);

  const textStyle12 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize12),
      ...getStyleValue("lineHeight", textLineHeight12),
    };
  }, [textFontSize12, textLineHeight12]);

  const typeText2Style13 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal13),
      ...getStyleValue("paddingVertical", cellPaddingVertical13),
    };
  }, [cellPaddingHorizontal13, cellPaddingVertical13]);

  const textStyle13 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize13),
      ...getStyleValue("lineHeight", textLineHeight13),
    };
  }, [textFontSize13, textLineHeight13]);

  const typeText2Style14 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal14),
      ...getStyleValue("paddingVertical", cellPaddingVertical14),
    };
  }, [cellPaddingHorizontal14, cellPaddingVertical14]);

  const textStyle14 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize14),
      ...getStyleValue("lineHeight", textLineHeight14),
    };
  }, [textFontSize14, textLineHeight14]);

  const typeText2Style15 = useMemo(() => {
    return {
      ...getStyleValue("paddingHorizontal", cellPaddingHorizontal15),
      ...getStyleValue("paddingVertical", cellPaddingVertical15),
    };
  }, [cellPaddingHorizontal15, cellPaddingVertical15]);

  const textStyle15 = useMemo(() => {
    return {
      ...getStyleValue("fontSize", textFontSize15),
      ...getStyleValue("lineHeight", textLineHeight15),
    };
  }, [textFontSize15, textLineHeight15]);

  return (
    <View style={[styles.typetext, typeTextStyle]}>
      <TypeText1
        header="Header"
        typeTextPosition="unset"
        typeTextAlignSelf="stretch"
        typeTextPadding={16}
        headerFontSize={16}
        headerLineHeight={20}
      />
      <View style={styles.tableContents}>
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
        <TypeText2
          typeTextPosition="unset"
          typeTextAlignSelf="stretch"
          typeTextPaddingHorizontal="unset"
          typeTextPaddingVertical="unset"
          textFontSize={16}
          textLineHeight={20}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tableContents: {
    alignSelf: "stretch",
    flex: 1,
  },
  typetext: {
    height: 292,
    overflow: "hidden",
  },
});

export default TypeText;
