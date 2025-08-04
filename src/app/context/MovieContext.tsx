'use client';

import React, { createContext, useReducer, ReactNode } from "react";

// TMDB'den dönen film verisi tipi
interface Movie {
	id: number;
	title: string;
	original_title: string;
	original_language: string;
	release_date: string;
	popularity: number;
	vote_average: number;
	vote_count: number;
	overview: string;
	poster_path: string;
	adult: boolean;
}
// Kullanıcı listesi tipi
interface CustomList {
	name: string;
	movies: Movie[];
}

// State tipi
interface MovieState {
	movies: Movie[]; // TMDB'den gelen film listesi
	filters: {
		genre: string | null;
		yearRange: [number, number] | null;
	};
	customLists: CustomList[]; // Kullanıcı JSON listeleri
}

// Action tipi
type MovieAction =
	| { type: "SET_MOVIES"; payload: Movie[] }
	| {
			type: "SET_FILTERS";
			payload: { genre: string | null; yearRange: [number, number] | null };
	  }
	| { type: "ADD_TO_LIST"; payload: CustomList };

// Reducer ve diğer kodlar aynı kalır
// Reducer
const movieReducer = (state: MovieState, action: MovieAction): MovieState => {
	switch (action.type) {
		case "SET_MOVIES":
			return { ...state, movies: action.payload };
		case "SET_FILTERS":
			return { ...state, filters: action.payload };
		case "ADD_TO_LIST":
			return { ...state, customLists: [...state.customLists, action.payload] };
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
		movies: [],
		filters: { genre: null, yearRange: null },
		customLists: [],
	};

	const [state, dispatch] = useReducer(movieReducer, initialState);

	return (
		<MovieContext.Provider value={{ state, dispatch }}>
			{children}
		</MovieContext.Provider>
	);
};

export { MovieContext, MovieProvider };
