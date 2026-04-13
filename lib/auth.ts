import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your_secret_key");

export async function signToken(payload: object) {
    return await new SignJWT(payload as any)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1d")
        .sign(SECRET);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload;
    } catch {
        return null;
    }
}