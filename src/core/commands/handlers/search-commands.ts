import type { CommandDefinition } from "../../../types/command";

export const searchCommand: CommandDefinition = {
  name: "search",
  aliases: ["s", "find"],
  description: "Search for text in logs",
  usage: "/search <term>",
  examples: ["/search error", '/search "user login"'],
  execute: (args, context) => {
    if (args.length === 0) {
      return "Usage: /search <term>";
    }

    const term = args.join(" ");
    context.dispatch({ type: "SET_SEARCH", payload: term });

    const state = context.getState();
    const matchCount = state.searchMatches.length;

    if (matchCount === 0) {
      return `No matches found for "${term}"`;
    }

    context.dispatch({ type: "NAVIGATE_SEARCH", payload: "next" });
    return `Found ${matchCount} match${
      matchCount === 1 ? "" : "es"
    } for "${term}"`;
  },
};

export const searchNextCommand: CommandDefinition = {
  name: "search-next",
  aliases: ["n", "next"],
  description: "Jump to next search result",
  usage: "/search-next",
  examples: ["/search-next", "/n"],
  execute: (_, context) => {
    const state = context.getState();
    if (!state.searchTerm) {
      return "No active search. Use /search <term> first.";
    }
    if (state.searchMatches.length === 0) {
      return "No matches found";
    }
    context.dispatch({ type: "NAVIGATE_SEARCH", payload: "next" });
  },
};

export const searchPrevCommand: CommandDefinition = {
  name: "search-prev",
  aliases: ["p", "prev"],
  description: "Jump to previous search result",
  usage: "/search-prev",
  examples: ["/search-prev", "/p"],
  execute: (_, context) => {
    const state = context.getState();
    if (!state.searchTerm) {
      return "No active search. Use /search <term> first.";
    }
    if (state.searchMatches.length === 0) {
      return "No matches found";
    }
    context.dispatch({ type: "NAVIGATE_SEARCH", payload: "prev" });
  },
};

export const clearSearchCommand: CommandDefinition = {
  name: "clear-search",
  aliases: ["cs"],
  description: "Clear current search",
  usage: "/clear-search",
  examples: ["/clear-search"],
  execute: (_, context) => {
    context.dispatch({ type: "CLEAR_SEARCH" });
    return "Search cleared";
  },
};
