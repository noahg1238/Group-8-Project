import { getPassword } from "@/repositories/databaseFunctions";
import * as Crypto from "expo-crypto";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";

const PasskeyEntry = () => {
  const [hashedUserPasskey, setHashedUserPasskey] = useState<string | null>(
    null,
  );
  const [passkey, setPasskey] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const savedHash = await getPassword();
      setHashedUserPasskey(savedHash);
    })();
  }, []);

  async function checkPasskey() {
    Keyboard.dismiss();

    const inputHashed = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      passkey,
    );

    if (inputHashed === hashedUserPasskey) {
      setSubmitted(true);
    } else {
      setError("Incorrect Passkey");
    }
  }

  if (submitted) {
    return <Redirect href="/home" />;
  }

  return (
    <View className="items-center rounded-lg">
      <Text className="text-center text-2xl font-semibold text-white mb-6">
        Enter the passkey you created
      </Text>
      <TextInput
        value={passkey}
        onChangeText={(value) => {
          setPasskey(value);
          setError("");
        }}
        keyboardType="numeric"
        placeholder="Enter passkey"
        placeholderTextColor="#6b7280"
        secureTextEntry={true}
        className="mt-4 w-full rounded-full bg-gray-100 px-4 py-3 text-gray-800"
      />
      {error && <Text className="my-2 text-red-400">{error}</Text>}
      <Text className="mt-3 text-center text-gray-300 underline">
        forgot passkey?
      </Text>
      <Pressable
        onPress={checkPasskey}
        className="mt-8 items-center rounded-full bg-white py-4 w-2/6"
      >
        <Text className="font-semibold text-[#2a2d40]">Submit</Text>
      </Pressable>
    </View>
  );
};

export default PasskeyEntry;
