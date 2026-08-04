import { Link, Redirect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { verifyPassword } from "../database/auth";

const PasskeyEntry = () => {
  const [passkey, setPasskey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function checkPasskey() {
    Keyboard.dismiss();
    setVerifying(true);

    const valid = await verifyPassword(passkey);

    if (valid) {
      setSubmitted(true);
    } else {
      setError("Incorrect Passkey");
    }
    setVerifying(false);
  }

  if (submitted) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter the passkey you created</Text>
      <TextInput
        value={passkey}
        onChangeText={(value) => {
          setPasskey(value);
          if (error) setError("");
        }}
        keyboardType="numeric"
        placeholder="Enter passkey"
        placeholderTextColor="#6b7280"
        secureTextEntry={true}
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Link href="/home">
        <Text style={styles.forgotpw}>forgot passkey?</Text>
      </Link>
      {/* Left in as failsafe */}
      <Pressable
        onPress={checkPasskey}
        style={[styles.btncontainer, verifying && styles.btndisabled]}
        disabled={verifying}
      >
        {verifying ? (
          <ActivityIndicator size="small" color="#1F2937" />
        ) : (
          <Text style={styles.btntext}>Submit</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 8,
    /* "items-center rounded-lg" */
  },
  label: {
    marginBottom: 24,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 600,
    textAlign: "center",
    color: "#ffffff",
    /* "text-center text-2xl font-semibold text-white mb-6" */
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 30,
    width: "100%",
    color: "#1F2937",
    backgroundColor: "#F3F4F6",
    /* "mt-4 w-full rounded-full bg-gray-100 px-4 py-3 text-gray-800" */
  },
  error: {
    marginVertical: 8,
    color: "#F87171",
    fontSize: 16,
    /* "my-2 text-red-400" */
  },
  forgotpw: {
    marginTop: 12,
    textAlign: "center",
    color: "#D1D5DB",
    textDecorationLine: "underline",
    /* "mt-3 text-center text-gray-300 underline" */
  },
  btncontainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 32,
    alignItems: "center",
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    /* "mt-8 items-center rounded-full bg-white py-4 px-6" */
  },
  btndisabled: {
    opacity: 0.6,
  },
  btntext: {
    fontWeight: 600,
    color: "#1F2937",
    /* "font-semibold text-slate-800" */
  },
});

export default PasskeyEntry;
