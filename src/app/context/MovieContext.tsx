'use client';

import React, { createContext, useReducer, ReactNode, useEffect } from "react";

// Local storage key
const STORAGE_KEY = "rfs_media_items";

// MediaItem model (local-first)
export type MediaItem = {
	id: string; // local unique id (uuid or similar)
	tmdbId: number;
	type: "movie" | "tv";
	title: string;
	posterPath: string | null;
	releaseDate: string | null;
	status: "watched" | "watchlist";
	rating: number | null;
	addedAt: string; // ISO date
};

// State tipi
interface MovieState {
	items: MediaItem[];
}

// Action tipi
type MovieAction =
	| { type: "SET_ITEMS"; payload: MediaItem[] }
	| { type: "ADD_ITEM"; payload: MediaItem }
	| { type: "REMOVE_ITEM"; payload: { id: string } }
	| { type: "UPDATE_ITEM"; payload: MediaItem };

// Reducer
const movieReducer = (state: MovieState, action: MovieAction): MovieState => {
	switch (action.type) {
		case "SET_ITEMS":
			return { ...state, items: action.payload };
		case "ADD_ITEM":
			return { ...state, items: [action.payload, ...state.items] };
		case "REMOVE_ITEM":
			return { ...state, items: state.items.filter((i) => i.id !== action.payload.id) };
		case "UPDATE_ITEM":
			return { ...state, items: state.items.map((i) => (i.id === action.payload.id ? action.payload : i)) };
		default:
			return state;
	}
};

// Context oluşturma
const MovieContext = createContext<{
	state: MovieState;
	dispatch: React.Dispatch<MovieAction>;
} | null>(null);

// Provider
const MovieProvider = ({ children }: { children: ReactNode }) => {
	const initialState: MovieState = {
		items: [],
	};

	const [state, dispatch] = useReducer(movieReducer, initialState);

	// Load from localStorage on mount
	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as MediaItem[];
				dispatch({ type: "SET_ITEMS", payload: parsed });
			}
		} catch (err) {
			// ignore parse errors
			console.error("Failed to load media items from localStorage", err);
		}
	}, []);

	// Persist items to localStorage whenever they change
	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
		} catch (err) {
			console.error("Failed to save media items to localStorage", err);
		}
	}, [state.items]);

	return <MovieContext.Provider value={{ state, dispatch }}>{children}</MovieContext.Provider>;
};

export { MovieContext, MovieProvider };
