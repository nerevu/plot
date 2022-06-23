import {scaleTime, scaleUtc} from "d3";
import {initRange, calendar} from "d3-scale";
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import {ScaleQ} from "./quantitative.js";
import {convertDate, createDate, getTimezoneTicker, timeSecond, timezoneMinute, timezoneHour, timezoneDay, timezoneWeek, timezoneMonth, timezoneYear} from "d3-time";

dayjs.extend(advancedFormat)
dayjs.extend(isoWeek)
dayjs.extend(weekOfYear)

// https://github.com/d3/d3-time-format/main/src/locale.js
let dayjsFormats = {
  a: "ddd",
  A: "dddd",
  b: "MMM",
  B: "MMMM",
  c: "MM/DD/YYYY, hh:mm:ss A",
  d: "DD",
  e: "D",
  f: "",
  g: "YY",
  G: "YYYY",
  H: "HH",
  I: "h",
  j: "",
  L: "SSS",
  m: "MM",
  M: "mm",
  p: "A",
  q: "Q",
  Q: "x",
  s: "X",
  S: "ss",
  u: "",
  U: "w",
  V: "W",
  w: "d",
  W: "",
  x: "MM/DD/YYYY",
  X: "hh:mm:ss A",
  y: "YY",
  Y: "YYYY",
  Z: "ZZ",
};

let mapper = char => char == " " ? " " : dayjsFormats[char] || `[${char}]`;

// https://github.com/d3/d3-time-format/blob/main/src/defaultLocale.js
function timezoneFormat(tz) {
  return function (specifier) {
    let formatString = specifier.replaceAll("%", "").split("").map(mapper).join("");
    let f = date => convertDate(date, tz).format(formatString);
    f.toString = () => formatString;
    return f;
  }
}

// https://github.com/d3/d3-scale/blob/main/src/utcTime.js
function scaleTimezone(tz) {
  let domain = [createDate(tz, 2000, 0, 1), createDate(tz, 2000, 0, 2)];

  let [timezoneTicks, timezoneTickInterval] = getTimezoneTicker(tz);

  return initRange.apply(
    calendar(
      timezoneTicks,
      timezoneTickInterval,
      timezoneYear(tz),
      timezoneMonth(tz),
      timezoneWeek(tz),
      timezoneDay(tz),
      timezoneHour(tz),
      timezoneMinute(tz),
      timeSecond,
      timezoneFormat(tz),
    ).domain(domain)
    , arguments
  );
}

function ScaleT(key, scale, channels, options) {
  return ScaleQ(key, scale, channels, options);
}

export function ScaleTime(key, channels, options) {
  return ScaleT(key, scaleTime(), channels, options);
}

export function ScaleUtc(key, channels, options) {
  return ScaleT(key, scaleUtc(), channels, options);
}

export function ScaleTimezone(key, channels, options) {
  return ScaleT(key, scaleTimezone(options.timezone), channels, options);
}
