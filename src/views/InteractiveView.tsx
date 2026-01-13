import { Box, useInput } from "ink";
import { Header } from "../components/Header";
import { Router } from "../components/Router";
import { RouterProvider, useRouter } from "../hooks/useRouter";
import { HomeView } from "./HomeView";
import { WelcomeView } from "./WelcomeView";
import { SettingsView } from "./SettingsView";

function InteractiveContent() {
    const { navigate, currentRoute } = useRouter();

    useInput((input, key) => {
        if (input === 'q' || key.escape) {
            process.exit(0);
        } else if (input === 'h') {
            navigate("home");
        } else if (input === 'i') {
            navigate("input");
        } else if (input === 's') {
            navigate("settings");
        }
    });

    return (
        <Box flexDirection="column" padding={1}>
            <Header />
            <Router
                routes={[
                    { path: "home", component: <HomeView /> },
                    { path: "input", component: <WelcomeView /> },
                    { path: "settings", component: <SettingsView /> },
                ]}
            />
        </Box>
    );
}

export function InteractiveView() {
    return (
        <RouterProvider initialRoute="home">
            <InteractiveContent />
        </RouterProvider>
    );
}
