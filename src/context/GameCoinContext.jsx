import React, { createContext, useContext, useState, useEffect } from "react";
import { redemptionOptions } from "../data/gamesData";

const GameCoinContext = createContext();

const STORAGE_KEY = "veloop_user_state_v1";

export const DAILY_LOGIN_SCHEDULE = [
  { day: 1, tokens: 20, coins: 0, label: "Day 1" },
  { day: 2, tokens: 25, coins: 0, label: "Day 2" },
  { day: 3, tokens: 30, coins: 5, label: "Day 3" },
  { day: 4, tokens: 35, coins: 0, label: "Day 4" },
  { day: 5, tokens: 40, coins: 10, label: "Day 5" },
  { day: 6, tokens: 50, coins: 0, label: "Day 6" },
  { day: 7, tokens: 100, coins: 25, label: "Day 7 (Jackpot!)" }
];

export const getTodayDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export function GameCoinProvider({ children }) {
  // Load state from localStorage or initialize defaults
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          gameCoins: parsed.gameCoins ?? 20,
          tokens: parsed.tokens ?? 60,
          ve: parsed.ve ?? 0,
          sve: parsed.sve ?? 0,
          gems: parsed.gems ?? 0,
          spins: parsed.spins ?? 0,
          seenGuides: parsed.seenGuides ?? {},
          lastLoginDate: parsed.lastLoginDate ?? null,
          loginStreak: parsed.loginStreak ?? 0,
          redemptionHistory: parsed.redemptionHistory ?? [
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
      }
    } catch (e) {
      console.error("Failed to read storage", e);
    }
    return {
      gameCoins: 20,
      tokens: 60,
      ve: 0,
      sve: 0,
      gems: 0,
      spins: 0,
      seenGuides: {},
      lastLoginDate: null,
      loginStreak: 0,
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

  // Token entry and reward logic
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

  // Daily Login Rewards
  const todayStr = getTodayDateString();
  const isDailyClaimable = state.lastLoginDate !== todayStr;

  const claimDailyReward = () => {
    if (!isDailyClaimable) {
      return { success: false, error: "Already claimed today's reward!" };
    }

    let nextStreak = 1;
    if (state.lastLoginDate) {
      const last = new Date(state.lastLoginDate);
      const today = new Date(todayStr);
      const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        nextStreak = ((state.loginStreak || 0) % 7) + 1;
      } else {
        nextStreak = 1; // streak reset if skipped a day
      }
    } else {
      nextStreak = 1;
    }

    const reward = DAILY_LOGIN_SCHEDULE[nextStreak - 1];

    setState((prev) => ({
      ...prev,
      tokens: prev.tokens + reward.tokens,
      gameCoins: prev.gameCoins + (reward.coins || 0),
      lastLoginDate: todayStr,
      loginStreak: nextStreak
    }));

    return {
      success: true,
      reward,
      newStreak: nextStreak
    };
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
      lastLoginDate: null,
      loginStreak: 0,
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
        loginStreak: state.loginStreak,
        lastLoginDate: state.lastLoginDate,
        isDailyClaimable,
        claimDailyReward,
        dailySchedule: DAILY_LOGIN_SCHEDULE,
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
