// ProtectedRoute.tsx
import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { GetStoredProfile, GetStoredUser } from "../StorageComps/StorageCompOne";


interface Props extends RouteProps {
  component: React.ComponentType<any>;
}

function isLoggedIn(): boolean {
  try {
    const storedProfile = GetStoredProfile();
    const storedUser = GetStoredUser();

    // Check storedProfile
    if (Array.isArray(storedProfile) && storedProfile.length > 0) return true;
    if (typeof storedProfile === "object" && storedProfile !== null) return true;

    // Check storedUser as fallback
    if (Array.isArray(storedUser) && storedUser.length > 0) return true;
    if (typeof storedUser === "object" && storedUser !== null) return true;

    return false;
  } catch (err) {
    console.error("Authentication check error:", err);
    return false;
  }
}

export default function ProtectedRoute({
  component: Component,
  ...rest
}: Props) {
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn() ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
}