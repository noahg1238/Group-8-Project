import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Passkey hashing — SHA-256 + salt; native uses SecureStore, web uses localStorage

const PASSWORD_HASH_KEY = "planb_password_hash";
const PASSWORD_SALT_KEY = "planb_password_salt";
const HAS_PASSWORD_KEY = "planb_has_password";

async function generateSalt(): Promise<string> {
	const array = new Uint8Array(32);
	Crypto.getRandomValues(array);
	return Array.from(array)
		.map(b => b.toString(16).padStart(2, "0"))
		.join("");
}

export async function hashPassword(password: string, salt?: string): Promise<string> {
	if (!salt) {
		salt = await generateSalt();
	}

	// Combine password with salt
	const saltedPassword = password + salt;

	// Hash with SHA-256
	const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, saltedPassword);

	return hash;
}

export async function setupPassword(password: string): Promise<void> {
	const salt = await generateSalt();
	const hash = await hashPassword(password, salt);

	if (Platform.OS === "web") {
		// Web fallback - not secure, just for dev
		localStorage.setItem(PASSWORD_HASH_KEY, hash);
		localStorage.setItem(PASSWORD_SALT_KEY, salt);
		localStorage.setItem(HAS_PASSWORD_KEY, "true");
	} else {
		await SecureStore.setItemAsync(PASSWORD_HASH_KEY, hash);
		await SecureStore.setItemAsync(PASSWORD_SALT_KEY, salt);
		await SecureStore.setItemAsync(HAS_PASSWORD_KEY, "true");
	}
}

// Verify a password
export async function verifyPassword(password: string): Promise<boolean> {
	try {
		// Get stored hash and salt
		let storedHash: string | null;
		let storedSalt: string | null;

		if (Platform.OS === "web") {
			storedHash = localStorage.getItem(PASSWORD_HASH_KEY);
			storedSalt = localStorage.getItem(PASSWORD_SALT_KEY);
		} else {
			storedHash = await SecureStore.getItemAsync(PASSWORD_HASH_KEY);
			storedSalt = await SecureStore.getItemAsync(PASSWORD_SALT_KEY);
		}

		if (!storedHash || !storedSalt) {
			return false;
		}

		// Hash the provided password with stored salt
		const providedHash = await hashPassword(password, storedSalt);

		// Secure comparison (constant time)
		return providedHash === storedHash;
	} catch (error) {
		console.error("[Password] Verification failed:", error);
		return false;
	}
}

export async function hasPassword(): Promise<boolean> {
	try {
		let value: string | null;

		if (Platform.OS === "web") {
			value = localStorage.getItem(HAS_PASSWORD_KEY);
		} else {
			value = await SecureStore.getItemAsync(HAS_PASSWORD_KEY);
		}

		return value === "true";
	} catch (error) {
		console.error("[Password] Status check failed:", error);
		return false;
	}
}

// Change password
export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
	// Verify old password
	const valid = await verifyPassword(oldPassword);
	if (!valid) {
		throw new Error("Old password is incorrect");
	}

	// Setup new password
	await setupPassword(newPassword);
}

export async function removePassword(): Promise<void> {
	if (Platform.OS === "web") {
		localStorage.removeItem(PASSWORD_HASH_KEY);
		localStorage.removeItem(PASSWORD_SALT_KEY);
		localStorage.removeItem(HAS_PASSWORD_KEY);
	} else {
		await SecureStore.deleteItemAsync(PASSWORD_HASH_KEY);
		await SecureStore.deleteItemAsync(PASSWORD_SALT_KEY);
		await SecureStore.deleteItemAsync(HAS_PASSWORD_KEY);
	}
}

export async function checkPasswordStatus(): Promise<{ hasPassword: boolean }> {
	const hasPwd = await hasPassword();
	return { hasPassword: hasPwd };
}

export async function getPasswordSalt(): Promise<string | null> {
	if (Platform.OS === "web") {
		return localStorage.getItem(PASSWORD_SALT_KEY);
	}
	return SecureStore.getItemAsync(PASSWORD_SALT_KEY);
}
