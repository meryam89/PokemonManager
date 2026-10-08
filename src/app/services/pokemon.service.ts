
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Generation } from '../models/generation';
import { Pokemon } from '../models/pokemon';

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private http = inject(HttpClient);

  private readonly BASE_URL = 'https://pokeapi.co/api/v2/';

  // Récupérer les générations
  getAllGenerations(): Observable<Generation[]> {
    return this.http
      .get<{ results: Generation[] }>(
        `${this.BASE_URL}generation`
      )
      .pipe(
        map(response => response.results)
      );
  }

  // Récupérer les Pokémon avec pagination
  getAllPokemons(
    limit: number = 20,
    offset: number = 0
  ): Observable<PokemonListResponse> {

    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);

    return this.http.get<PokemonListResponse>(
      `${this.BASE_URL}pokemon`,
      { params }
    );
  }

  // Récupérer les détails d'un Pokémon
  getPokemonDetail(url: string): Observable<Pokemon> {
    return this.http.get<Pokemon>(url);
  }

  // Rechercher un Pokémon par son nom ou son ID
  getPokemonByName(name: string): Observable<Pokemon> {
    return this.http.get<Pokemon>(
      `${this.BASE_URL}pokemon/${encodeURIComponent(name.toLowerCase().trim())}`
    );
  }

  // Récupérer les types disponibles
  getAllTypes(): Observable<{
    results: { name: string; url: string }[]
  }> {
    return this.http.get<{
      results: { name: string; url: string }[]
    }>(
      `${this.BASE_URL}type`
    );
  }

  // Récupérer les Pokémon appartenant à un type
  getPokemonsByType(type: string): Observable<{
    pokemon: {
      pokemon: {
        name: string;
        url: string;
      };
      slot: number;
    }[];
  }> {
    return this.http.get<{
      pokemon: {
        pokemon: {
          name: string;
          url: string;
        };
        slot: number;
      }[];
    }>(
      `${this.BASE_URL}type/${encodeURIComponent(type)}`
    );
  }

// Récupérer les Pokémon d'une génération
  getPokemonsByGeneration(generationName: string): Observable<{
    pokemon_species: {
      name: string;
      url: string;
    }[];
  }> {
    return this.http.get<{
      pokemon_species: {
        name: string;
        url: string;
      }[];
    }>(
      `${this.BASE_URL}generation/${encodeURIComponent(generationName)}`
    );
  }

}
