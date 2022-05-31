import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export default async function() {
  const data = await d3.csv("data/seattle-weather.csv", d3.autoType);
  return Plot.ruleX(data, {x: "date", strokeOpacity: "precipitation"}).plot();
}
