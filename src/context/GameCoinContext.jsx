import React, { createContext, useContext, useState, useEffect } from "react";
import { redemptionOptions } from "../data/gamesData";

const GameCoinContext = createContext();

const STORAGE_KEY = "veloop_user_state_v1";

export function GameCoinProvider({ children }) {
  // Load state from localStorage or initialize defaults
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to read storage", e);
    }
    return {
      gameCoins: 20, // Initial balance as required in Section 55.8
      tokens: 60, // Tokens for playing games (costs 20 per play)
      ve: 0,
      sve: 0,
      gems: 0,
      spins: 0,
      seenGuides: {},
      redemptionHistory: [
        {
          id: "initial-demo-1",
          optionId: "gems",
          title: "50 Coins → 5 Gems",
          coinsSpent: 50,
          rewardEarned: "5 Gems",
          timestamp: new Date(Date.now() - 86400000).toLocaleString()
        }
      ]
    };
  });

  // Keep localStorage synchronized
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state", e);
    }
  }, [state]);

  // Centralized Game Coins logic
  const addCoins = (amount) => {
    setState((prev) => ({
      ...prev,
      gameCoins: prev.gameCoins + amount
    }));
  };

  const deductCoins = (amount) => {
    if (state.gameCoins < amount) return false;
    setState((prev) => ({
      ...prev,
      gameCoins: prev.gameCoins - amount
    }));
    return true;
  };

  // Token entry logic
  const deductTokens = (amount = 20) => {
    if (state.tokens < amount) {
      return false;
    }
    setState((prev) => ({
      ...prev,
      tokens: prev.tokens - amount
    }));
    return true;
  };

  const addTokens = (amount) => {
    setState((prev) => ({
      ...prev,
      tokens: prev.tokens + amount
    }));
  };

  const setTestTokens = (amount) => {
    setState((prev) => ({
      ...prev,
      tokens: amount
    }));
  };

  // First-time guide tracking
  const markGuideSeen = (gameId) => {
    setState((prev) => ({
      ...prev,
      seenGuides: {
        ...prev.seenGuides,
        [gameId]: true
      }
    }));
  };

  const hasSeenGuide = (gameId) => {
    return Boolean(state.seenGuides?.[gameId]);
  };

  // Centralized Redemption Engine
  const redeemReward = (optionId) => {
    const option = redemptionOptions.find((opt) => opt.id === optionId);
    if (!option) return { success: false, error: "Option not found" };

    if (state.gameCoins < option.costCoins) {
      return {
        success: false,
        error: `Insufficient Game Coins! You need ${option.costCoins} Coins, but only have ${state.gameCoins}.`
      };
    }

    setState((prev) => {
      const newHistoryItem = {
        id: `redeem-${Date.now()}`,
        optionId: option.id,
        title: option.rateDesc,
        coinsSpent: option.costCoins,
        rewardEarned: `${option.rewardAmount} ${option.rewardUnit}`,
        timestamp: new Date().toLocaleString()
      };

      const updated = {
        ...prev,
        gameCoins: prev.gameCoins - option.costCoins,
        redemptionHistory: [newHistoryItem, ...prev.redemptionHistory]
      };

      // Add to corresponding currency
      if (option.id === "ve") updated.ve = (prev.ve || 0) + option.rewardAmount;
      if (option.id === "sve") updated.sve = (prev.sve || 0) + option.rewardAmount;
      if (option.id === "gems") updated.gems = (prev.gems || 0) + option.rewardAmount;
      if (option.id === "tokens") updated.tokens = (prev.tokens || 0) + option.rewardAmount;
      if (option.id === "spins") updated.spins = (prev.spins || 0) + option.rewardAmount;

      return updated;
    });

    return { success: true, option };
  };

  const resetAllBalances = () => {
    setState({
      gameCoins: 20,
      tokens: 60,
      ve: 0,
      sve: 0,
      gems: 0,
      spins: 0,
      seenGuides: {},
      redemptionHistory: []
    });
  };

  return (
    <GameCoinContext.Provider
      value={{
        gameCoins: state.gameCoins,
        tokens: state.tokens,
        ve: state.ve,
        sve: state.sve,
        gems: state.gems,
        spins: state.spins,
        redemptionHistory: state.redemptionHistory,
        addCoins,
        deductCoins,
        deductTokens,
        addTokens,
        setTestTokens,
        markGuideSeen,
        hasSeenGuide,
        redeemReward,
        resetAllBalances
      }}
    >
      {children}
    </GameCoinContext.Provider>
  );
}

export function useGameCoins() {
  const context = useContext(GameCoinContext);
  if (!context) {
    throw new Error("useGameCoins must be used within a GameCoinProvider");
  }
  return context;
}
