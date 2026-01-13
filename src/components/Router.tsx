import { ReactNode } from "react";
import { Route, useRouter } from "../hooks/useRouter";

interface RouteConfig {
    path: Route;
    component: ReactNode;
}

interface RouterProps {
    routes: RouteConfig[];
}

export function Router({ routes }: RouterProps) {
    const { currentRoute } = useRouter();

    const activeRoute = routes.find(route => route.path === currentRoute);

    if (!activeRoute) {
        return null;
    }

    return <>{activeRoute.component}</>;
}
