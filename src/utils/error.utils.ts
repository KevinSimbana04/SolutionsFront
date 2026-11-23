import { isAxiosError } from "axios";

export function getErrorMessage(
    error: unknown,
    fallback = "Ocurrió un error inesperado.",
): string {
    if (isAxiosError<{ mensaje?: string }>(error) && error.response?.data?.mensaje) {
        return error.response.data.mensaje;
    }
    return fallback;
}