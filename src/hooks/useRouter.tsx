import { createContext, useContext, useState, ReactNode } from "react";

export type Route = "home" | "input" | "settings";

interface RouterContextType {
    currentRoute: Route;
    navigate: (route: Route) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

interface RouterProviderProps {
    children: ReactNode;
    initialRoute?: Route;
}

export function RouterProvider({ children, initialRoute = "home" }: RouterProviderProps) {
    const [currentRoute, setCurrentRoute] = useState<Route>(initialRoute);

    const navigate = (route: Route) => {
        setCurrentRoute(route);
    };

    return (
        <RouterContext.Provider value={{ currentRoute, navigate }}>
            {children}
        </RouterContext.Provider>
    );
}

export function useRouter() {
    const context = useContext(RouterContext);
    if (!context) {
        throw new Error("useRouter must be used within a RouterProvider");
    }
    return context;
}
