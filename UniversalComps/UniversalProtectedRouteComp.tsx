// ProtectedRoute.tsx
import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { UniversalGetStoredProfile } from "./UniversalStoredInformationComp";

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

function isLoggedIn(): boolean {
  try {
    const storedProfile = UniversalGetStoredProfile();

    if (Array.isArray(storedProfile)) return storedProfile.length > 0;
    if (typeof storedProfile === "object" && storedProfile !== null) return true;

    return false;
  } catch (err) {
    console.error("StoredProfile parse error:", err);
    return false;
  }
}

export default function ProtectedRoute({
  component: Component,
  ...rest
}: ProtectedRouteProps) {
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn() ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
}
