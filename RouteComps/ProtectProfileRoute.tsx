// ProtectProfileRoute.tsx
import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { GetStoredProfile } from "../StorageComps/StorageCompOne";
import ChatGroupPage from '../_Pages/ChatGroupPage';
import ChatGroupViewPage from '../_Pages/ChatGroupViewPage';

interface Props extends RouteProps {
    component: React.ComponentType<any>;
}

function hasProfile(): boolean {
    try {
        const storedProfile = GetStoredProfile();
        if (Array.isArray(storedProfile) && storedProfile.length > 0) return true;
        if (typeof storedProfile === "object" && storedProfile !== null && Object.keys(storedProfile).length > 0) return true;
        return false;
    } catch (err) {
        console.error("Profile check error:", err);
        return false;
    }
}

export default function ProtectProfileRoute({
    component: Component,
    ...rest
}: Props) {
    return (
        <Route
            {...rest}
            render={(props) =>
                hasProfile() ? <Component {...props} /> : <Redirect to="/profileLogin" />
            }
        />
    );
}

export const getProfileRoutes = () => [
    <ProtectProfileRoute key="chatGroup" exact path="/chatGroup" component={ChatGroupPage} />,
    <ProtectProfileRoute key="chatGroup-view" exact path="/chatGroup/view/:id" component={ChatGroupViewPage} />,
];
