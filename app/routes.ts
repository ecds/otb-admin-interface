import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  ...prefix("admin", [
    index("./routes/home.tsx"),
    route(":tourSet", "./routes/tour_set.tsx"),
    route(":tourSet/edit/:tour_id", "./routes/tour.tsx"),
  ]),
] satisfies RouteConfig;
