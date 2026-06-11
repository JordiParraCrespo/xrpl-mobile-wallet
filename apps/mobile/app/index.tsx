import { Redirect } from "expo-router";
import { Routes } from "../lib/routes";

export default function Index() {
  // The Drops onboarding Welcome screen is the app's front door.
  return <Redirect href={Routes.Onboarding} />;
}
