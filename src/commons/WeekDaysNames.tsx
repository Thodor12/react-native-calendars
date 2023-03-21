import React from 'react';
import {StyleProp, Text, TextStyle} from 'react-native';
import {DateAdapter} from 'src/dateutils';

interface WeekDaysNamesProps {
  adapter: DateAdapter;
  style?: StyleProp<TextStyle>;
}

function WeekDaysNames({adapter, style}: WeekDaysNamesProps): JSX.Element[] {
  const dayNames = adapter.getWeekdays();

  return dayNames.map((day: string, index: number) => (
    <Text
      allowFontScaling={false}
      key={index}
      style={style}
      numberOfLines={1}
      accessibilityLabel={''}
      // accessible={false} // not working
      // importantForAccessibility='no'
    >
      {day}
    </Text>
  ));
}

export default WeekDaysNames;
