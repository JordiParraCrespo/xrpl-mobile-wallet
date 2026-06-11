import { useAuthState } from "@flama/frontend/react";
import { Redirect } from "expo-router";
import { Routes } from "../lib/routes";

export default function Index() {
  const { isAuthenticated } = useAuthState();
  return <Redirect href={isAuthenticated ? Routes.App : Routes.AuthLogin} />;
}
