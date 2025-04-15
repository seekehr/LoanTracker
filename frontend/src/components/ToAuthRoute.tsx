import { Navigate } from "react-router-dom";
import { getCookie } from "@/lib/utils";

interface ToAuthRouteProps {
    children: React.ReactNode;
}

export function ToAuthRote({ children }: ToAuthRouteProps) {
    const token = getCookie("token");

    if (token) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}