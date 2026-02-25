import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),
  route("signin", "./routes/signin.tsx"),
  route(":tourSet", "./routes/tour_set.tsx", [
    index("./routes/tours.tsx"),
    route("edit/:tour_id", "./routes/tour.tsx"),
  ]),
] satisfies RouteConfig;
