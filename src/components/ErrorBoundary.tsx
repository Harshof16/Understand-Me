import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  children: React.ReactNode;
  fallbackLabel?: string;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            {this.props.fallbackLabel ?? "This section couldn't load."}
          </Text>
          <Pressable onPress={this.reset} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F3F1FA",
    alignItems: "center",
  },
  title: { fontSize: 14, fontWeight: "700", color: "#2B2B36", marginBottom: 4 },
  body: { fontSize: 13, color: "#6E6E80", textAlign: "center", marginBottom: 10 },
  button: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: "#6F67C9" },
  buttonText: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },
});
