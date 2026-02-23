import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type ViewMode = "server" | "unified";

interface ViewModeContextValue {
    viewMode: ViewMode;
    toggleViewMode: () => void;
    setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextValue>({
    viewMode: "unified",
    toggleViewMode: () => { },
    setViewMode: () => { },
});

const STORAGE_KEY = "clawspace-view-mode";

export function ViewModeProvider({ children }: { children: ReactNode }) {
    const [viewMode, setViewModeState] = useState<ViewMode>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === "server" || stored === "unified") return stored;
        } catch { /* noop */ }
        return "unified";
    });

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, viewMode); } catch { /* noop */ }
    }, [viewMode]);

    const toggleViewMode = () => setViewModeState((m) => (m === "server" ? "unified" : "server"));
    const setViewMode = (mode: ViewMode) => setViewModeState(mode);

    return (
        <ViewModeContext.Provider value={{ viewMode, toggleViewMode, setViewMode }}>
            {children}
        </ViewModeContext.Provider>
    );
}

export function useViewMode() {
    return useContext(ViewModeContext);
}
