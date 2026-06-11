import {
  ChatMessage,
  type ChatMessageData,
} from "@flama/design-system-mobile/chat-message";
import { Text } from "@flama/design-system-mobile/text";
import * as React from "react";
import { Image, ScrollView, View } from "react-native";

function Avatar() {
  return (
    <Image
      source={require("../assets/dewy.png")}
      className="h-[26px] w-[26px] rounded-full"
    />
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="font-mono text-xs text-muted-foreground">{label}</Text>
      {children}
    </View>
  );
}

const RESULT_MESSAGE: ChatMessageData = {
  kind: "result",
  text: "Sent 25 XRP to Maria.",
  meta: "Settled on the XRP Ledger in 3.7s",
  tx: "0x9f3c…a1b2",
};

const BALANCE_MESSAGE: ChatMessageData = {
  kind: "balance",
  total: 942.76,
  rows: [
    { symbol: "XRP", color: "#14161a", name: "XRP", usd: 744.87, xrp: 1204.51 },
    {
      symbol: "RLUSD",
      color: "#0ca678",
      name: "Ripple USD",
      usd: 197.89,
      xrp: 320.05,
    },
  ],
};

export default function ChatMessageScreen() {
  const [network, setNetwork] = React.useState<string | undefined>(undefined);
  const [status, setStatus] = React.useState<
    "pending" | "approved" | "declined"
  >("pending");
  const [errorHandled, setErrorHandled] = React.useState(false);

  return (
    <ScrollView contentContainerClassName="p-6 gap-6">
      <Section label="user">
        <ChatMessage message={{ role: "user", text: "Send 25 XRP to Maria" }} />
      </Section>

      <Section label="kind: text">
        <ChatMessage
          avatar={<Avatar />}
          message={{
            kind: "text",
            text: "Hi Jordan — what would you like to do?",
          }}
        />
      </Section>

      <Section label="kind: typing">
        <ChatMessage avatar={<Avatar />} message={{ kind: "typing" }} />
      </Section>

      <Section label="kind: questions (interactive)">
        <ChatMessage
          avatar={<Avatar />}
          message={{
            kind: "questions",
            title: "Select network",
            options: ["XRP Ledger", "XRPL EVM"],
            answered: network,
          }}
          onAnswer={setNetwork}
        />
      </Section>

      <Section label="kind: action (interactive)">
        <ChatMessage
          avatar={<Avatar />}
          message={{
            kind: "action",
            actionKind: "send",
            title: "Send payment",
            status,
            rows: [
              { label: "To", value: "Maria", mono: true },
              { label: "Amount", value: "25 XRP", sub: "≈ $15.46" },
              { label: "Network", value: "XRP Ledger" },
            ],
          }}
          onAction={(approved: boolean) =>
            setStatus(approved ? "approved" : "declined")
          }
        />
      </Section>

      <Section label="kind: result">
        <ChatMessage avatar={<Avatar />} message={RESULT_MESSAGE} />
      </Section>

      <Section label="kind: error">
        <ChatMessage
          avatar={<Avatar />}
          message={{
            kind: "error",
            title: "Payment failed",
            text: "You don’t have enough XRP. Try a smaller amount.",
            handled: errorHandled,
          }}
          onErrorAction={() => setErrorHandled(true)}
        />
      </Section>

      <Section label="kind: balance">
        <ChatMessage avatar={<Avatar />} message={BALANCE_MESSAGE} />
      </Section>
    </ScrollView>
  );
}
